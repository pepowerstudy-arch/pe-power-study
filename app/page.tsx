import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto pt-24 px-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          PE Power Study Companion
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          An AI study partner that generates original PE Power practice questions,
          walks through solutions with handbook citations, and adapts to your weak areas.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/diagnostic"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-block"
          >
            Take the Diagnostic
          </Link>
          <Link
            href="/chat"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium inline-block"
          >
            Start Practicing
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          New here? The 20-question diagnostic shows where to focus, and the tutor uses it to pick your practice.
        </p>
      </div>
    </div>
  )
}
