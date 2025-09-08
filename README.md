# 🚀 Post Builder - Next.js 2025 Edition

Uma ferramenta web moderna para criação de posts do LinkedIn através de conversas com IA, construída seguindo as melhores práticas do Next.js 15+.

## ✨ Funcionalidades

- 🤖 **Chat com IA** - Interface conversacional para criação de posts
- 📱 **Design Responsivo** - Funciona perfeitamente em desktop e mobile
- ⚡ **Performance Otimizada** - Server Components, Suspense, e lazy loading
- 🎨 **UI Moderna** - Design system com Tailwind CSS e Shadcn/ui
- 📊 **Gerenciamento de Estado** - Zustand para estado global
- 🔄 **Data Fetching** - TanStack Query para cache inteligente
- ⚠️ **Error Boundaries** - Tratamento robusto de erros
- 🧪 **Testes** - Configuração completa com Vitest
- 🔍 **TypeScript Strict** - Tipagem rigorosa para maior segurança

## 🛠️ Stack Tecnológica

### Core Framework
- **Next.js 15+** com App Router
- **React 19** com Server Components
- **TypeScript** em modo strict

### Estado e Dados
- **Zustand** - Gerenciamento de estado global
- **TanStack Query** - Data fetching e cache

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Shadcn/ui** - Componentes reutilizáveis
- **Lucide React** - Ícones modernos

### Qualidade de Código
- **ESLint** - Linting rigoroso
- **Prettier** - Formatação consistente
- **Vitest** - Framework de testes
- **React Testing Library** - Testes de componentes

### Performance
- **Bundle Analyzer** - Análise de bundles
- **Error Boundaries** - Tratamento de erros
- **Suspense** - Loading states

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd post-builder

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Ou com Turbopack (experimental)
npm run dev:turbo

# Acesse http://localhost:3000
```

### Outros comandos úteis

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Testes
npm run test
npm run test:ui

# Build
npm run build

# Análise de bundle
npm run analyze
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── components/        # Componentes específicos da página
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Shadcn/ui)
│   ├── error-boundary.tsx
│   └── loading-fallback.tsx
├── hooks/                 # Hooks customizados
│   └── use-chat-query.ts
├── lib/                   # Utilitários e configurações
│   ├── providers/        # Context providers
│   ├── store/           # Zustand stores
│   └── utils/           # Funções utilitárias
└── test/                 # Configuração de testes
```

## 🎯 Boas Práticas Implementadas

### ✅ Performance
- [x] Server Components por padrão
- [x] Client Components apenas quando necessário
- [x] Code splitting automático
- [x] Bundle optimization
- [x] Lazy loading de componentes
- [x] Error boundaries
- [x] Suspense boundaries

### ✅ Qualidade de Código
- [x] TypeScript strict mode
- [x] ESLint configuração rigorosa
- [x] Prettier para formatação
- [x] Testes unitários configurados
- [x] Import paths otimizados
- [x] Tipagem rigorosa

### ✅ SEO e Metadata
- [x] Metadata API otimizada
- [x] OpenGraph tags
- [x] Twitter Cards
- [x] Viewport otimizado
- [x] Robots.txt configurado

### ✅ Segurança
- [x] Headers de segurança
- [x] CORS configurado
- [x] Content Security Policy
- [x] XSS Protection

### ✅ Desenvolvimento
- [x] Hot reload otimizado
- [x] Error reporting
- [x] Debug tools configurados
- [x] Git hooks (futuro)

## 📊 Métricas de Performance

### Core Web Vitals Targets
- **LCP** < 2.5s
- **FID/INP** < 200ms  
- **CLS** < 0.1

### Bundle Size
- Análise automática configurada
- Otimização de imports
- Tree shaking habilitado

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes com interface
npm run test:ui

# Coverage report
npm run test -- --coverage
```

## 📝 Configuração de Ambiente

### Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_VERIFICATION=your-verification-code
```

### Desenvolvimento

O projeto está configurado para desenvolvimento com:
- Hot reload otimizado
- Error overlay
- TypeScript checking
- Linting automático

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📋 Roadmap

- [ ] Implementar Server Actions
- [ ] Adicionar testes E2E com Playwright
- [ ] PWA configuration
- [ ] Internacionalização (i18n)
- [ ] Analytics integration
- [ ] Performance monitoring

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Construído com ❤️ usando Next.js 15 e as melhores práticas de 2025**
