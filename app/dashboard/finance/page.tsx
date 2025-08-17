import { createClient } from '@/lib/supabase/server'
import AddPaymentForm from './AddPaymentForm'

export default async function FinancePage() {
  const supabase = createClient()

  // --- Data Fetching ---
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*, projects(title)')
    .order('created_at', { ascending: false })

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title')
    .order('title', { ascending: true })

  // Calculate total income for the current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data: monthlyPayments, error: monthlyError } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'Paid')
    .gte('paid_at', startOfMonth.toISOString())
    .lte('paid_at', endOfMonth.toISOString())

  const monthlyIncome = monthlyPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Finance Tracker</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">Income (This Month)</h3>
          <p className="text-4xl font-bold mt-2">${monthlyIncome.toFixed(2)}</p>
        </div>
         {/* Other summary cards could go here, e.g., total outstanding */}
      </div>

      {/* Add Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Payment</h2>
        <AddPaymentForm projects={projects || []} />
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold p-6">All Payments</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.projects?.title ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
