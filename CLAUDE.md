# CLAUDE.md

This file contains project-specific information for Claude Code.

## Project Information
- **Project Name**: Post Builder
- **Platform**: Node.js/Next.js 15+ (App Router)
- **Language**: TypeScript
- **Description**: Uma ferramenta web frontend minimalista para criação de posts do LinkedIn através de conversas com agente IA via webhook

## Visão Geral
Uma ferramenta web frontend minimalista para criação de posts do LinkedIn através de conversas com agente IA via webhook. O usuário interage com uma interface de chat e visualiza o post gerado em um preview de texto simples.

## Funcionalidades Principais

### Interface Conversacional
- Chat interface limpa e intuitiva
- Comunicação com agente IA via webhook
- Coleta informações sobre objetivo, público-alvo, tom, etc.
- Preview de texto simples com botão de cópia

### Tipo de Post
- Exclusivamente LinkedIn: Posts profissionais otimizados
- Diferentes formatos: posts de reflexão, anúncios, conteúdo educacional
- Suporte a hashtags e CTAs específicos do LinkedIn

### Recursos da Interface
- Preview em tempo real do post sendo construído
- Botão "Copiar para Clipboard"
- Estados de loading durante comunicação com webhook
- Histórico da conversa na sessão atual

## Stack Técnica

### Frontend
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS para estilização
- Shadcn/ui para componentes
- Lucide React para ícones

### Comunicação
- Fetch API para webhooks
- TanStack Query para cache e data fetching
- Server Actions para mutations (futuro)

## Estrutura do Projeto
```
post-builder/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── components/
│   │       ├── chat/
│   │       │   ├── ChatInterface.tsx
│   │       │   ├── MessageBubble.tsx
│   │       │   ├── InputArea.tsx
│   │       │   └── LoadingIndicator.tsx
│   │       ├── post-preview/
│   │       │   ├── PostPreview.tsx
│   │       │   └── CopyButton.tsx
│   │       └── ui/ (shadcn components)
│   │           ├── button.tsx
│   │           ├── input.tsx
│   │           ├── card.tsx
│   │           └── badge.tsx
│   ├── components/ (shared UI components)
│   ├── lib/
│   │   ├── webhook/
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── types/
│   │   │   ├── post.ts
│   │   │   └── chat.ts
│   │   ├── utils/
│   │   │   ├── clipboard.ts
│   │   │   └── formatting.ts
│   │   └── constants.ts
│   └── hooks/
│       ├── useChat.ts
│       ├── useWebhook.ts
│       └── useClipboard.ts
└── public/
```

## Design da Interface
Layout responsivo com transições:
- **Estado Inicial**: Título centralizado com input principal
- **Estado Chat**: Layout expansível com área de conversa
- **Estado Preview**: Duas colunas (chat + preview) quando post gerado

## Fluxo de Funcionamento
User Input → ChatInterface → WebhookClient → AI Agent → Response Processing → State Update → PostPreview

## Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

---

# 🚀 Resumo Executivo: Melhores Práticas Next.js 2025

## 📋 TL;DR - Práticas Essenciais

### **🏗️ Estrutura & Configuração**
- **Use o diretório `src/`** para organizar código fonte
- **App Router é obrigatório** - Pages Router está depreciado
- **Turbopack como bundler padrão** para builds 700% mais rápidos
- **TypeScript em modo strict** com configurações rigorosas
- **Estrutura baseada em features** para escalabilidade

### **⚡ Performance (Core Web Vitals)**
- **Hybrid Rendering**: Combine SSR, SSG, ISR conforme necessário
- **Server Components por padrão** - Client Components apenas quando necessário
- **next/image para todas as imagens** com lazy loading automático
- **Code splitting dinâmico** com `next/dynamic`
- **Streaming com Suspense** para carregamento progressivo

### **🎯 Estado & Dados**
- **Zustand para estado global** (substituiu Redux na maioria dos casos)
- **TanStack Query para data fetching** com cache inteligente
- **Server Actions para mutations** em vez de API routes tradicionais
- **Context API apenas para estado local** específico

### **🎨 Styling**
- **Tailwind CSS como padrão** com configuração estendida
- **CSS Modules para estilos específicos** de componentes
- **Shadcn/ui para design system** consistente
- **Otimização de fonts** com `next/font`

### **🔍 SEO & Metadata**
- **Metadata API nativa** para meta tags dinâmicas
- **Structured data (JSON-LD)** para rich snippets
- **Sitemap e robots.txt dinâmicos**
- **OpenGraph e Twitter Cards** otimizados

### **🧪 Testing**
- **Vitest + React Testing Library** para unit tests
- **Playwright para E2E tests** em Server Components
- **80%+ de cobertura de testes** como meta
- **CI/CD automatizado** com GitHub Actions

---

## 🎯 Principais Mudanças de 2025

