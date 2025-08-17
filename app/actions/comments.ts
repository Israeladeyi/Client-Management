'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(projectId: string, formData: FormData) {
  const supabase = createClient()

  const commentText = formData.get('comment') as string

  if (!commentText || commentText.trim().length === 0) {
    return { error: 'Comment cannot be empty.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to comment.' }
  }

  const { error } = await supabase.from('project_comments').insert({
    project_id: projectId,
    user_id: user.id,
    comment: commentText,
  })

  if (error) {
    console.error('Add Comment Error:', error)
    return { error: 'Failed to add comment.' }
  }

  // Revalidate both potential pages where comments are shown
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/portal/(.*)/projects/${projectId}`) // This is a bit of a hack, might need a more specific path if clientId is available

  return { success: true }
}
