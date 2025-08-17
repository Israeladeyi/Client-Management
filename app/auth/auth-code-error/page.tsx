import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
      <p className="mb-4">The link you used is either expired or invalid.</p>
      <p>Please try signing in again.</p>
      <Link href="/login" className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
        Return to Login
      </Link>
    </div>
  )
}
