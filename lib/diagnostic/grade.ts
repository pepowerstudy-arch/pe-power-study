// Grading and plain-language feedback for the diagnostic.
// Server-only: imports the answer key.
import { DIAGNOSTIC_QUESTIONS, QUESTION_SET_VERSION, TOPICS, type Topic } from './questions'

export interface TopicScore {
  topic: Topic
  correct: number
  total: number
  percent: number
}

export interface QuestionReview {
  id: string
  topic: Topic
  prompt: string
  choices: string[]
  selectedIndex: number | null
  correctIndex: number
  isCorrect: boolean
  explanation: string
  reference: string
}

export interface DiagnosticSummary {
  strengths: Topic[]
  developing: Topic[]
  weaknesses: Topic[]
  text: string
}

export interface DiagnosticResult {
  id?: string
  createdAt?: string
  score: number
  total: number
  percent: number
  topicScores: TopicScore[]
  summary: DiagnosticSummary
  review: QuestionReview[] | null // null if the question set has changed since this attempt
}

// answers[i] is the chosen choice index for DIAGNOSTIC_QUESTIONS[i], or null if skipped.
export function gradeAnswers(answers: (number | null)[]): DiagnosticResult {
  const review: QuestionReview[] = DIAGNOSTIC_QUESTIONS.map((q, i) => {
    const raw = answers[i]
    const selectedIndex = typeof raw === 'number' && raw >= 0 && raw < q.choices.length ? raw : null
    return {
      id: q.id,
      topic: q.topic,
      prompt: q.prompt,
      choices: q.choices,
      selectedIndex,
      correctIndex: q.answerIndex,
      isCorrect: selectedIndex === q.answerIndex,
      explanation: q.explanation,
      reference: q.reference,
    }
  })

  const topicScores: TopicScore[] = TOPICS.map((topic) => {
    const inTopic = review.filter((r) => r.topic === topic)
    const correct = inTopic.filter((r) => r.isCorrect).length
    return { topic, correct, total: inTopic.length, percent: pct(correct, inTopic.length) }
  })

  const score = review.filter((r) => r.isCorrect).length
  const total = review.length
  return { score, total, percent: pct(score, total), topicScores, summary: summarize(topicScores, score, total), review }
}

// Rebuild a full result from a saved database row.
export function resultFromRow(row: {
  id: string
  created_at: string
  score: number
  total: number
  topic_scores: TopicScore[]
  answers: (number | null)[]
  question_set_version: string
}): DiagnosticResult {
  const sameSet = row.question_set_version === QUESTION_SET_VERSION
  return {
    id: row.id,
    createdAt: row.created_at,
    score: row.score,
    total: row.total,
    percent: pct(row.score, row.total),
    topicScores: row.topic_scores,
    summary: summarize(row.topic_scores, row.score, row.total),
    review: sameSet ? gradeAnswers(row.answers).review : null,
  }
}

// Strong: 2/3 or better. Weak: 1/3 or worse (or 0/2). Otherwise developing.
// With only 2-3 questions per topic this is a rough signal, and the text says so.
export function summarize(topicScores: TopicScore[], score: number, total: number): DiagnosticSummary {
  const strengths = topicScores.filter((t) => t.percent >= 66).map((t) => t.topic)
  const weaknesses = topicScores.filter((t) => t.percent <= 34).map((t) => t.topic)
  const developing = topicScores
    .filter((t) => !strengths.includes(t.topic) && !weaknesses.includes(t.topic))
    .map((t) => t.topic)

  const overall = pct(score, total)
  const parts: string[] = []
  parts.push(
    `You answered ${score} of ${total} correctly (${overall}%). ` +
      (overall >= 70
        ? 'That is a solid starting point.'
        : overall >= 50
          ? 'You have a workable base with clear areas to build on.'
          : 'That is a normal place to start; the point of this test is to find where to focus.')
  )
  if (strengths.length) parts.push(`Your strongest areas were ${list(strengths)}.`)
  if (weaknesses.length) parts.push(`Focus your next study sessions on ${list(weaknesses)}.`)
  if (developing.length) parts.push(`${list(developing)} ${developing.length === 1 ? 'was' : 'were'} mixed; worth a second look.`)
  parts.push('Each topic had only 2–3 questions, so treat this as a rough map rather than a final verdict.')

  return { strengths, developing, weaknesses, text: parts.join(' ') }
}

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100)
}

function list(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
