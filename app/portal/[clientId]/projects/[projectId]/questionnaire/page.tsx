import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuestionnaireForm from './QuestionnaireForm' // This will be created next

export default async function QuestionnairePage({
  params,
}: {
  params: { projectId: string }
}) {
  const supabase = createClient()
  const { projectId } = params

  // Fetch the project to display its title
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('title')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Check if a questionnaire has already been submitted
  const { data: submission, error: submissionError } = await supabase
    .from('questionnaires')
    .select('responses, submitted_at')
    .eq('project_id', projectId)
    .single()

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-2">Brand Discovery Questionnaire</h1>
      <p className="text-lg text-gray-600 mb-6">For project: {project.title}</p>

      {submission ? (
        // If submitted, show the read-only answers
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Thank you for your submission!</h2>
          <p className="text-sm text-gray-500 mb-6">Submitted on: {new Date(submission.submitted_at).toLocaleString()}</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800">What is your target audience?</h3>
              <p className="p-3 bg-gray-50 rounded-md mt-1">{submission.responses.target_audience}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">What are your core brand values?</h3>
              <p className="p-3 bg-gray-50 rounded-md mt-1">{submission.responses.brand_values}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Who are your main competitors?</h3>
              <p className="p-3 bg-gray-50 rounded-md mt-1">{submission.responses.competitors}</p>
            </div>
          </div>
        </div>
      ) : (
        // If not submitted, show the form
        <QuestionnaireForm projectId={projectId} />
      )}
    </div>
  )
}
