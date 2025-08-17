'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BUCKET_NAME = 'project-files' // This should ideally be in env variables

export async function uploadFile(
  projectId: string,
  prevState: { message: string | null },
  formData: FormData
) {
  const supabase = createClient()

  const file = formData.get('file') as File
  const version = formData.get('version') as string

  // Basic validation
  if (!file || file.size === 0) {
    return { message: 'Please select a file to upload.' }
  }

  // 1. Upload file to Supabase Storage
  const filePath = `${projectId}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (uploadError) {
    // Handle potential conflict error if file already exists
    if (uploadError.message.includes('duplicate')) {
       return { message: 'A file with this name already exists. Please rename the file or upload a new version.' };
    }
    console.error('Upload Error:', uploadError)
    return { message: 'Failed to upload file to storage.' }
  }

  // 2. Insert file metadata into the database
  const { error: insertError } = await supabase.from('project_files').insert({
    project_id: projectId,
    file_name: file.name,
    storage_path: filePath,
    version: version || null,
  })

  if (insertError) {
    console.error('DB Insert Error:', insertError)
    // TODO: Optionally, delete the uploaded file from storage to prevent orphans
    return { message: 'Failed to save file metadata to database.' }
  }

  // 3. Revalidate the path to show the new file
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { message: 'File uploaded successfully!' }
}

export async function getSignedUrl(storagePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 60) // URL is valid for 60 seconds

  if (error) {
    console.error('Error creating signed URL:', error)
    return { error: 'Could not create download link.' }
  }

  return { url: data.signedUrl }
}
