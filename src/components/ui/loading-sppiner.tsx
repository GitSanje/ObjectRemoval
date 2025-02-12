"use client"
import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <Loader2 className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Extracting embeddings from image
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we process your image...</p>
      </div>
    </div>
  )
}