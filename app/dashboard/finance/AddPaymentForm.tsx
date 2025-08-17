'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { addPayment, type State } from './actions'
import { useEffect, useRef } from 'react'

type Project = {
  id: string
  title: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
    >
      {pending ? 'Saving...' : 'Add Payment'}
    </button>
  )
}

export default function AddPaymentForm({ projects }: { projects: Project[] }) {
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useFormState(addPayment, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.message?.includes('successfully')) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Selection */}
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">Project</label>
          <select
            id="project_id"
            name="project_id"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          {state.errors?.project_id && <p className="mt-1 text-sm text-red-500">{state.errors.project_id[0]}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="amount" name="amount" step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          {state.errors?.amount && <p className="mt-1 text-sm text-red-500">{state.errors.amount[0]}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" name="status" defaultValue="Pending" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>Pending</option>
            <option>Paid</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
          <input type="date" id="due_date" name="due_date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>

      {/* Invoice Link */}
      <div>
        <label htmlFor="invoice_link" className="block text-sm font-medium text-gray-700">Invoice Link (Optional)</label>
        <input type="url" id="invoice_link" name="invoice_link" placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        {state.errors?.invoice_link && <p className="mt-1 text-sm text-red-500">{state.errors.invoice_link[0]}</p>}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton />
        {state.message && (
          <p className={`text-sm ${state.message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
