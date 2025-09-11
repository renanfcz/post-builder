// Intelligent webhook response time estimator based on request patterns

interface RequestPattern {
  keywords: string[]
  estimatedTime: number // in seconds
  description: string
}

const REQUEST_PATTERNS: RequestPattern[] = [
  {
    keywords: ['linkedin.com/posts', 'http', 'referência', 'exemplo', 'analise'],
    estimatedTime: 25,
    description: 'Analisando posts de referência...'
  },
  {
    keywords: ['criar', 'post', 'gerar', 'escrever', 'final'],
    estimatedTime: 45,
    description: 'Criando seu post personalizado...'
  },
  {
    keywords: ['revisar', 'melhorar', 'ajustar', 'corrigir'],
    estimatedTime: 15,
    description: 'Revisando e ajustando conteúdo...'
  },
  {
    keywords: ['oi', 'olá', 'começar', 'iniciar'],
    estimatedTime: 5,
    description: 'Iniciando conversa...'
  }
]

export function estimateResponseTime(message: string): {
  estimatedSeconds: number
  progressMessages: string[]
  shouldUseAsync: boolean
} {
  const lowerMessage = message.toLowerCase()
  
  // Find matching pattern
  const matchedPattern = REQUEST_PATTERNS.find(pattern =>
    pattern.keywords.some(keyword => lowerMessage.includes(keyword))
  )
  
  const estimatedSeconds = matchedPattern?.estimatedTime || 10 // default
  const shouldUseAsync = estimatedSeconds > 45
  
  // Generate progress messages based on estimated time
  const progressMessages = generateProgressMessages(estimatedSeconds, matchedPattern?.description || 'Processando...')
  
  return {
    estimatedSeconds,
    progressMessages,
    shouldUseAsync
  }
}

function generateProgressMessages(estimatedSeconds: number, baseDescription: string): string[] {
  const messages = [baseDescription]
  
  if (estimatedSeconds > 15) {
    messages.push('Analisando contexto e padrões...')
  }
  
  if (estimatedSeconds > 30) {
    messages.push('Estruturando resposta personalizada...')
  }
  
  if (estimatedSeconds > 45) {
    messages.push('Finalizando detalhes e otimizando...')
  }
  
  return messages
}

export function getProgressMessage(elapsedSeconds: number, estimatedSeconds: number, messages: string[]): string {
  const progress = Math.min(elapsedSeconds / estimatedSeconds, 0.95) // max 95% during processing
  
  if (progress < 0.3) return messages[0] || 'Iniciando processamento...'
  if (progress < 0.6) return messages[1] || 'Processando...'
  if (progress < 0.9) return messages[2] || 'Quase pronto...'
  
  return messages[3] || 'Finalizando...'
}