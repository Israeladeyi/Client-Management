import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// Helper function to calculate progress
const getStatusProgress = (status: string | null): number => {
  switch (status) {
    case 'Discovery':
      return 10
    case 'Design':
      return 40
    case 'Revision':
      return 70
    case 'Delivery':
      return 100
    default:
      return 0
  }
}

export default async function ClientProjectsPage({
  params,
}: {
  params: { clientId: string }
}) {
  const supabase = createClient()

  // The layout already secures this page, but it's good practice
  // to scope queries to the specific client.
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', params.clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>
      <div className="space-y-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => {
            const progress = getStatusProgress(project.status)
            return (
import Link from 'next/link'

// ...

              <Link href={`/portal/${params.clientId}/projects/${project.id}`} key={project.id} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
                  <span
                    className="px-3 py-1 text-sm font-semibold rounded-full"
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${progress / 100})`, // Indigo color with opacity
                      color: progress > 50 ? 'white' : 'rgb(79, 70, 229)',
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">You don't have any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
