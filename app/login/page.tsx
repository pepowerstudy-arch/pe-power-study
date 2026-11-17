'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : 'Check your email to confirm signup')
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Logged in!')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-4"
      />
      <div className="flex gap-2">
        <button onClick={signIn} className="bg-black text-white px-4 py-2">
          Sign In
        </button>
        <button onClick={signUp} className="border px-4 py-2">
          Sign Up
        </button>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}