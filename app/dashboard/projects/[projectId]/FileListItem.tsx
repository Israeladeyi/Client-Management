'use client'

import { useState } from 'react'
import { getSignedUrl } from './actions'

type File = {
  id: string
  file_name: string
  storage_path: string
  version: string | null
}

export default function FileListItem({ file }: { file: File }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    const result = await getSignedUrl(file.storage_path)
    if (result.error || !result.url) {
      setError(result.error || 'Failed to get download link.')
    } else {
      // This will open the file in a new tab, which works for most browser-viewable files (PDF, PNG).
      // For other files, it will trigger a download.
      window.open(result.url, '_blank')
    }
    setIsLoading(false)
  }

  return (
    <li className="flex items-center justify-between p-2 rounded-md bg-gray-50">
      <div>
        <p className="font-semibold text-gray-800">{file.file_name}</p>
        <p className="text-xs text-gray-500">Version: {file.version || 'N/A'}</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="text-sm text-indigo-600 hover:underline disabled:text-gray-400"
      >
        {isLoading ? 'Generating...' : 'Download'}
      </button>
    </li>
  )
}
