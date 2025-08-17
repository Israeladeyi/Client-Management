import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// This page acts as a router for logged-in users.
// It checks if the user is a client and redirects them to their portal.
// Otherwise, it assumes they are the designer and redirects to the dashboard.
export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should not happen if middleware is correct, but as a fallback
    redirect('/login')
  }

  // Check if there is a client record associated with this user ID
  const { data: client, error } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (client) {
    // If a client record is found, redirect to that client's portal
    redirect(`/portal/${client.id}`)
  } else {
    // Otherwise, assume it's the designer and redirect to the dashboard
    redirect('/dashboard')
  }

  // Fallback content while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading your space...</p>
    </div>
  )
}
