import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // --- Data Fetching ---
  // Fetch active clients count
  const { count: activeClientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active')

  // Fetch pending payments sum
  const { data: pendingPayments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'Pending')

  const totalPending = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Fetch upcoming deadlines
  const { data: upcomingProjects, error: projectsError } = await supabase
    .from('projects')
    .select('title, deadline')
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })
    .limit(5)

  // --- Render ---
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">Active Clients</h3>
          <p className="text-4xl font-bold mt-2">{activeClientsCount ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">Pending Payments</h3>
          <p className="text-4xl font-bold mt-2">${totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">Upcoming Deadlines</h3>
          <p className="text-4xl font-bold mt-2">{upcomingProjects?.length ?? 0}</p>
        </div>
      </div>

      {/* Upcoming Deadlines List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Deadlines</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          {upcomingProjects && upcomingProjects.length > 0 ? (
            <ul>
              {upcomingProjects.map((project) => (
                <li key={project.title} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{project.title}</span>
                  <span className="font-medium text-gray-600">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming deadlines.</p>
          )}
        </div>
      </div>
    </div>
  )
}
