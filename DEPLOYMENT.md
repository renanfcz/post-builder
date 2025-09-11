# Deployment Guide - Netlify

## 🚀 Deploy para Netlify

### Pré-requisitos
- Conta no Netlify
- Repositório Git conectado
- Variáveis de ambiente configuradas

### Configuração do Netlify

#### 1. Build Settings
```bash
Build command: npm run build
Publish directory: .next
```

#### 2. Environment Variables
Configure no Netlify UI (`Site Settings > Environment Variables`):

```bash
# Obrigatórias
NEXT_PUBLIC_WEBHOOK_URL=https://your-webhook-service.com/webhook
NEXT_PUBLIC_SECRET=your-secure-secret-key

# Opcionais (já configuradas no netlify.toml)
NODE_ENV=production
ASYNC_MODE=true
POLLING_TIMEOUT=180000
WEBHOOK_TIMEOUT=12000
```

#### 3. Function Settings
O `netlify.toml` já está configurado com:
- **Timeout**: 15 segundos (máximo do Netlify)
- **Redirects**: APIs redirecionadas para functions
- **Headers**: Segurança e cache otimizados

### 🔄 Sistema Assíncrono Implementado

#### Fluxo de Funcionamento:
1. **Frontend** → `/api/webhook-async` (retorna imediatamente com `operation_id`)
2. **Backend** → Processa webhook externo (até 12s)
3. **Frontend** → Polling em `/api/webhook-status/{id}` a cada 1-3s
4. **Resultado** → Exibido quando processamento completa

#### Benefícios:
- ✅ **Zero timeouts 504**
- ✅ **Feedback visual** de progresso
- ✅ **Resiliente** a falhas de rede
- ✅ **3 minutos** de processamento total
- ✅ **Retry automático** com backoff

### 🛠️ Troubleshooting

#### Timeout Issues
Se ainda enfrentar timeouts:
1. Verifique se `WEBHOOK_TIMEOUT=12000` no Netlify
2. Confirme que seu webhook externo responde em <10s
3. Monitore logs no Netlify Functions

#### Polling Problems
- Verifique console do navegador para logs de polling
- Confirme que `/api/webhook-status/*` está funcionando
- Timeout total é 3 minutos, ajuste se necessário

#### Environment Variables
```bash
# Teste local
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3001/webhook

# Produção
NEXT_PUBLIC_WEBHOOK_URL=https://your-webhook.com/webhook
```

### 📊 Monitoramento

#### Logs Importantes:
```bash
# Início da operação
🚀 [WEBHOOK-ASYNC] Operation started: {operationId}

# Polling em progresso
🔄 [POLLING] Poll 1, elapsed: 5s

# Sucesso
✅ [POLLING] Operation completed after 8 polls
```

#### Métricas de Sucesso:
- **Latência inicial**: <500ms para retornar operation_id
- **Taxa de sucesso**: >95% para webhooks <10s
- **Tempo médio**: 15-45s dependendo do webhook

### 🔧 Customização

Para ajustar timeouts, edite:
- `src/lib/constants.ts` → Frontend timeouts
- `src/app/api/webhook-async/route.ts` → Backend timeout
- `netlify.toml` → Function timeout limite

### 🚨 Limites do Netlify

- **Function timeout**: 15s máximo
- **Invocation rate**: 1000/min
- **Bundle size**: 50MB máximo
- **Edge cache**: 1 ano máximo

Deploy com confiança! 🚀