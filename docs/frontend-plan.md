# Frontend Plan — Perro Amor Backoffice (SPA)

> **Audiencia**: una sesión de Claude Code que ejecuta este plan en una carpeta vacía, en colaboración con el usuario (Erick).
> **Origen del plan**: sesión de planificación previa con visibilidad completa del backend plan (`doc/backend-plan.md`) y la app Vaadin actual.
> **Reglas de ejecución**: una fase por vez. Al terminar cada fase, parar y pedir validación al usuario antes de pasar a la siguiente. Conventional commits, sin firmas Co-Authored-By.

---

## 0. Contexto

### Por qué este frontend existe
Reemplaza la UI Vaadin de la app actual. Va a consumir el backend nuevo (`perroamor-backoffice-api`) que expone REST + JWT. La app vieja sigue viva en producción.

### Referencias (read-only)
- **Backend plan**: `/Users/erick.quintanar/Documents/personal/repositories/perroamor-backoffice-api/docs/backend-plan.md` — contrato de endpoints y reglas de dominio. Leer ANTES de empezar Fase 2.
- **App vieja, referencia visual**: `/Users/erick.quintanar/Documents/personal/repositories/inventory-system/src/main/kotlin/com/perroamor/inventory/view/` — los flujos de UI a replicar (especialmente `NewSaleView.kt` y `MainLayout.kt`).
- **API base URL local**: `http://localhost:8080/api/v1`

### Naming
- Repo y proyecto: `perroamor-backoffice-web`.
- Package manager: **pnpm** (más rápido que npm, mejor lockfile).

### MVP scope (Fases 0–6)
- Auth (login, refresh, /me)
- Dashboard mínimo (cards con accesos directos al evento actual + métricas)
- Catálogo: brands, products, variants, **combos**
- Events
- POS (nueva venta) — corazón del MVP, con soporte para vender productos sueltos **y combos**
- Listado de ventas + stats por evento

### Sobre combos (feature clave)

Un **combo** es una agrupación de productos (con opción de variantes) que se vende como una unidad y descuenta stock real de cada componente al venderlo. Reemplaza el workaround histórico de la app vieja, donde los combos eran "productos con stock falso" y al venderse no se descontaba inventario real.

Reglas de dominio (definidas en backend):
- Precio fijo del combo (descuento implícito), no calculado desde componentes.
- Stock disponible **derivado**: `min(componente.stock / componente.qty)`. NO se persiste — se recalcula al consultar.
- Componentes fijos (sin elección de variant al momento de venta).
- Vender un combo descuenta atómicamente stock de cada componente. Si falta stock en uno → falla con `ProblemDetail` y rollback total.
- Cancelar venta restituye stock de TODOS los componentes.
- Endpoint `POST /sales`: cada item del payload es **mutuamente exclusivo** (productId XOR comboId). En la misma venta pueden coexistir items de tipos distintos.

**Fuera del MVP**: reportes avanzados, lector de barras, print de ticket, gestión de usuarios desde UI, i18n, PWA offline.

---

## 1. Decisiones de arquitectura (locked)

| Decisión | Valor | Razón |
|---|---|---|
| Lenguaje | TypeScript strict | Type safety crítico para vibe coding |
| UI library | React 18+ | Mayor training data en IAs, mejor para vibe coding |
| Build | Vite 6+ | Dev server rapidísimo, build moderno |
| Styling | Tailwind CSS 4 | shadcn lo requiere |
| Componentes | shadcn/ui | Copy-paste, sin lock-in con librería |
| Routing | React Router v7 | Maduro, sin rarezas |
| Server state | TanStack Query v5 | Cache + refetch + optimistic updates |
| Forms | React Hook Form + Zod | Validación tipo-segura |
| Auth/UI state | Zustand | Liviano, sin boilerplate, mejor que Context para esto |
| Notifications | Sonner | Default de shadcn |
| Date utils | date-fns | Liviano, tree-shakable |
| Icons | Lucide React | Default de shadcn |
| HTTP | fetch nativo + wrapper | No hace falta axios |

### iPad-first (la app vive en iPad)

La app se va a usar **principalmente en iPad** durante los eventos. NO es ni "phone-first" ni "desktop-first" — es **tablet-first** con sus reglas propias.

**Viewports primarios** (todos deben verse impecables):
- iPad mini portrait: **744×1133**
- iPad estándar portrait: **820×1180**
- iPad estándar landscape: **1180×820**
- iPad Pro 12.9" landscape: **1366×1024**

**Reglas de diseño táctil**:
- Touch targets ≥**48px** (Apple HIG dice 44pt, en POS andamos en 48-56pt por velocidad).
- Botones críticos del POS (registrar venta, agregar al cart): ≥**56px** de alto, ancho generoso.
- **No depender de hover**: el iPad no tiene cursor. Hover effects son bonus, nunca crítico.
- Espaciado ≥8px entre targets para evitar mis-taps.
- `cursor: pointer` en elementos clickables igual (el iPad con trackpad lo aprovecha).

