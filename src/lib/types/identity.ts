export interface UserIdentity {
  uuid: string
  fingerprint: string
  sessionId: string
  compositeId: string
  createdAt: Date
  lastAccessed: Date
}

export interface IdentityStorage {
  uuid?: string
  fingerprint?: string
  createdAt?: string
  lastAccessed?: string
}

export type IdentityKey = 'uuid' | 'fingerprint' | 'sessionId' | 'compositeId'

export interface IdentityManager {
  getIdentity(): UserIdentity
  refreshSession(): void
  clearIdentity(): void
  isValidIdentity(): boolean
}