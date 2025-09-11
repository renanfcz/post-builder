// Shared store for async operations
// In production, this should be replaced with Redis or a database

interface AsyncOperation {
  status: 'pending' | 'completed' | 'error'
  result?: any
  error?: string
  startTime: number
}

class AsyncOperationStore {
  private operations = new Map<string, AsyncOperation>()

  set(id: string, operation: AsyncOperation) {
    this.operations.set(id, operation)
  }

  get(id: string): AsyncOperation | undefined {
    return this.operations.get(id)
  }

  delete(id: string): boolean {
    return this.operations.delete(id)
  }

  cleanup() {
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    for (const [id, operation] of this.operations.entries()) {
      if (now - operation.startTime > fiveMinutes) {
        this.operations.delete(id)
      }
    }
  }

  size(): number {
    return this.operations.size
  }
}

// Singleton instance
export const asyncOperationStore = new AsyncOperationStore()

// Export types for reuse
export type { AsyncOperation }