**Orientación**:
- Soportar **portrait Y landscape** — los empleados rotan el iPad según convenga.
- POS aprovecha el landscape: grid de productos a la izquierda + **cart sidebar persistente** a la derecha (~360px).
- Otras pantallas: 1 columna en portrait, 2 columnas en landscape cuando aplique.

**iOS Safari gotchas (obligatorios)**:
- Usar `100dvh` en vez de `100vh` (el viewport cambia con la barra de tabs).
- Inputs con `font-size: 16px` mínimo, si no Safari hace auto-zoom al hacer focus.
- `-webkit-tap-highlight-color: transparent` para evitar el flash gris al tocar.
- Teclado virtual tapa ~40% de la pantalla → usar `scrollIntoView` cuando un input crítico recibe focus.
- `env(safe-area-inset-bottom)` para botones fijos al fondo.
- `user-select: none` en botones/cards para que no seleccionen texto al tocar.

**Test de aceptación por fase**: probar en **iPad real o iPad simulator de Xcode** antes de cerrar cada fase visual. Chrome DevTools "iPad" preset NO basta — Safari iOS tiene su propio motor de render.

### Design system / Branding (NO copiar Vaadin)

Los estilos **NO tienen que parecerse a la app Vaadin actual**. Se rediseña limpio, moderno, táctil y con identidad de marca propia. Si algún flujo de la app vieja se entiende mejor con otro layout, **se cambia**.

**Paleta base — Perro Amor**:

> **Antes de Fase 0**: el usuario aporta el **logo oficial** (PNG/SVG, lo dejamos en `public/logo.svg` o `public/logo.png`) y los **hex codes exactos** de pink y blue de la marca. El sitio oficial (perroamor.mx) está geo-bloqueado fuera de MX, por eso los hex no se pueden extraer remoto.
>
> Si los hex no están disponibles al arrancar, usar los placeholders de abajo. Como las variables CSS están aisladas en `globals.css`, reemplazarlos es **una sola edición** cuando lleguen los valores oficiales.

```css
/* src/styles/globals.css — placeholders, ajustar al hex oficial */
:root {
  --brand-pink: #EC4899;        /* rosa principal Perro Amor */
  --brand-pink-soft: #FBCFE8;   /* rosa suave para fondos/badges */
  --brand-blue: #3B82F6;        /* azul principal Perro Amor */
  --brand-blue-soft: #DBEAFE;   /* azul suave */

  --brand-perra-madre: #F59E0B; /* dorado, propuesto para diferenciar sub-marca */
}
```

**Aplicación**:
- Primary actions (Registrar venta, Guardar, Ingresar): **azul**.
- Acentos / highlights / branding visible: **rosa**.
- Diferenciar marcas en UI: chip rosa para "Perro Amor", chip dorado para "Perra Madre" en cards de producto, filtros y carrito.
- Logo en: sidebar header (apilado con el nombre), login screen, dashboard top.

**Tipografía**:
- Sans-serif moderna y legible. Default propuesto: **Inter** o **DM Sans** (Google Fonts, ambas excelentes en iPad).
- Si la marca tiene fuente oficial, el usuario la aporta y la sustituimos.
- Base **16px** (legibilidad iPad + evita auto-zoom Safari).
- Pesos: 400 regular, 500 medium (labels), 600 semibold (titulos), 700 bold (énfasis puntual).

**Tono visual**:
- Border-radius **12-16px** en cards (amigable, no cuadrado tipo Vaadin).
- Sombras suaves: `shadow-sm` o `shadow-md` de Tailwind. Evitar `shadow-2xl`.
- Spacing **generoso** — esto es POS para tocar, no dashboard denso para mirar.
- Transiciones sutiles (`duration-200 ease-out`) en estados active/focus.
- Empty states con emoji canino (🐕, 🦴) para personalidad sin perder profesionalismo.
- Dark mode opcional. **Light mode es el target principal** porque los eventos tienen luz alta.

### Manejo de tokens (decisión pragmática para MVP)
- **Access token**: en memoria (Zustand store).
- **Refresh token**: en `localStorage`.
- Tradeoff documentado: vulnerable a XSS, pero la app la usan empleados de confianza en kioskos. Para multi-tenant o usuarios externos en el futuro, mover a httpOnly cookie + cambio en backend.

---

## 2. Estructura de carpetas

