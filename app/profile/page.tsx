'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [examWindow, setExamWindow] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [weakTopics, setWeakTopics] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Please log in first')
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setExamWindow(data.exam_window || '')
        setYearsExperience(data.years_experience?.toString() || '')
        setWeakTopics(data.weak_topics || '')
        setWeeklyHours(data.weekly_hours?.toString() || '')
        setNotes(data.notes || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function saveProfile() {
    setMessage('Saving...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('Profiles')
      .upsert({
        id: user.id,
        exam_window: examWindow,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        weak_topics: weakTopics,
        weekly_hours: weeklyHours ? parseInt(weeklyHours) : null,
        notes: notes,
      })

    setMessage(error ? error.message : 'Profile saved!')
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      
      <label className="block mb-2">When are you planning to take the exam?</label>
      <input
        value={examWindow}
        onChange={(e) => setExamWindow(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="e.g. April 2026"
      />

      <label className="block mb-2">Years of power experience</label>
      <input
        type="number"
        value={yearsExperience}
        onChange={(e) => setYearsExperience(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-2">Weak topics</label>
      <input
        value={weakTopics}
        onChange={(e) => setWeakTopics(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="e.g. Protection, NEC grounding"
      />

      <label className="block mb-2">Weekly study hours</label>
      <input
        type="number"
        value={weeklyHours}
        onChange={(e) => setWeeklyHours(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-2">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-2 mb-4"
        rows={3}
      />

      <button onClick={saveProfile} className="bg-black text-white px-4 py-2">
        Save Profile
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}