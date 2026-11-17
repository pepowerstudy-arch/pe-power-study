'use client'

import Link from 'next/link'
import type { DiagnosticResult } from '@/lib/diagnostic/grade'

export default function DiagnosticResults({ result, onRetake }: { result: DiagnosticResult; onRetake: () => void }) {
  const { summary } = result

  return (
    <div className="space-y-6">
      {/* Overall score + summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Diagnostic Results</h1>
        {result.createdAt && (
          <p className="text-sm text-slate-500 mb-4">Taken {new Date(result.createdAt).toLocaleString()}</p>
        )}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-5xl font-bold text-slate-900">{result.percent}%</span>
          <span className="text-slate-500">{result.score} of {result.total} correct</span>
        </div>
        <p className="text-slate-700">{summary.text}</p>

        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
            Practice weak areas
          </Link>
          <button onClick={onRetake} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:border-slate-400">
            Retake
          </button>
        </div>
      </div>

      {/* Score by topic */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Score by topic</h2>
        <div className="space-y-3">
          {result.topicScores.map((t) => {
            const color = t.percent >= 66 ? 'bg-green-600' : t.percent <= 34 ? 'bg-red-500' : 'bg-amber-500'
            return (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{t.topic}</span>
                  <span className="text-slate-500">{t.correct}/{t.total}</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${color}`} style={{ width: `${Math.max(t.percent, 2)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Question-by-question review */}
      {result.review && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Question review</h2>
          <ol className="space-y-6">
            {result.review.map((r, i) => (
              <li key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.isCorrect ? 'Correct' : r.selectedIndex === null ? 'Skipped' : 'Incorrect'}
                  </span>
                  <span className="text-xs text-slate-500">Q{i + 1} · {r.topic}</span>
                </div>
                <p className="text-slate-900 mb-2">{r.prompt}</p>
                <ul className="text-sm space-y-1 mb-3">
                  {r.choices.map((c, ci) => {
                    const isAnswer = ci === r.correctIndex
                    const isPicked = ci === r.selectedIndex
                    return (
                      <li
                        key={ci}
                        className={
                          isAnswer ? 'text-green-700 font-medium' : isPicked ? 'text-red-600 line-through' : 'text-slate-600'
                        }
                      >
                        {String.fromCharCode(65 + ci)}. {c}
                        {isAnswer && ' ✓'}
                        {isPicked && !isAnswer && ' (your answer)'}
                      </li>
                    )
                  })}
                </ul>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{r.explanation}</p>
                <p className="text-xs text-slate-500 mt-2">Reference: {r.reference}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