```
src/
├── main.tsx
├── App.tsx
├── lib/
│   ├── api/                  # cliente fetch + endpoints
│   │   ├── client.ts         # fetch wrapper con auth + ProblemDetail parsing
│   │   ├── auth.ts           # login, refresh, me
│   │   ├── catalog.ts        # brands, products, variants
│   │   ├── combos.ts         # combos (productos compuestos)
│   │   ├── events.ts
│   │   └── sales.ts
│   ├── auth/
│   │   ├── store.ts          # Zustand: token, user, login(), logout()
│   │   └── tokens.ts         # localStorage helpers
│   ├── utils/                # cn(), formatMoney(), formatDate()
│   └── hooks/                # custom hooks reutilizables
├── components/
│   ├── ui/                   # shadcn — NO modificar a mano
│   └── shared/               # composiciones nuestras
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       ├── DataTable.tsx
│       └── Money.tsx
├── features/                 # cada feature = carpeta autónoma
│   ├── auth/
│   │   ├── pages/LoginPage.tsx
│   │   ├── components/
│   │   ├── hooks/useLogin.ts
│   │   └── schemas/loginSchema.ts
│   ├── catalog/
│   │   ├── pages/{Brands,Products,Variants,Combos}Page.tsx
│   │   ├── components/         # incluye ComboBuilder, ComboItemRow
│   │   └── schemas/            # incluye comboSchema
│   ├── events/
│   │   ├── pages/EventsPage.tsx
│   │   └── components/
│   ├── sales/
│   │   ├── pages/{NewSale,Sales,SaleDetail}Page.tsx
│   │   ├── components/{Cart,ProductSelector,PaymentMethodPicker,EventBanner}.tsx
│   │   └── store.ts          # Zustand del cart
│   └── dashboard/
│       └── pages/DashboardPage.tsx
├── routes/
│   ├── index.tsx             # config de React Router
│   ├── ProtectedRoute.tsx
│   └── AppLayout.tsx
└── styles/
    └── globals.css           # Tailwind + theme tokens
```

### Reglas de capa
- `lib/` es framework-level, agnóstico al dominio del usuario.
- `features/` es código por dominio. **Features NO se importan entre sí**. Si necesitan algo común, va a `lib/` o `components/shared/`.
- `components/ui/` es shadcn. **Solo agregar componentes, no modificar** los existentes (salvo cambios globales de theme).
- `components/shared/` es nuestro: composiciones de shadcn + lógica.

---

## 3. FASES

**Importante**: cada fase termina con un commit limpio y validación con el usuario antes de avanzar. Si TypeScript no compila o el dev server tiene errores, no se cierra la fase.

---

### FASE 0 — Bootstrap

**Objetivo**: Vite + React + TS + Tailwind + shadcn andando con dev server arriba y `<Button>` rendereado.

**Pasos**:
1. Confirmar con el usuario el path de la nueva carpeta (vacía o solo con `.git`).
2. `pnpm create vite . --template react-ts`
3. `pnpm install`
4. Instalar Tailwind CSS 4 + dependencias para Vite (seguir docs oficiales de Tailwind v4).
5. `pnpm dlx shadcn@latest init` — base color: `neutral`, CSS variables: enabled, RSC: no, baseColor confirmado.
6. Agregar componentes shadcn iniciales: `pnpm dlx shadcn@latest add button input label card dialog form select dropdown-menu table badge avatar sonner toggle-group radio-group tabs sheet skeleton calendar popover separator`.
7. Instalar deps de runtime: `pnpm add react-router-dom @tanstack/react-query @tanstack/react-query-devtools zustand react-hook-form zod @hookform/resolvers date-fns`.
8. `tsconfig.json` strict mode + path alias `@/*` → `./src/*`.
9. ESLint + Prettier (defaults de Vite + plugin de Tailwind para clases).
10. `.env.local` con `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
11. `.gitignore` (node_modules, dist, .env.local, .vscode).
12. `README.md` mínimo con cómo levantar local.
13. Reemplazar el `App.tsx` default con un Hello World que use `<Button>` de shadcn.

**Done cuando**:
- [x] `pnpm dev` levanta en `:5173` sin errores.
- [x] Se ve un botón estilizado de shadcn.
- [x] `pnpm build` pasa sin errores.
- [x] Commit: `chore: bootstrap vite + react + tailwind + shadcn`. _(commit `d3638aa`)_

---

### FASE 1 — Cross-cutting (cliente API, router, layout, providers)

**Objetivo**: piezas transversales listas para que las features siguientes solo escriban su lógica.

**Pasos**:

1. **`lib/api/client.ts`** — fetch wrapper:
   - Base URL desde `VITE_API_BASE_URL`.
   - Inyecta `Authorization: Bearer <accessToken>` desde Zustand store.
   - Maneja 401: intenta refresh UNA vez, si falla redirige a `/login` y limpia store.
   - Parsea `ProblemDetail` (RFC 7807) y lo lanza como `ApiError` con `{ status, title, detail, errors? }`.
   - Helpers `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.

2. **`lib/auth/store.ts`** — Zustand:
   ```ts
   interface AuthStore {
     accessToken: string | null;
     user: User | null;
     setAuth: (data: { accessToken, refreshToken, user }) => void;
     clear: () => void;
   }
   ```
   - `setAuth` también guarda refresh token en `localStorage`.
   - `clear` limpia todo.

3. **`lib/auth/tokens.ts`** — helpers para `localStorage` (get, set, remove del refresh token).

4. **TanStack Query**:
   - `QueryClient` con: `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`.
   - `<QueryClientProvider>` envolviendo la app + `<ReactQueryDevtools>` solo en `import.meta.env.DEV`.

5. **Router** (`routes/index.tsx`):
   - React Router v7 con `createBrowserRouter`.
   - Public: `/login`.
   - Protected (envueltas en `<ProtectedRoute>` + `<AppLayout>`): `/`, `/inventory`, `/products`, `/products/:id/variants`, `/brands`, `/combos`, `/events`, `/sales`, `/sales/new`, `/sales/:id`.
   - 404 catch-all.

