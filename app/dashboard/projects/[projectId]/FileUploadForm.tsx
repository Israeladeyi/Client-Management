'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { uploadFile } from './actions'
import { useEffect, useRef } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
    >
      {pending ? 'Uploading...' : 'Upload File'}
    </button>
  )
}

export default function FileUploadForm({ projectId }: { projectId: string }) {
  const initialState = { message: null }
  // Bind the projectId to the server action
  const uploadFileWithId = uploadFile.bind(null, projectId)
  const [state, dispatch] = useFormState(uploadFileWithId, initialState)

  const formRef = useRef<HTMLFormElement>(null)

  // Reset form after successful upload
  useEffect(() => {
    if (state.message?.includes('successfully')) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Choose a file
        </label>
        <input
          type="file"
          id="file"
          name="file"
          required
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
      <div>
        <label htmlFor="version" className="block text-sm font-medium text-gray-700">
          Version (e.g., "Concept 1", "Final")
        </label>
        <input
          type="text"
          id="version"
          name="version"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Optional version name"
        />
      </div>
      <div className="flex items-center gap-4">
        <SubmitButton />
        {state.message && (
          <p
            className={`text-sm ${
              state.message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
