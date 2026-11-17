'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function Navbar() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex items-center gap-6">
      <Link href="/" className="font-bold text-lg">PE Power Study</Link>
      {user ? (
        <>
          <Link href="/diagnostic" className="hover:text-blue-300">Diagnostic</Link>
          <Link href="/chat" className="hover:text-blue-300">Practice</Link>
          <Link href="/profile" className="hover:text-blue-300">Profile</Link>
          <button onClick={signOut} className="ml-auto text-sm hover:text-blue-300">
            Sign Out
          </button>
        </>
      ) : (
        <Link href="/login" className="ml-auto hover:text-blue-300">Login</Link>
      )}
    </nav>
  )
}