6. **`routes/ProtectedRoute.tsx`**:
   - Verifica `useAuthStore.user` existe.
   - Si no, redirige a `/login` con `state.from`.
   - Soporta prop opcional `requireRole?: 'ADMIN' | 'MANAGER'` para gates más finos.

7. **`routes/AppLayout.tsx`** — layout principal:
   - Sidebar con nav según rol (espejar `MainLayout.kt` de la app vieja, pero modernizado).
   - Header con toggle theme + dropdown del usuario (avatar + logout).
   - Mobile (<768px): sidebar como `<Sheet>` (hamburguesa).
   - Items del nav: Dashboard, Inventario, Productos, Marcas, Combos, Eventos, Nueva Venta, Ventas. (Usuarios → fase futura).

8. **Sonner Toaster** montado en root.

9. **Error Boundary global** con fallback amigable (Card centrada, botón "Recargar").

10. **Theme toggle**: light/dark con shadcn + persistencia en `localStorage`.

**Done cuando**:
- [x] Visitar ruta protegida sin auth redirige a `/login`.
- [x] Layout responde a mobile (sidebar colapsa a Sheet).
- [x] Toast de prueba aparece (botón temporal en layout para verificar).
- [x] Theme toggle funciona y persiste.
- [x] Commit: `feat: cross-cutting (api client, router, layout, providers)`. _(commit `9ce62bd`)_

> **Pendiente con el plan actualizado**: agregar la ruta `/combos` y el item "Combos" al nav (deuda de cross-cutting que se paga al implementar Fase 3 con combos).

---

### FASE 2 — Auth (Login, Session, Logout)

**Objetivo**: login funcional contra el backend, sesión persistente entre reloads, logout limpio.

**Pre-requisito**: el backend ya tiene Fase 2 completa (`POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`).

**Pasos**:
1. **`features/auth/schemas/loginSchema.ts`**:
   ```ts
   z.object({
     username: z.string().min(1, 'Requerido'),
     password: z.string().min(1, 'Requerido'),
   })
   ```

2. **`features/auth/pages/LoginPage.tsx`**:
   - Card centrada, branding "🐕 Perro Amor Backoffice".
   - Form con React Hook Form + Zod resolver.
   - Inputs username/password con labels.
   - Botón "Ingresar" con loading state.
   - Errores inline + toast en caso de credenciales inválidas.

3. **`features/auth/hooks/useLogin.ts`**:
   - `useMutation` que llama `POST /auth/login`.
   - On success: `setAuth(data)` + navegar a `state.from || '/'`.
   - On error: toast con `apiError.detail`.

4. **`features/auth/hooks/useBootstrapSession.ts`**:
   - Al boot de la app: si hay refresh token en localStorage, intenta `POST /auth/refresh` + `GET /auth/me`.
   - Setea store o limpia si falla.
   - Mostrar `<Skeleton>` o spinner full-screen mientras se hidrata.

5. **Logout** en el dropdown del header:
   - Limpia store + localStorage.
   - Navega a `/login`.

6. **Items del nav** se ocultan según rol (ej: "Usuarios" solo si `user.role === 'ADMIN'`).

**Done cuando**:
- [x] Login con credenciales válidas redirige al dashboard.
- [x] Credenciales inválidas → toast claro, no crashea.
- [x] Reload de la página mantiene la sesión.
- [x] Logout limpia todo y vuelve a `/login`.
- [x] Items del nav respetan el rol.
- [x] Commit: `feat(auth): login flow with jwt and persistent session`. _(commit `85a73fb`)_

---

### FASE 3 — Catálogo (Brands, Products, Variants, Combos)

**Objetivo**: CRUD UI completo para los 4 recursos del catálogo, con filtros y paginación.

**Pre-requisito**: backend Fase 3 lista + feature de combos lista (ya está en backend, post-Fase 6).

**Pasos**:

1. **`features/catalog/pages/BrandsPage.tsx`**:
   - `<DataTable>` con columnas: name, description, isActive, acciones.
   - Botón "Nueva Marca" → `<Dialog>` con form (name, description).
   - Editar inline → mismo Dialog.
   - Eliminar → `<Dialog>` de confirmación.
   - `useQuery(['catalog', 'brands'])`.
   - Mutations con invalidación de cache.

2. **`features/catalog/pages/ProductsPage.tsx`**:
   - **Filtros**:
     - `<Select>` de marca.
     - `<Select>` de categoría.
     - `<Input>` de búsqueda con debounce 300ms.
   - **Tabla** paginada (lee `PagedResponse<Product>` del backend).
   - Columnas: name, brand, category, price, wholesale, stock, hasVariants, acciones.
   - Form de create/edit en `<Dialog>` con campos: name, brand (Select), category, price, wholesalePrice, stock, hasVariants (Switch), canBePersonalized (Switch), description.
   - Botón "Variantes" → navega a `/products/:id/variants`.
   - Validación con Zod schema espejando Bean Validation del backend.

3. **`features/catalog/pages/VariantsPage.tsx`** (`/products/:id/variants`):
   - Header con info del producto.
   - Tabla de variantes con columnas: variantName, color, size, sku, stock, priceAdjustment, isActive.
   - Form de create/edit con todos los campos.
   - Botón "Volver a Productos".

