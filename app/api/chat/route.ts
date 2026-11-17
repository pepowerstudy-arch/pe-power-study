import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase-server'
import { summarize, type TopicScore } from '@/lib/diagnostic/grade'

export async function POST(req: Request) {
  // Only signed-in users can use the tutor (protects your Gemini quota).
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const { messages, profile } = await req.json()

  const profileContext = profile
    ? `User profile: Exam window: ${profile.exam_window || 'not set'}. Years of experience: ${profile.years_experience || 'unknown'}. Weak topics (self-reported): ${profile.weak_topics || 'none listed'}. Weekly study hours: ${profile.weekly_hours || 'unknown'}. Notes: ${profile.notes || 'none'}.`
    : 'No profile available yet.'

  const diagnosticContext = await getDiagnosticContext(auth)

  const systemPrompt = `You are a PE Power exam study companion. ${profileContext}

${diagnosticContext}

Generate original practice questions in the style of the NCEES PE Power exam. When explaining answers, cite the relevant NCEES PE Power Reference Handbook section or NEC article (2020) without copying large amounts of text. Be accurate and step-by-step. Prioritize the user's weak topics when generating questions. Do not use LaTeX or dollar signs for math. Write equations and units in plain text.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000) // 60 second timeout

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        }),
      }
    )

    const data = await response.json()
    console.log('Gemini status:', response.status)

    // Rate limits (429) and other Gemini errors return a real error status,
    // so the chat page shows its "tutor is busy" message.
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!response.ok || !reply) {
      console.log('Gemini error:', JSON.stringify(data).slice(0, 500))
      return NextResponse.json({ error: 'Tutor unavailable' }, { status: 503 })
    }

    return NextResponse.json({ reply })
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError'
    return NextResponse.json({ error: timedOut ? 'Tutor timed out' : 'Tutor unavailable' }, { status: timedOut ? 504 : 503 })
  } finally {
    clearTimeout(timeout)
  }
}

// Turns the user's most recent diagnostic into instructions for the tutor.
async function getDiagnosticContext(auth: NonNullable<Awaited<ReturnType<typeof getUserFromRequest>>>) {
  const { data } = await auth.supabase
    .from('diagnostic_results')
    .select('score, total, topic_scores, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) {
    return 'The user has not taken the diagnostic exam yet. If it fits naturally, you may suggest taking it from the Diagnostic page so practice can be targeted.'
  }

  const topics = data.topic_scores as TopicScore[]
  const s = summarize(topics, data.score, data.total)
  const breakdown = topics.map((t) => `${t.topic} ${t.correct}/${t.total}`).join('; ')
  const date = new Date(data.created_at).toLocaleDateString('en-US')

  return `Diagnostic exam result (taken ${date}): ${data.score}/${data.total} overall. By topic: ${breakdown}.
Weak areas: ${s.weaknesses.join(', ') || 'none clearly weak'}. Mixed: ${s.developing.join(', ') || 'none'}. Strong: ${s.strengths.join(', ') || 'none yet'}.
When the user asks for practice without naming a topic, choose mostly from the weak areas, some from the mixed areas, and occasionally from strong areas to keep them fresh. Each topic had only 2-3 diagnostic questions, so treat this as a rough signal and adjust based on how the user does in this conversation.`
}
