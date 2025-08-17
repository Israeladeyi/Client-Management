import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClientPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { clientId: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the client record
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, user_id')
    .eq('id', params.clientId)
    .single()

  // If client not found, or if the logged-in user is not linked to this client, deny access.
  if (error || !client || client.user_id !== user.id) {
    notFound() // Renders the not-found.tsx page or a default 404
  }

  const handleLogout = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{client.name} Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <form action={handleLogout}>
            <button
              type="submit"
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