4. **`features/catalog/pages/CombosPage.tsx`** (`/combos`):
   - **Filtros**: `<Select>` de marca, `<Input>` de búsqueda con debounce 300ms, toggle `isActive`.
   - **Tabla** paginada (lee `PagedResponse<Combo>` del backend).
     - Columnas: name, brand, price, **availableStock** (calculado por el backend), isActive, # de componentes, acciones.
     - El badge de `availableStock` con color: verde si ≥10, ámbar si entre 1-9, rojo si 0.
   - **Form de create/edit** en `<Dialog>` o `<Sheet>` (más espacio para los componentes):
     - Campos top-level: name, brand (Select), price, wholesalePrice, description.
     - **`<ComboBuilder>`** — sección dinámica para agregar/quitar componentes:
       - Cada fila: `<Select>` de producto (búsqueda interna), `<Select>` de variant (opcional, solo si el producto `hasVariants`), input de cantidad (con +/-).
       - Botón "+ Agregar componente" al final.
       - Validación: al menos 1 componente; no permitir componentes duplicados (mismo product+variant).
   - **Detalle expandible** en la tabla: click en una fila expande para ver lista de componentes con su `productName`, `variantName`, `quantity`.
   - Botón "Eliminar" → confirmación → `DELETE /combos/:id` (soft delete).

5. **UX común**:
   - `<Skeleton>` durante loading.
   - `<EmptyState>` cuando no hay datos.
   - Toasts de success/error en cada mutation.
   - Confirmación antes de eliminar.

**Done cuando**:
- [x] CRUD de brands, products, variants, **combos** funciona end-to-end.
- [x] Filtros y paginación de products y combos andan.
- [x] Crear combo con 2-3 componentes y verificar `availableStock` cambia al editar stock de algún componente.
- [x] Validaciones del form coinciden con las del backend (probar enviando data inválida).
- [x] Productos seedeados aparecen al cargar `/products`.
- [x] Commit: `feat(catalog): brands, products, variants and combos management ui`.

---

### FASE 4 — Events

**Objetivo**: CRUD de eventos con badges de estado y card del evento actual en el dashboard.

**Pre-requisito**: backend Fase 4 lista.

**Pasos**:
1. **`features/events/pages/EventsPage.tsx`**:
   - Tabla con columnas: name, location, startDate, endDate, status (badge), acciones.
   - Badge: `UPCOMING` (azul), `IN_PROGRESS` (verde), `FINISHED` (gris).
   - Form de create/edit en Dialog: name, location, description (textarea), startDate (`<Calendar>`), endDate (`<Calendar>`).
   - Validación: `startDate <= endDate`.

2. **`features/dashboard/pages/DashboardPage.tsx`** (mejora):
   - Card grande con el evento actual (`GET /events/current`).
   - Si hay evento → mostrar nombre, fechas, botón directo a "Nueva Venta".
   - Si no hay → `<EmptyState>` con CTA "Crear Evento".

**Done cuando**:
- [x] CRUD de events anda.
- [x] Badges visuales coinciden con el estado calculado del backend.
- [x] Dashboard muestra el evento actual cuando existe.
- [x] Commit: `feat(events): event management ui with status badges`.

---

### FASE 5 — POS (NewSalePage) — corazón del MVP

**Objetivo**: pantalla optimizada para vender en evento. **Tablet-first (iPad)**, pocos clicks, rápida, dos manos máximo.

**Pre-requisito**: backend Fase 5 lista.

**Diseño objetivo**:

```
┌─────────────────────────────────────────────┐
│  📍 Evento actual: Expo Mascotas — En curso │
├─────────────────────────────────────────────┤
│  [Perro Amor]  [Perra Madre]   ← chip filter│
│  🔍 Buscar producto...                       │
│  ┌───────┬───────┬───────┐                  │
│  │ prod  │ prod  │ prod  │  ← grid          │
│  └───────┴───────┴───────┘                   │
├─────────────────────────────────────────────┤
│  🛒 Carrito                                  │
│  Collar Santo Remedio (rojo) · x2     $398  │
│  Correa Binomio (estrellas) · x1      $189  │
│  ─────────────────────────────              │
│  Total: $587                                 │
├─────────────────────────────────────────────┤
│  Método: [Efectivo ▼]                        │
│  Cliente (opcional): _______                 │
│  [        REGISTRAR VENTA       ]            │
└─────────────────────────────────────────────┘
```

**Layout en iPad landscape** (preferido durante evento):

```
┌──────────────────────────────────────┬──────────────────────┐
│ 📍 Evento: Expo Mascotas — En curso  │  🛒 Carrito (4)       │
├──────────────────────────────────────┤                      │
│ [Perro Amor] [Perra Madre]   🔍 ___  │  Collar Santo Remed.  │
│ ┌────┬────┬────┬────┐                │     (rojo) x2  $398   │
│ │ p  │ p  │ p  │ p  │                │  Correa Binomio       │
│ ├────┼────┼────┼────┤                │     (estr.) x1  $189  │
│ │ p  │ p  │ p  │ p  │                │  ─────────────────    │
│ └────┴────┴────┴────┘                │  Total: $587          │
│                                       │                      │
│                                       │  Método: [Efectivo ▼] │
│                                       │  Cliente: ________   │
│                                       │  ┌─────────────────┐ │
│                                       │  │ REGISTRAR VENTA │ │
│                                       │  └─────────────────┘ │
└──────────────────────────────────────┴──────────────────────┘
```

