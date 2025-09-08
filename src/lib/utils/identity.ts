import { UserIdentity, IdentityStorage } from '../types/identity'

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function generateFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return generateFallbackFingerprint()
  
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Browser fingerprint', 2, 2)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

function generateFallbackFingerprint(): string {
  const fallback = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    Math.random().toString(36)
  ].join('|')
  
  return btoa(fallback).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36)
}

export function generateCompositeId(uuid: string, fingerprint: string, sessionId: string): string {
  const composite = `${uuid.substring(0, 8)}-${fingerprint.substring(0, 8)}-${sessionId.substring(0, 8)}`
  return composite.toLowerCase()
}

export function saveIdentityToStorage(identity: UserIdentity): void {
  const storageData: IdentityStorage = {
    uuid: identity.uuid,
    fingerprint: identity.fingerprint,
    createdAt: identity.createdAt.toISOString(),
    lastAccessed: identity.lastAccessed.toISOString()
  }
  
  localStorage.setItem('user-identity', JSON.stringify(storageData))
}

export function loadIdentityFromStorage(): IdentityStorage | null {
  try {
    const stored = localStorage.getItem('user-identity')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearIdentityStorage(): void {
  localStorage.removeItem('user-identity')
  sessionStorage.clear()
}

export function isIdentityValid(identity: UserIdentity): boolean {
  const now = Date.now()
  const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  return identity.uuid && 
         identity.fingerprint && 
         identity.sessionId && 
         identity.compositeId &&
         (now - identity.createdAt.getTime()) < maxAge
}