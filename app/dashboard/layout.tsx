import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const handleLogout = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden w-64 bg-white shadow-md md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">ClientSys</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/clients"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Clients
          </Link>
          <Link
            href="/dashboard/projects"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Projects
          </Link>
           <Link
            href="/dashboard/finance"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Finance
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white p-4">
          <div>
            <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
          </div>
          <div>
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
    </div>
  )
}