En landscape el cart se **promueve a sidebar persistente** (~360px ancho fijo) — el cajero tiene el cart siempre visible mientras navega productos. En portrait el cart va abajo (vertical), como el primer mockup. Usar `useMediaQuery` o Tailwind `lg:` para alternar.

**Componentes** (en `features/sales/components/`):
- `EventBanner.tsx` — info del evento actual.
- `BrandFilter.tsx` — chips de marcas con `<RadioGroup>`.
- `CatalogTabs.tsx` — tabs `Productos` / `Combos` (default Productos). Cambia el grid debajo.
- `ProductSearchBar.tsx` — input con debounce + icon. Reusable en ambos tabs.
- `ProductGrid.tsx` — grid responsivo (1 col mobile, 2 sm, 3 md, 4 lg) de productos.
- `ProductCard.tsx` — card con foto/placeholder, name, price, click → abre `AddProductDialog`.
- `ComboGrid.tsx` — espejo de `ProductGrid` para combos.
- `ComboCard.tsx` — card distinguible visualmente (border o bg distinto, badge "Combo"). Muestra name, price, **availableStock**. Si availableStock = 0, deshabilitada con opacity baja. Click → abre `AddComboDialog`.
- `AddProductDialog.tsx` — Dialog para configurar el item de producto:
  - Si `hasVariants`: `<Select>` de variante.
  - `<Input>` cantidad (con +/- buttons).
  - Si `canBePersonalized`: textarea de personalización.
  - Muestra subtotal calculado en vivo.
- `AddComboDialog.tsx` — Dialog para configurar el item de combo:
  - Lista de componentes (read-only): "1× Collar Vida Mía", "1× Mochila Mimi", etc. Da contexto al cajero de qué incluye.
  - `<Input>` cantidad (con +/- buttons), validado contra `availableStock` del combo.
  - Subtotal en vivo (`combo.price × qty`).
  - Sin variants ni personalización (los combos son fijos).
- `Cart.tsx` — lista del cart con edit qty inline + remove. Cada línea identifica si es producto o combo (badge o icon distinto).
- `PaymentSection.tsx` — `<Select>` payment method + inputs de cliente opcionales.
- `CheckoutButton.tsx` — botón gigante, en mobile fixed bottom.

**Cart state** (`features/sales/store.ts`):
- Zustand store separado del auth.
- `CartItem` es **discriminated union** por `kind`:
  ```ts
  type CartItem =
    | { kind: 'product', productId: number, variantId: number | null,
        displayName: string, unitPrice: number, qty: number, personalization?: string }
    | { kind: 'combo', comboId: number, displayName: string, unitPrice: number,
        qty: number, components: { productName: string, variantName?: string, qty: number }[] };
  ```
- `addItem(item)` — si ya existe un item idéntico (mismo combo o mismo product+variant+personalization), suma qty en vez de duplicar.
- `updateQty(idx, qty)`, `removeItem(idx)`, `clear()`, `getTotal()`.

**Flujo**:
1. Cargar página → `GET /events/current`. Si no hay → mensaje + botón a `/events`.
2. **Tabs Productos / Combos**:
   - Tab Productos: `GET /products?brandId=X` (cambio de chip refetch).
   - Tab Combos: `GET /combos?brandId=X&isActive=true`.
3. Click en `ProductCard` → abre `AddProductDialog`. Click en `ComboCard` → abre `AddComboDialog`.
4. Confirmar dialog → agrega al cart store con el `kind` correcto.
5. Editar qty / remove en el cart.
6. Click "Registrar Venta" → `POST /sales`. Mapeo del cart al payload:
   - Item `kind=product` → `{ productId, variantId, quantity, personalization }`.
   - Item `kind=combo`   → `{ comboId, quantity }`.
7. Success → toast "Venta registrada $XYZ" + clear cart + invalidar `['products']`, `['combos']` y `['sales']`.
8. Errores:
   - Stock insuficiente (422) → toast con detalle del backend (que ya identifica el componente faltante en el caso de combo).
   - Otro error → toast genérico + log en consola.

**Optimizaciones**:
- Search debounceado (300ms).
- `useQuery` con `keepPreviousData` para que la grilla no flickee al filtrar.
- Mantener foco en el search después de cerrar el AddItemDialog (para escaneo rápido).

