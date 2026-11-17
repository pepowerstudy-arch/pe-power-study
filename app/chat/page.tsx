'use client'

import { useEffect, useState } from 'react'
import { createClient, authHeaders } from '@/utils/supabase'
import ReactMarkdown from 'react-markdown'

export default function ChatPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load profile
      const { data: profileData } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Load recent messages
      const { data: messageData } = await supabase
        .from('Messages')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)
      if (messageData) setMessages(messageData)
    }
    load()
  }, [])

  async function saveMessage(role: string, content: string) {
    if (!userId) return
    await supabase.from('Messages').insert({
      user_id: userId,
      role,
      content,
    })
  }

  async function sendMessage() {
    if (!input.trim() || !userId) return
    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    await saveMessage('user', input)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ messages: newMessages, profile }),
      })

      if (!res.ok) {
        throw new Error('Server error')
      }

      const data = await res.json()
      const reply = data.reply || 'Sorry, the tutor is busy right now. Please try again in a moment.'
      const assistantMessage = { role: 'assistant', content: reply }
      setMessages([...newMessages, assistantMessage])
      await saveMessage('assistant', reply)
    } catch (err) {
      const errorMessage = { role: 'assistant', content: 'The tutor is busy or unavailable right now. Please try again in a moment.' }
      setMessages([...newMessages, errorMessage])
      await saveMessage('assistant', errorMessage.content)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto pt-8 px-4 pb-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">PE Power Practice</h1>
          {profile && (
            <p className="text-sm text-slate-500 mb-4">
              Focusing on: {profile.weak_topics || 'general review'} · Exam: {profile.exam_window || 'not set'}
            </p>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-4 h-[28rem] overflow-y-auto mb-4 shadow-sm">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center mt-8">Ask for a practice question to get started.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="text-slate-400 text-sm">Thinking...</div>}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask for a question or talk through your reasoning..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )
}