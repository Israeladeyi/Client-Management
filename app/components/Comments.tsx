'use client'

import { useTransition } from 'react'
import { addComment } from '@/app/actions/comments'

// The user object from Supabase has a 'user_metadata' property
type User = {
    id: string;
    email?: string;
};

type Comment = {
  id: number
  comment: string
  created_at: string
  users: User | null // This assumes you fetch the related user
}

export default function Comments({
  projectId,
  comments,
  currentUserEmail,
}: {
  projectId: string
  comments: Comment[]
  currentUserEmail: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleAddComment = async (formData: FormData) => {
    startTransition(async () => {
        await addComment(projectId, formData)
        const form = document.getElementById('add-comment-form') as HTMLFormElement
        form?.reset()
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Comments & Updates</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {comments.map((comment) => {
          const isCurrentUser = comment.users?.email === currentUserEmail;
          return (
            <div key={comment.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-lg max-w-lg ${isCurrentUser ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}>
                    <p className="text-sm">{comment.comment}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {comment.users?.email} - {new Date(comment.created_at).toLocaleString()}
                </p>
            </div>
          )
        })}
        {comments.length === 0 && <p className="text-sm text-gray-500 text-center">No comments yet.</p>}
      </div>
      <form id="add-comment-form" action={handleAddComment} className="mt-6 flex gap-2">
        <textarea
          name="comment"
          required
          placeholder="Add a comment or update..."
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          {isPending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
