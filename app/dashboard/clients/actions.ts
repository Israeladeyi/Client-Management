'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { randomBytes } from 'crypto'

// Define a schema for client data validation using Zod
const ClientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  business_name: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['Lead', 'Discovery', 'Proposal', 'Active', 'Completed', 'Archived']),
})

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    business_name?: string[];
    phone?: string[];
    industry?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function addClient(prevState: State, formData: FormData) {
  const supabase = createClient()

  // 1. Validate form data
  const validatedFields = ClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    business_name: formData.get('business_name'),
    phone: formData.get('phone'),
    industry: formData.get('industry'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create client. Please check the fields.',
    }
  }

  const { name, email, business_name, phone, industry, status } = validatedFields.data;

  // 2. Create a user account for the client
  const password = randomBytes(16).toString('hex')
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This will prevent the user from being automatically logged in on the designer's browser
      data: {
        is_client: true, // You can add custom metadata if needed
      }
    }
  })

  if (signUpError) {
    console.error('Sign Up Error:', signUpError)
    // Check if the error is because the user already exists
    if (signUpError.message.includes('User already registered')) {
        return { message: 'A user with this email already exists. Please use a different email or manage users separately.' };
    }
    return { message: `Failed to create user account: ${signUpError.message}` }
  }

  if (!user) {
    return { message: 'User account was not created successfully. Please try again.' }
  }

  // 3. Insert client data into the database, linking the new user ID
  const { error: insertError } = await supabase.from('clients').insert({
    user_id: user.id,
    name,
    email,
    business_name,
    phone,
    industry,
    status,
  })

  if (insertError) {
    console.error('Database Error:', insertError);
    // TODO: Here you should probably delete the created user to avoid orphans
    // await supabase.auth.admin.deleteUser(user.id)
    return { message: 'Database Error: Failed to Create Client Profile after creating user.' };
  }

  // 4. Revalidate cache and redirect
  revalidatePath('/dashboard/clients')
  redirect('/dashboard/clients')
}
