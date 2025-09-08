'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { UserIdentity } from '../types/identity'
import { useUserIdentity } from '../../hooks/useUserIdentity'

interface IdentityContextType {
  identity: UserIdentity | null
  isLoading: boolean
  refreshSession: () => void
  clearIdentity: () => void
  updateLastAccessed: () => void
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const identityData = useUserIdentity()

  return (
    <IdentityContext.Provider value={identityData}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity() {
  const context = useContext(IdentityContext)
  
  if (context === undefined) {
    throw new Error('useIdentity deve ser usado dentro de um IdentityProvider')
  }
  
  return context
}