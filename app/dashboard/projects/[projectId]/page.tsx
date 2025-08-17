import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FileUploadForm from './FileUploadForm'
import FileListItem from './FileListItem'
import Deliverables from './Deliverables'
import Comments from '@/app/components/Comments'

export default async function ProjectDetailsPage({
  params,
}: {
  params: { projectId: string }
}) {
  const supabase = createClient()
  const { projectId } = params

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  const { data: files, error: filesError } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  const { data: deliverables, error: deliverablesError } = await supabase
    .from('project_deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  const { data: questionnaire } = await supabase
    .from('questionnaires')
    .select('responses, submitted_at')
    .eq('project_id', projectId)
    .single()

  const { data: comments } = await supabase
    .from('project_comments')
    .select('*, users(email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/projects" className="text-sm text-indigo-600 hover:underline mb-2 block">&larr; All Projects</Link>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-lg text-gray-500">Client: {project.clients?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Details & File Upload */}
        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Project Details</h2>
            <p className="text-gray-700">{project.description || 'No description provided.'}</p>
          </div>

          <Deliverables projectId={projectId} deliverables={deliverables || []} />

          {questionnaire && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">Questionnaire Responses</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800">Target Audience</h3>
                  <p className="p-3 bg-gray-50 rounded-md mt-1">{questionnaire.responses.target_audience}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Brand Values</h3>
                  <p className="p-3 bg-gray-50 rounded-md mt-1">{questionnaire.responses.brand_values}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Competitors</h3>
                  <p className="p-3 bg-gray-50 rounded-md mt-1">{questionnaire.responses.competitors}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Upload New File</h2>
            <FileUploadForm projectId={projectId} />
          </div>

          <div className="mt-8">
            <Comments projectId={projectId} comments={comments || []} currentUserEmail={user?.email || ''} />
          </div>
        </div>

        {/* Right Column: File List */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Project Files</h2>
            <ul className="space-y-3">
              {files && files.length > 0 ? (
                files.map((file) => <FileListItem key={file.id} file={file} />)
              ) : (
                <li className="text-center text-gray-500 p-4">No files uploaded yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
