// Server component: loads the fixed question bank, strips the answers,
// and hands only the public parts to the interactive exam in the browser.
import DiagnosticExam from '@/components/DiagnosticExam'
import { toPublicQuestions } from '@/lib/diagnostic/questions'

export default function DiagnosticPage() {
  return <DiagnosticExam questions={toPublicQuestions()} />
}
