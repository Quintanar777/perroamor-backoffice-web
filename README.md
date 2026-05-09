# Perro Amor Backoffice — Web

SPA del backoffice de Perro Amor, reemplazo de la app Vaadin actual. Consume el API REST + JWT de `perroamor-backoffice-api`.

## Stack

- React 19 + TypeScript (strict)
- Vite 8
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

## Scripts

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Dev server con HMR                        |
| `pnpm build`        | Type check + build prod                   |
| `pnpm preview`      | Sirve el build prod local                 |
| `pnpm lint`         | ESLint                                    |
| `pnpm format`       | Prettier write (incluye orden de clases)  |
| `pnpm format:check` | Prettier check sin escribir               |

## Variables de entorno

| Variable            | Default                        | Notas             |
| ------------------- | ------------------------------ | ----------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base del API REST |

## Estructura

Ver `docs/frontend-plan.md` — la app sigue ese plan por fases.
