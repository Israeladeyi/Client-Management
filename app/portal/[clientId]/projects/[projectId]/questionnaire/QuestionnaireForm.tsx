'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitQuestionnaire, type State } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
    >
      {pending ? 'Submitting...' : 'Submit Questionnaire'}
    </button>
  )
}

export default function QuestionnaireForm({ projectId }: { projectId: string }) {
  const initialState: State = { message: null, errors: {} }
  const submitWithId = submitQuestionnaire.bind(null, projectId)
  const [state, dispatch] = useFormState(submitWithId, initialState)

  // If the form was submitted successfully, the parent page will re-render and show the results.
  // We can show a success message here briefly.
  if (state.message?.includes('successfully')) {
      return <p className="text-lg text-green-600">{state.message}</p>
  }

  return (
    <form action={dispatch} className="space-y-8">
      {/* Question 1 */}
      <div>
        <label htmlFor="target_audience" className="block text-lg font-medium text-gray-800">
          Describe your target audience in detail.
        </label>
        <p className="text-sm text-gray-500 mb-2">Who are they? What are their needs and pain points?</p>
        <textarea
          id="target_audience"
          name="target_audience"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {state.errors?.target_audience && <p className="mt-1 text-sm text-red-500">{state.errors.target_audience[0]}</p>}
      </div>

      {/* Question 2 */}
      <div>
        <label htmlFor="brand_values" className="block text-lg font-medium text-gray-800">
          What are the core values of your brand?
        </label>
        <p className="text-sm text-gray-500 mb-2">What do you stand for? What is the personality of your brand (e.g., playful, serious, luxurious)?</p>
        <textarea
          id="brand_values"
          name="brand_values"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {state.errors?.brand_values && <p className="mt-1 text-sm text-red-500">{state.errors.brand_values[0]}</p>}
      </div>

      {/* Question 3 */}
      <div>
        <label htmlFor="competitors" className="block text-lg font-medium text-gray-800">
          List your main competitors.
        </label>
        <p className="text-sm text-gray-500 mb-2">What do you like or dislike about their branding?</p>
        <textarea
          id="competitors"
          name="competitors"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {state.errors?.competitors && <p className="mt-1 text-sm text-red-500">{state.errors.competitors[0]}</p>}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <SubmitButton />
        {state.message && !state.message.includes('successfully') && (
            <p className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  )
}
