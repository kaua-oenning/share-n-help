# Share&Help - Frontend

Plataforma de doacao de itens que conecta doadores e solicitantes.

## Pre-requisitos

- **Node.js** >= 18
- **npm** >= 9
- Backend rodando (ver `../share-n-help-backend`)

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000
```

> Se omitida, o frontend usa `http://localhost:3000` como padrao.

## Executando

```bash
# Modo desenvolvimento
npm run dev

# Build de producao
npm run build

# Preview do build
npm run preview
```

## Lint

```bash
npm run lint
```

## Estrutura principal

```
src/
  components/    # Componentes React (Layout, DonationForm, ItemDetail, etc.)
  components/ui/ # Componentes base (shadcn/ui)
  lib/           # Utilitarios, apiClient, tipos de dados
  pages/         # Paginas (Index, NotFound)
  hooks/         # Hooks customizados
  App.tsx        # Rotas e providers
```

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router DOM
- Sonner (toasts)
