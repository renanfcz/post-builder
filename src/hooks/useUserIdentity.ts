'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserIdentity } from '../lib/types/identity'
import {
  generateUUID,
  generateFingerprint,
  generateSessionId,
  generateCompositeId,
  saveIdentityToStorage,
  loadIdentityFromStorage,
  clearIdentityStorage,
  isIdentityValid
} from '../lib/utils/identity'

export function useUserIdentity() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const createNewIdentity = useCallback((): UserIdentity => {
    const uuid = generateUUID()
    const fingerprint = generateFingerprint()
    const sessionId = generateSessionId()
    const compositeId = generateCompositeId(uuid, fingerprint, sessionId)
    const now = new Date()

    return {
      uuid,
      fingerprint,
      sessionId,
      compositeId,
      createdAt: now,
      lastAccessed: now
    }
  }, [])

  const loadOrCreateIdentity = useCallback(() => {
    try {
      const stored = loadIdentityFromStorage()
      
      if (stored && stored.uuid && stored.fingerprint) {
        const currentFingerprint = generateFingerprint()
        
        // Usar fingerprint salvo se disponível, senão o atual
        const fingerprint = stored.fingerprint || currentFingerprint
        const sessionId = generateSessionId()
        const compositeId = generateCompositeId(stored.uuid, fingerprint, sessionId)
        
        const restoredIdentity: UserIdentity = {
          uuid: stored.uuid,
          fingerprint,
          sessionId,
          compositeId,
          createdAt: new Date(stored.createdAt || Date.now()),
          lastAccessed: new Date()
        }

        if (isIdentityValid(restoredIdentity)) {
          setIdentity(restoredIdentity)
          saveIdentityToStorage(restoredIdentity)
          return
        }
      }

      // Criar nova identidade se não há válida armazenada
      const newIdentity = createNewIdentity()
      setIdentity(newIdentity)
      saveIdentityToStorage(newIdentity)
    } catch (error) {
      console.warn('Erro ao carregar identidade, criando nova:', error)
      const newIdentity = createNewIdentity()
      setIdentity(newIdentity)
      saveIdentityToStorage(newIdentity)
    } finally {
      setIsLoading(false)
    }
  }, [createNewIdentity])

  const refreshSession = useCallback(() => {
    if (!identity) return

    const newSessionId = generateSessionId()
    const newCompositeId = generateCompositeId(identity.uuid, identity.fingerprint, newSessionId)
    
    const updatedIdentity: UserIdentity = {
      ...identity,
      sessionId: newSessionId,
      compositeId: newCompositeId,
      lastAccessed: new Date()
    }

    setIdentity(updatedIdentity)
    saveIdentityToStorage(updatedIdentity)
  }, [identity])

  const clearIdentity = useCallback(() => {
    clearIdentityStorage()
    setIdentity(null)
    const newIdentity = createNewIdentity()
    setIdentity(newIdentity)
    saveIdentityToStorage(newIdentity)
  }, [createNewIdentity])

  const updateLastAccessed = useCallback(() => {
    if (!identity) return

    const updatedIdentity: UserIdentity = {
      ...identity,
      lastAccessed: new Date()
    }

    setIdentity(updatedIdentity)
    saveIdentityToStorage(updatedIdentity)
  }, [identity])

  useEffect(() => {
    loadOrCreateIdentity()
  }, [loadOrCreateIdentity])

  // Auto-refresh session periodically
  useEffect(() => {
    if (!identity) return

    const interval = setInterval(() => {
      updateLastAccessed()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [identity, updateLastAccessed])

  return {
    identity,
    isLoading,
    refreshSession,
    clearIdentity,
    updateLastAccessed
  }
}