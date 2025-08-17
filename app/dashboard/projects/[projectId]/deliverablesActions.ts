'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const DeliverableSchema = z.object({
  name: z.string().min(3, { message: 'Deliverable name must be at least 3 characters.' }),
})

export async function addDeliverable(projectId: string, formData: FormData) {
  const supabase = createClient()

  const validatedFields = DeliverableSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    // For simplicity, not returning detailed errors for this form
    return { error: 'Invalid deliverable name.' }
  }

  const { error } = await supabase.from('project_deliverables').insert({
    project_id: projectId,
    name: validatedFields.data.name,
  })

  if (error) {
    console.error('Add Deliverable Error:', error)
    return { error: 'Failed to add deliverable.' }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function toggleDeliverable(id: string, completed: boolean) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_deliverables')
    .update({ completed: !completed })
    .eq('id', id)
    .select('project_id') // Get the project_id to revalidate the path
    .single()

  if (error || !data) {
    console.error('Toggle Deliverable Error:', error)
    return { error: 'Failed to update deliverable.' }
  }

  revalidatePath(`/dashboard/projects/${data.project_id}`)
  return { success: true }
}
