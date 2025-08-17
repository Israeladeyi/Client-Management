import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FileListItem from '@/app/dashboard/projects/[projectId]/FileListItem' // Reusing the component
import Comments from '@/app/components/Comments'

export default async function ClientProjectDetailsPage({
  params,
}: {
  params: { clientId: string; projectId: string }
}) {
  const supabase = createClient()
  const { clientId, projectId } = params

  // The layout already secures this, but fetching the project ensures it exists.
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('title, description')
    .eq('id', projectId)
    .eq('client_id', clientId) // Ensure project belongs to this client
    .single()

  if (projectError || !project) {
    notFound()
  }

  const { data: files, error: filesError } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  const { data: comments } = await supabase
    .from('project_comments')
    .select('*, users(email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>
      </div>

      <Comments projectId={projectId} comments={comments || []} currentUserEmail={user?.email || ''} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Files */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Project Files</h2>
          <ul className="space-y-3">
            {files && files.length > 0 ? (
              files.map((file) => <FileListItem key={file.id} file={file} />)
            ) : (
              <li className="text-center text-gray-500 p-4">No files available for download yet.</li>
            )}
          </ul>
        </div>

        {/* Right Column: Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>
          <div className="space-y-4">
            <Link
              href={`/portal/${clientId}/projects/${projectId}/questionnaire`}
              className="block w-full text-center bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
            >
              View/Fill Questionnaire
            </Link>
            {/* Other actions like 'Provide Feedback' could go here */}
          </div>
        </div>
      </div>
    </div>
  )
}
