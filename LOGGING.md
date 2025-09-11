# 🔍 Sistema de Logging Avançado

## 📊 **Visão Geral**

Sistema de logging estruturado usando **Winston** com JSON format para produção e console colorido para desenvolvimento.

## 🚀 **Recursos Implementados**

### **📋 Categorias de Log**
- `[AUTH]` - Autenticação e autorização
- `[API]` - Rotas da API e requisições
- `[WEBHOOK]` - Comunicação com backend externo
- `[POLLING]` - Status checks e polling
- `[ERROR]` - Erros críticos
- `[PERF]` - Performance e timing
- `[DEPLOY]` - Deploy e infraestrutura

### **📈 Níveis de Log**
- `error` - Erros críticos que precisam atenção
- `warn` - Avisos importantes
- `info` - Informações gerais de operação
- `debug` - Detalhes técnicos para debugging

## 💡 **Como Usar**

### **Importação Básica**
```typescript
import { logger, LogLevel } from '@/lib/logger';
```

### **Logging por Categoria**
```typescript
// Webhook logs
logger.webhook(LogLevel.INFO, 'Webhook request started', {
  conversationId: 'conv-123',
  metadata: { url: 'https://api.example.com' }
});

// Polling logs
logger.polling(LogLevel.DEBUG, 'Polling in progress', {
  conversationId: 'conv-123',
  pollCount: 5,
  elapsed: 30000
});

// Performance logs
logger.performance('Database query completed', {
  duration: 150,
  metadata: { query: 'SELECT * FROM users' }
});
```

### **Timing/Performance**
```typescript
const timer = logger.timer();

// ... operação demorada ...

const duration = timer.end('Operation completed', {
  conversationId: 'conv-123',
  metadata: { operation: 'data-processing' }
});
```

### **Request Logging**
```typescript
const requestLogger = logger.request('POST', '/api/webhook-async', {
  conversationId: 'conv-123',
  userAgent: 'PostBuilder/1.0'
});

// Em caso de sucesso
requestLogger.success(200, { responseSize: 1024 });

// Em caso de erro
requestLogger.error(new Error('Connection failed'), 500);
```

## 🔧 **Configuração de Ambiente**

### **Variáveis de Ambiente**
```bash
# Nível de log (error, warn, info, debug)
LOG_LEVEL=info

# Habilitar logs em arquivo (desenvolvimento)
ENABLE_FILE_LOGGING=true

# Environment
NODE_ENV=production
```

## 📁 **Estrutura de Logs**

### **Desenvolvimento**
```
[15:30:45] [WEBHOOK] info: Webhook request started {
  "conversationId": "conv-123",
  "requestId": "req_1234567890_abc123",
  "metadata": { "url": "https://api.example.com" }
}
```

### **Produção (JSON)**
```json
{
  "timestamp": "2025-09-11 15:30:45.123",
  "level": "info",
  "category": "WEBHOOK",
  "message": "Webhook request started",
  "environment": "production",
  "service": "post-builder",
  "context": {
    "conversationId": "conv-123",
    "requestId": "req_1234567890_abc123",
    "metadata": {
      "url": "https://api.example.com"
    }
  }
}
```

## 🔒 **Segurança**

### **Dados Sanitizados**
Automaticamente remove/mascara:
- `password`
- `token`
- `secret`
- `key`
- `authorization`
- `cookie`

### **Exemplo**
```typescript
logger.info('User login attempt', {
  email: 'user@example.com',
  password: 'secret123' // → '[REDACTED]'
});
```

## 📊 **Logs no EasyPanel**

### **Visualização em Produção**
Os logs aparecem no console do EasyPanel em formato JSON estruturado:

```json
{
  "timestamp": "2025-09-11 22:15:30.456",
  "category": "WEBHOOK",
  "level": "info",
  "message": "Webhook accepted request for conversation",
  "context": {
    "conversationId": "conv-abc123",
    "attempt": 1,
    "duration": 250,
    "statusCode": 200
  }
}
```

### **Métricas Importantes Logadas**
- ⏱️ **Duration** - Tempo de cada operação
- 📊 **Status Codes** - Códigos de resposta HTTP
- 🔄 **Retry Attempts** - Tentativas de retry
- 🎯 **Conversation IDs** - Rastreamento de conversas
- 💾 **Request/Response** - Dados de entrada/saída (sanitizados)

## 🚨 **Monitoramento de Erros**

### **Stack Traces Completos**
```typescript
try {
  // operação que pode falhar
} catch (error) {
  logger.error('Operation failed', {
    conversationId: 'conv-123',
    error: error, // Stack trace completo incluído
    metadata: { operation: 'data-sync' }
  });
}
```

### **Context Preservation**
Cada log mantém contexto importante:
- Request ID único
- Conversation ID
- User Agent
- IP Address
- Timing information

## 📈 **Benefícios para Debug**

1. **Rastreamento Completo** - Siga uma conversa do início ao fim
2. **Performance Insights** - Identifique operações lentas
3. **Error Correlation** - Relacione erros com contexto
4. **Real-time Monitoring** - Logs imediatos no EasyPanel
5. **Structured Search** - JSON permite queries avançadas

## 🎯 **Próximos Passos**

- ✅ Sistema base implementado
- ✅ Middleware para APIs
- ✅ WebhookClient com logs detalhados
- 🔄 Monitoramento em produção
- 📊 Dashboards de métricas (futuro)
- 🚨 Alertas baseados em logs (futuro)