import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase-server'
import { gradeAnswers, resultFromRow } from '@/lib/diagnostic/grade'
import { DIAGNOSTIC_QUESTIONS, QUESTION_SET_VERSION } from '@/lib/diagnostic/questions'

// GET /api/diagnostic -> the signed-in user's most recent result (or null)
export async function GET(req: Request) {
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const { data, error } = await auth.supabase
    .from('diagnostic_results')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: data ? resultFromRow(data) : null })
}

// POST /api/diagnostic { answers: (number|null)[] } -> grade, save, return the result
export async function POST(req: Request) {
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const answers = body?.answers
  if (!Array.isArray(answers) || answers.length !== DIAGNOSTIC_QUESTIONS.length) {
    return NextResponse.json({ error: 'Expected an answer for each question' }, { status: 400 })
  }

  const result = gradeAnswers(answers)
  const cleanAnswers = result.review!.map((r) => r.selectedIndex)

  const { data, error } = await auth.supabase
    .from('diagnostic_results')
    .insert({
      user_id: auth.user.id,
      score: result.score,
      total: result.total,
      topic_scores: result.topicScores,
      answers: cleanAnswers,
      question_set_version: QUESTION_SET_VERSION,
    })
    .select('id, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: { ...result, id: data.id, createdAt: data.created_at } })
}
