'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const QuestionnaireSchema = z.object({
  target_audience: z.string().min(10, { message: 'Please provide a detailed answer.' }),
  brand_values: z.string().min(10, { message: 'Please provide a detailed answer.' }),
  competitors: z.string().min(5, { message: 'Please list at least one competitor.' }),
})

export type State = {
  errors?: {
    target_audience?: string[];
    brand_values?: string[];
    competitors?: string[];
  };
  message?: string | null;
};

export async function submitQuestionnaire(
  projectId: string,
  prevState: State,
  formData: FormData
) {
  const supabase = createClient()

  const validatedFields = QuestionnaireSchema.safeParse({
    target_audience: formData.get('target_audience'),
    brand_values: formData.get('brand_values'),
    competitors: formData.get('competitors'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fill out all fields correctly.',
    }
  }

  const { error } = await supabase.from('questionnaires').insert({
    project_id: projectId,
    responses: validatedFields.data,
    submitted_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Database Error:', error)
    if (error.code === '23505') { // unique constraint violation
        return { message: 'A questionnaire has already been submitted for this project.' }
    }
    return { message: 'Database Error: Failed to submit questionnaire.' }
  }

  revalidatePath(`/portal/[clientId]/projects/${projectId}/questionnaire`)
  return { message: 'Questionnaire submitted successfully!' }
}