**Done cuando**:
- [ ] Flujo end-to-end producto suelto: evento actual → 2-3 items al cart → registrar → ver venta en `/sales`.
- [ ] Flujo end-to-end combo: agregar combo al cart → registrar → verificar que stock de **cada componente** se descontó.
- [ ] Venta mixta (producto + combo en el mismo cart) → registra correctamente, ambos items aparecen en el detalle.
- [ ] Stock insuficiente en combo muestra error específico identificando el componente faltante.
- [ ] `availableStock` del combo se respeta en el AddComboDialog (no permite agregar más de lo disponible).
- [ ] **iPad portrait (820px) y landscape (1180px) verifican impecables**. Probado en iPad real o simulador iOS de Xcode — Chrome DevTools NO basta.
- [ ] En landscape el cart aparece como sidebar persistente; en portrait va abajo.
- [ ] No deja vender si no hay evento en curso.
- [ ] Commit: `feat(sales): point-of-sale ui mobile-first with combo support`.

---

### FASE 6 — Sales list & stats

**Objetivo**: ver ventas registradas, detalle, cancelar, y stats por evento.

**Pre-requisito**: backend Fase 5 lista (ya cubre stats).

**Pasos**:
1. **`features/sales/pages/SalesPage.tsx`** (`/sales`):
   - Filtros: event (Select), date range (date picker), payment method (Select).
   - Tabla paginada con columnas: id, event, date, items count, total, payment method, status (paid/cancelled).
   - Click en row → navega a `/sales/:id`.

2. **`features/sales/pages/SaleDetailPage.tsx`** (`/sales/:id`):
   - Card con info de la venta: customer, event, total, payment method, vendedor, fecha, notas.
   - **Tabla de items** que distingue por tipo:
     - Item de **producto**: muestra `productName` (+ variante si aplica), qty, unitPrice, lineTotal, personalization.
     - Item de **combo**: muestra `comboName` con badge "Combo" en la columna de descripción, qty, unitPrice, lineTotal.
       - Opcional: subfila expandible con la composición actual del combo (`GET /combos/:id`) para mostrar qué incluye. Aclarar visualmente que la composición mostrada es la **actual**, no la del momento de la venta (esta limitación está documentada en backend).
   - Botón "Cancelar Venta" (solo si `!isCancelled` y rol ADMIN/MANAGER) con `<Dialog>` de confirmación.
   - Mutation `PATCH /sales/:id/cancel` + invalidar caché. Al cancelar una venta con combos, el toast aclara que el stock de los componentes se restituyó.

3. **Dashboard stats** (`DashboardPage` mejorada):
   - Cuando hay evento actual: card con `GET /sales/stats?eventId=X`.
   - Mostrar: total vendido, count de ventas, breakdown por payment method (con `<Badge>` por método).

**Done cuando**:
- [ ] Listado con filtros funciona.
- [ ] Detalle de venta legible y completo, distingue items de producto vs combo.
- [ ] Cancel funciona, refresca stock (verificar) y refleja `isCancelled` en UI.
- [ ] Cancelar una venta de combo restituye stock de **cada componente** (verificar contra `/products/:id` y `/products/:id/variants`).
- [ ] Stats del dashboard reflejan ventas reales (los combos cuentan como una venta cada uno).
- [ ] Commit: `feat(sales): list, detail, cancellation and stats ui`.

---

### FASE 7 — Hardening

**Objetivo**: dejar la app lista para producción.

**Pasos**:
1. **Lazy load** por route con `React.lazy` + `<Suspense>` con `<Skeleton>` global.
2. **Code splitting** revisado en `vite.config.ts` (manualChunks si bundle pesa demasiado).
3. **Error boundary** por feature (no solo global) para que un crash de Sales no rompa Catalog.
4. **Build prod**: `pnpm build` + verificar tamaño del bundle (`pnpm preview` para testear).
5. **Lighthouse audit en modo iPad/tablet**: target perf ≥80, a11y ≥90.
6. **Probar en iPad real o iPad simulator** todas las pantallas — verificar que no haya zoom involuntario en inputs, que el teclado virtual no tape botones críticos, y que landscape/portrait funcionan.
7. **Sentry o equivalente** para error tracking (opcional, coordinar con usuario).
8. **README expandido**: setup local, env vars, build, deploy.

**Done cuando**:
- [ ] Lazy load funciona (verificar Network tab).
- [ ] Bundle prod razonable (<500KB gzipped es buen target).
- [ ] Lighthouse pasa los thresholds.
- [ ] Commit: `chore: hardening (lazy load, code splitting, build optimization)`.

---

### FASE 8 — Tests (opcional, post-MVP)

**Pre-requisito**: el usuario lo pidió o decidió arrancar.

**Stack**: Vitest + React Testing Library + MSW (mock service worker) para mockear el backend.

**Prioridades** (parar cuando el usuario diga "alcanza"):
1. Tests del cart store (lógica pura).
2. Tests de hooks de auth (login/logout).
3. Test de flujo NewSalePage happy path con MSW.
4. Test del flujo de cancelación de venta.

**Done cuando**:
- [ ] El usuario decide.
- [ ] Commit: `test: critical flows coverage`.

---

### FASE 9 — Deploy (cuando el usuario pida)

A coordinar. Opciones recomendadas:
- **Vercel** (más simple para SPA)
- **Cloudflare Pages**
- **Netlify**
- **S3 + CloudFront**

Variables de entorno:
- `VITE_API_BASE_URL` apuntando al backend deployado.

CORS: confirmar con backend que el origin del frontend está en `app.cors.allowed-origins`.

---

