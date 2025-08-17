'use client'

import { useTransition } from 'react'
import { addDeliverable, toggleDeliverable } from './deliverablesActions'

type Deliverable = {
  id: string
  name: string
  completed: boolean
}

export default function Deliverables({
  projectId,
  deliverables,
}: {
  projectId: string
  deliverables: Deliverable[]
}) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: string, completed: boolean) => {
    startTransition(() => {
      toggleDeliverable(id, completed)
    })
  }

  const handleAddDeliverable = async (formData: FormData) => {
    await addDeliverable(projectId, formData)
    // Simple way to clear the form
    const form = document.getElementById('add-deliverable-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Deliverables Checklist</h2>
      <div className="space-y-3">
        {deliverables.map((item) => (
          <div key={item.id} className="flex items-center">
            <input
              id={`deliverable-${item.id}`}
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggle(item.id, item.completed)}
              disabled={isPending}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor={`deliverable-${item.id}`}
              className={`ml-3 text-sm font-medium text-gray-700 ${item.completed ? 'line-through text-gray-500' : ''}`}
            >
              {item.name}
            </label>
          </div>
        ))}
        {deliverables.length === 0 && <p className="text-sm text-gray-500">No deliverables added yet.</p>}
      </div>
      <form id="add-deliverable-form" action={handleAddDeliverable} className="mt-6 flex gap-2">
        <input
          type="text"
          name="name"
          required
          placeholder="Add a new deliverable..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add
        </button>
      </form>
    </div>
  )
}
