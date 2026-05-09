# Perro Amor Backoffice — Web

SPA del backoffice de Perro Amor, reemplazo de la app Vaadin actual. Consume el API REST + JWT de `perroamor-backoffice-api`.

## Stack

- React 19 + TypeScript (strict)
- Vite 8 (build con rollup, code splitting + lazy-load por route)
- Tailwind CSS 4 + shadcn/ui (Nova preset, Radix, base color neutral)
- React Router v7, TanStack Query v5, Zustand
- React Hook Form + Zod
- Sonner, date-fns, lucide-react

## Requisitos

- Node 20.19+
- pnpm 10 (activar con `corepack enable pnpm && corepack prepare pnpm@10 --activate`)
- API local corriendo en `http://localhost:8080`

## Setup

```bash
pnpm install
echo 'VITE_API_BASE_URL=http://localhost:8080/api/v1' > .env.local
pnpm dev   # http://localhost:5173
```

> **Nota**: el archivo `.env.local` no está en el repo (gitignored). Si ves el error `Missing env var: VITE_API_BASE_URL` al boot, corre el `echo` de arriba y reiniciá el dev server.

## Scripts

| Comando             | Qué hace                                       |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Dev server con HMR                             |
| `pnpm build`        | Type check + build prod                        |
| `pnpm preview`      | Sirve el build prod local en `:4173`           |
| `pnpm lint`         | ESLint                                         |
| `pnpm format`       | Prettier write (incluye orden de clases)       |
| `pnpm format:check` | Prettier check sin escribir                    |

## Variables de entorno

| Variable            | Default                        | Notas             |
| ------------------- | ------------------------------ | ----------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base del API REST |

`requireEnv` falla al boot si la var no está — esto es a propósito para no levantar la app con configuración incompleta.

## Build de producción

```bash
pnpm build      # genera dist/
pnpm preview    # http://localhost:4173 (sirve dist/)
```

El build aplica:
- **Lazy load por route**: cada feature page se carga on-demand cuando el usuario navega a ella.
- **Code splitting de vendor**: react, react-router, tanstack/react-query, radix, lucide, date-fns y forms van a chunks separados para que el cache del navegador sobreviva entre deploys que sólo cambian app code.

## Deploy

La SPA sirve archivos estáticos desde `dist/` con cualquier hosting que soporte SPAs con fallback a `index.html`. Recomendados:

- **Vercel** — `vercel --prod` desde la raíz (auto detecta Vite).
- **Cloudflare Pages** — build command `pnpm build`, output `dist`.
- **Netlify** — build command `pnpm build`, publish `dist`, redirects `/* → /index.html 200`.
- **S3 + CloudFront** — sube `dist/` a S3 con `index.html` como default + 404 fallback.

En todos los casos, en producción setear:

- `VITE_API_BASE_URL` apuntando al backend deployado (no localhost).
- En el backend, agregar el dominio del frontend a `app.cors.allowed-origins` para que los pedidos no se bloqueen por CORS.

## Estructura

```
src/
├── lib/                 # framework-level (api, auth, types, utils)
├── components/
│   ├── ui/              # shadcn — no editar a mano
│   └── shared/          # composiciones nuestras (DataTable, EmptyState, etc.)
├── features/            # un dominio por carpeta, no se importan entre sí
│   ├── auth/
│   ├── catalog/         # brands + products + variants + combos
│   ├── dashboard/
│   ├── events/
│   ├── inventory/
│   └── sales/           # POS + listado + detalle + stats
├── routes/              # router config + ProtectedRoute + AppLayout
├── pages/               # 404
└── styles/
```

Ver `docs/frontend-plan.md` para el plan de fases (la app fue construida fase por fase con commits convencionales).
