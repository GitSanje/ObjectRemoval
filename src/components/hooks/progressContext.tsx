"use client"

import React, { createContext, useState, useContext } from 'react'

type ProgressContextType = {
  progress: number
  setProgress: React.Dispatch<React.SetStateAction<number>>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState(0)

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
