import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <main className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Your Client Management System
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Streamline your client projects, communication, and payments all in one place.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get Started &rarr;
          </Link>
        </div>
      </main>
    </div>
  )
}