## 4. Convenciones operativas

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`.
- Sin firmas Co-Authored-By.
- Un commit por fase mínimo.

### Componentes shadcn
- Para agregar nuevos: `pnpm dlx shadcn@latest add <component>`.
- **NO modificar** archivos en `components/ui/*` salvo:
  - Cambios globales de theme.
  - Bug fixes que el upstream no ha resuelto.
- Si necesitás extender, creá un wrapper en `components/shared/`.

### Schemas Zod
- Cada form tiene su schema en `features/<feature>/schemas/`.
- Re-usar el mismo schema entre create y edit cuando aplique (puede usar `.partial()`).
- Espejar las validaciones del backend (Bean Validation) para no tener mismatches.

### TanStack Query keys
Convención: `['domain', 'resource', 'filter?']`.
- `['catalog', 'brands']`
- `['catalog', 'products', { brandId: 1, page: 0 }]`
- `['catalog', 'variants', productId]`
- `['catalog', 'combos', { brandId: 1, isActive: true, page: 0 }]`
- `['catalog', 'combos', 'detail', id]`
- `['events', 'list']`
- `['events', 'current']`
- `['sales', 'list', filters]`
- `['sales', 'detail', id]`
- `['sales', 'stats', eventId]`
- `['auth', 'me']`

Helpers para construir keys en cada `lib/api/<domain>.ts` para evitar typos.

### Idioma
- Strings de UI (botones, mensajes, errores visibles): **español**.
- Identificadores (componentes, vars, funciones, archivos): **inglés**.

### Errores del backend
- El backend devuelve `ProblemDetail` (RFC 7807).
- El client.ts los convierte a `ApiError`.
- Cada feature debe mostrar el `detail` del error en el toast (no genéricos vacíos).

### Cuándo parar y consultar al usuario
- Antes de instalar deps no listadas en este plan.
- Antes de modificar componentes shadcn existentes.
- Si el backend devuelve un shape distinto al esperado por este plan.
- Si una decisión de UX no está clara en el plan.
- **SIEMPRE entre fases**.

### Engram (memoria persistente)
Si la sesión ejecutora tiene engram disponible:
- Al inicio: `mem_search` con keywords del proyecto para recuperar contexto previo.
- Al cerrar cada fase: `mem_save` con la fase, decisiones y archivos tocados.
- Al cierre de sesión: `mem_session_summary`.

---

## 5. Lo que ESTE plan NO cubre (intencionalmente)

- Backend: ver `/Users/erick.quintanar/Documents/personal/repositories/perroamor-backoffice-api/docs/backend-plan.md`.
- Reportes avanzados / dashboards complejos.
- Lector de código de barras (POS futuro).
- Print de ticket de venta (POS futuro).
- Gestión de usuarios desde UI (admin manage users).
- i18n (todo en español por ahora).
- PWA / offline-first.
- Real-time updates (WebSockets/SSE).

Si durante la ejecución aparece una de estas, parar y consultar al usuario.

---

## 6. Checklist final del MVP

Cuando todas estas estén ✅, el frontend MVP está terminado:

- [x] Fase 0: bootstrap _(commit `d3638aa`)_
- [x] Fase 1: cross-cutting _(commit `9ce62bd` — `/combos` agregado en Fase 3)_
- [x] Fase 2: auth _(commit `85a73fb`)_
- [x] Fase 3: catálogo _(brands, products, variants y combos)_
- [x] Fase 4: events
- [ ] Fase 5: POS
- [ ] Fase 6: sales list & stats
- [ ] Fase 7: hardening
- [ ] (opcional) Fase 8: tests
- [ ] (cuando el usuario quiera) Fase 9: deploy

---

## 7. Orden de ejecución backend ↔ frontend

El frontend depende de endpoints del backend. Orden recomendado de ejecución entre los dos planes:

| Backend fase | Frontend fase | Por qué |
|---|---|---|
| 0–1 | — | Backend mínimo arriba primero |
| 2 (auth) | 0–2 | Frontend hasta login funcional |
| 3 (catalog) | 3 (parte: brands, products, variants) | UI de catálogo necesita endpoints |
| 4 (events) | 4 | UI de events necesita endpoints |
| 5 (sales) | 5 (parte: productos sueltos) | POS necesita endpoint POST /sales |
| 5 (sales) | 6 | Sales list y stats |
| 6 (hardening) | 7 (hardening) | En paralelo |
| **post-Fase 6 (combos)** | **3 (combos) + 5 (combos en POS) + 6 (combos en detalle)** | La feature de combos del backend (`feat(combos)`) habilita: el CombosPage del catálogo, los items de combo en el POS, y la distinción de items en el detalle de venta |

**Nota**: la feature de combos en backend está **post-MVP** (después de Fase 6 hardening). En frontend la integración cruza tres fases (3, 5, 6). Si el frontend va más lento que el backend, se puede arrancar el desarrollo del frontend Fase 3 sin combos y agregarlos después como un PR independiente — el endpoint y el modelo del backend no van a romper retrocompatibilidad.

Recomendación: completar backend hasta Fase 5 antes de empezar Frontend Fase 5. El backend siempre va un paso adelante.