### **✅ Adote Imediatamente**
1. **App Router** com layouts aninhados e route groups
2. **React 19 + Server Components** para melhor performance
3. **TypeScript strict mode** com tipos rigorosos
4. **Zustand** em vez de Redux para projetos novos
5. **Server Actions** para operações de dados

### **🚫 Evite/Substitua**
1. **Pages Router** → App Router
2. **Redux** → Zustand (para projetos pequenos/médios)
3. **API Routes tradicionais** → Server Actions
4. **CSS-in-JS** → Tailwind CSS
5. **Bibliotecas pesadas de estado** → Built-ins do React

---

## 🛠️ Stack Tecnológica Recomendada 2025

```
Frontend Framework: Next.js 15+
Language: TypeScript (strict mode)
Styling: Tailwind CSS + Shadcn/ui
State Management: Zustand + TanStack Query
Testing: Vitest + Playwright
CI/CD: GitHub Actions
Deployment: Vercel (recomendado)
```

---

## 📊 Checklist de Performance

### **🟢 Essencial (Impacto Alto)**
- [ ] **Server Components por padrão** - reduz JavaScript no cliente
- [ ] **next/image com priority** para imagens above-the-fold
- [ ] **Streaming com Suspense** para carregamento progressivo
- [ ] **Code splitting automático** do Next.js ativado
- [ ] **Turbopack em produção** para builds mais rápidos

### **🟡 Importante (Impacto Médio)**
- [ ] **Bundle analysis** mensal para identificar gargalos
- [ ] **Preload de recursos críticos** (fonts, APIs)
- [ ] **Lazy loading** para componentes pesados
- [ ] **Cache estratégico** com ISR onde apropriado
- [ ] **Otimização de fonts** com display: swap

### **🔵 Bônus (Impacto Baixo)**
- [ ] **Edge Functions** para latência reduzida
- [ ] **Service Workers** para cache offline
- [ ] **Web Workers** para operações pesadas
- [ ] **Micro-frontend** para aplicações enterprise

---

## 🎪 Padrões de Código 2025

### **Componentes Server vs Client**
```tsx
// ✅ Server Component (padrão)
async function ProductList() {
  const products = await fetchProducts()
  return <div>{products.map(...)}</div>
}

// ✅ Client Component (apenas quando necessário)
'use client'
function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### **Gerenciamento de Estado Simplificado**
```tsx
// ✅ Zustand para estado global
const useAuthStore = create((set) => ({
  user: null,
  login: async (credentials) => {
    const user = await api.login(credentials)
    set({ user })
  }
}))

// ✅ TanStack Query para dados de API
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000
  })
}
```

### **Estrutura de Arquivos Feature-Based**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── products/
├── shared/
│   ├── components/ui/
│   └── lib/
└── app/
```

---

## 🚨 Armadilhas Comuns a Evitar

### **❌ Erros Críticos**
1. **Usar Client Components desnecessariamente** - impacta performance
2. **Não otimizar imagens** - maior causa de Core Web Vitals ruins
3. **useState para dados de API** - use TanStack Query
4. **Prop drilling excessivo** - implemente estado global
5. **Bibliotecas pesadas** - analise bundle size regularmente

### **⚠️ Cuidados Especiais**
- **Hydration errors** - garanta consistência server/client
- **Memory leaks** em useEffect sem cleanup
- **Overfetching** - use campos específicos em APIs
- **Cache invalidation** incorreta
- **TypeScript any** - sempre tipagem explícita

---

## 📈 Métricas de Sucesso

### **Performance (Core Web Vitals)**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID/INP**: < 200ms (Interaction to Next Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Desenvolvimento**
- **Build time**: < 60s para projetos médios
- **Hot reload**: < 500ms
- **Type checking**: 0 erros TypeScript
- **Test coverage**: > 80%

### **SEO**
- **Lighthouse Score**: > 90 (todos os critérios)
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s

---

## 🎯 Próximos Passos

### **Para Projetos Novos**
1. Use `create-next-app` com TypeScript e Tailwind
2. Configure ESLint/Prettier rigorosos
3. Implemente Zustand + TanStack Query desde o início
4. Configure testing pipeline com Vitest/Playwright

### **Para Migração de Projetos Existentes**
1. **Prioridade 1**: Migrar para App Router
2. **Prioridade 2**: Converter para Server Components
3. **Prioridade 3**: Substituir estado complexo por Zustand
4. **Prioridade 4**: Otimizar imagens com next/image

---

## 💡 Recursos Essenciais

- **[Next.js Docs](https://nextjs.org/docs)** - Documentação oficial sempre atualizada
- **[Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)** - Templates oficiais
- **[Vercel Analytics](https://vercel.com/analytics)** - Métricas de performance
- **[Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)** - Análise de bundle

---

*Este resumo representa as práticas mais atuais e eficazes para desenvolvimento Next.js em 2025, baseadas em dados de performance, tendências da comunidade e recursos oficiais do framework.*
