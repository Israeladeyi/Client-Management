'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema for validating payment form data
const PaymentSchema = z.object({
  project_id: z.string().uuid({ message: 'Please select a valid project.' }),
  amount: z.coerce.number().positive({ message: 'Please enter a positive amount.' }),
  status: z.enum(['Pending', 'Paid']),
  due_date: z.string().optional(),
  invoice_link: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
})

export type State = {
  errors?: {
    project_id?: string[];
    amount?: string[];
    status?: string[];
    due_date?: string[];
    invoice_link?: string[];
  };
  message?: string | null;
};

export async function addPayment(prevState: State, formData: FormData) {
  const supabase = createClient()

  // Validate form fields
  const validatedFields = PaymentSchema.safeParse({
    project_id: formData.get('project_id'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    due_date: formData.get('due_date'),
    invoice_link: formData.get('invoice_link'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add payment. Please check the fields.',
    }
  }

  const { project_id, amount, status, due_date, invoice_link } = validatedFields.data

  // Insert data into the database
  const { error } = await supabase.from('payments').insert({
    project_id,
    amount,
    status,
    due_date: due_date || null,
    invoice_link: invoice_link || null,
    // If status is 'Paid', set the paid_at timestamp
    paid_at: status === 'Paid' ? new Date().toISOString() : null,
  })

  if (error) {
    console.error('Database Error:', error)
    return { message: 'Database Error: Failed to add payment.' }
  }

  // Revalidate the finance page and redirect
  revalidatePath('/dashboard/finance')
  return { message: 'Payment added successfully!' }
}
