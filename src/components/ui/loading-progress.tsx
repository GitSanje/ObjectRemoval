"use client"

import { useEffect, useState } from "react"
import { Network } from "lucide-react"

export function LoadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <Network className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Extracting embeddings from image</h2>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-200 dark:bg-blue-800">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-700">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400 transition-all duration-500 ease-out"
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait while we process your image...</p>
      </div>
    </div>
  )
}

