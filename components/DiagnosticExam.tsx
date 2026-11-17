'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, authHeaders } from '@/utils/supabase'
import DiagnosticResults from '@/components/DiagnosticResults'
import type { PublicQuestion } from '@/lib/diagnostic/questions'
import type { DiagnosticResult } from '@/lib/diagnostic/grade'

type Stage = 'loading' | 'signed-out' | 'intro' | 'exam' | 'results'

export default function DiagnosticExam({ questions }: { questions: PublicQuestion[] }) {
  const [stage, setStage] = useState<Stage>('loading')
  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // On load: check sign-in and fetch the most recent attempt, if any.
  useEffect(() => {
    async function load() {
      const { data } = await createClient().auth.getUser()
      if (!data.user) return setStage('signed-out')
      try {
        const res = await fetch('/api/diagnostic', { headers: await authHeaders() })
        const json = await res.json()
        if (res.ok) setLastResult(json.result)
      } catch {
        // Not fatal: they can still take the exam.
      }
      setStage('intro')
    }
    load()
  }, [])

  function start() {
    setAnswers(questions.map(() => null))
    setCurrent(0)
    setError('')
    setStage('exam')
  }

  function choose(choiceIndex: number) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? choiceIndex : a)))
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ answers }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not save your results')
      setLastResult(json.result)
      setStage('results')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Your answers are still here; try submitting again.')
    } finally {
      setSubmitting(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto pt-8 px-4 pb-16">{children}</div>
    </div>
  )

  if (stage === 'loading') return shell(<p className="text-slate-500">Loading...</p>)

  if (stage === 'signed-out')
    return shell(
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-slate-700 mb-4">Please log in to take the diagnostic.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium inline-block">
          Log in
        </Link>
      </div>
    )

  if (stage === 'results' && lastResult)
    return shell(<DiagnosticResults result={lastResult} onRetake={start} />)

  if (stage === 'intro')
    return shell(
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">PE Power Diagnostic</h1>
        <p className="text-slate-600 mb-4">
          {questions.length} multiple-choice questions across the main PE Power topics. There is no time limit;
          have your calculator, handbook and code book handy, just like exam day. At the end you&apos;ll see your
          score by topic, and the tutor will use your results to focus your practice.
        </p>
        {lastResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-sm text-slate-700">
            Last attempt: <strong>{lastResult.score}/{lastResult.total}</strong> ({lastResult.percent}%)
            {lastResult.createdAt && ` on ${new Date(lastResult.createdAt).toLocaleDateString()}`}.{' '}
            <button onClick={() => setStage('results')} className="text-blue-600 hover:underline font-medium">
              View results
            </button>
          </div>
        )}
        <button onClick={start} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
          {lastResult ? 'Retake diagnostic' : 'Start diagnostic'}
        </button>
      </div>
    )

  // stage === 'exam'
  const q = questions[current]
  const answeredCount = answers.filter((a) => a !== null).length
  const unanswered = questions.length - answeredCount
  const isLast = current === questions.length - 1

  return shell(
    <>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">{q.topic}</p>
        <p className="text-slate-900 text-lg mb-5">{q.prompt}</p>

        <div className="space-y-2">
          {q.choices.map((choice, i) => {
            const selected = answers[current] === i
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  selected ? 'border-blue-600 bg-blue-50 text-slate-900' : 'border-slate-300 hover:border-slate-400 text-slate-700'
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                {choice}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-60"
          >
            {submitting ? 'Grading...' : 'Submit exam'}
          </button>
        ) : (
          <button onClick={() => setCurrent((c) => c + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            Next
          </button>
        )}
      </div>

      {isLast && unanswered > 0 && (
        <p className="text-sm text-amber-700 mt-3">
          You have {unanswered} unanswered question{unanswered === 1 ? '' : 's'}; they will be marked wrong. Use Back to review.
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </>
  )
}
