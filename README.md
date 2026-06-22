# CRM/POS Retail Frontend

Aplicacion SPA en React para consumir la API operacional de CRM/POS textil del repositorio `AlloyDbCrudApi`.

La interfaz reemplaza el demo CRUD de `items` y cubre los modulos principales del MVP: autenticacion, panel operativo, POS, clientes, productos, inventario, ventas, devoluciones y usuarios.

## Stack

- React 19 + Vite 8.
- TypeScript estricto.
- Tailwind CSS 4 con plugin oficial de Vite.
- shadcn/ui v4 como componentes fuente en `src/components/ui`.
- TanStack Router para rutas client-side.
- TanStack Query para cache, invalidacion y estados remotos.
- React Hook Form + Zod para formularios.
- Lucide React para iconos.
- Oxlint + Oxfmt como linter y formateador principal.

## Configuracion local

Instalar dependencias:

```powershell
pnpm install
```

Ejecutar contra la API local:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
pnpm run dev
```

Si `VITE_API_BASE_URL` no esta definido, la app usa el fallback:

```text
https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app
```

La API local se puede levantar desde `C:\Users\kabal\dev\UNi\AlloyDbCrudApi` con Docker Compose:

```powershell
docker compose up -d --build
```

## Usuarios demo

Estos usuarios son sembrados por el backend en entorno de desarrollo:

| Rol          | Correo                    | Contrasena        |
| ------------ | ------------------------- | ----------------- |
| Superadmin   | `superadmin@retail.local` | `Superadmin#2026` |
| Vendedor     | `vendedor@retail.local`   | `Vendedor#2026`   |
| Visualizador | `viewer@retail.local`     | `Viewer#2026`     |

## Scripts

```powershell
pnpm run dev        # Servidor Vite
pnpm run build      # Build de produccion
pnpm run preview    # Preview del build
pnpm run lint       # Oxlint
pnpm run lint:fix   # Oxlint con autofix
pnpm run fmt        # Oxfmt escribe formato
pnpm run fmt:check  # Verifica formato sin escribir
pnpm run check      # lint + fmt:check + build
```

## Rutas

| Ruta                    | Descripcion                    |
| ----------------------- | ------------------------------ |
| `/login`                | Inicio de sesion               |
| `/`                     | Panel operativo                |
| `/pos`                  | Registro de venta POS          |
| `/customers`            | Clientes CRM                   |
| `/products`             | Catalogo de productos          |
| `/inventory`            | Inventario por tienda/producto |
| `/sales`                | Listado de ventas              |
| `/sales/$transactionId` | Detalle de venta               |
| `/returns`              | Registro de devolucion         |
| `/users`                | Administracion de usuarios     |

## Permisos por rol

- `Superadmin`: acceso total, creacion de productos y usuarios, ventas y devoluciones.
- `Vendedor`: POS, clientes, lectura de productos, inventario, ventas y devoluciones.
- `Visualizador`: lectura de panel, clientes, productos y ventas. No ve inventario ni acciones de escritura.

El backend no expone `/me`; por eso la app decodifica el JWT y obtiene `sub`, `email`, `name` y claims de rol desde el access token.

## Integracion API

La capa `src/api.ts` centraliza:

- URL base desde `VITE_API_BASE_URL`.
- Persistencia de sesion en `localStorage`.
- Header `Authorization: Bearer`.
- Refresh automatico al recibir `401`.
- Tipos TypeScript de DTOs y resultados paginados.
- Mapeo local de enums numericos a etiquetas en espanol.

Los campos `DateOnly` se envian como `YYYY-MM-DD`. Las listas usan paginacion del backend con `page` y `pageSize`.

## Arquitectura frontend

La estructura sigue una separacion por aplicacion, componentes reutilizables y features:

```text
src/
  app/                 providers, router, auth, query client
  components/
    ui/                componentes shadcn fuente
    atoms/             piezas visuales pequenas
    molecules/         combinaciones reutilizables
    organisms/         layouts parciales y tablas
    templates/         shells de pagina
  features/            pantallas por dominio
  lib/                 utilidades compartidas
```

## Despliegue

El contenedor mantiene la forma original:

- `Dockerfile` compila con Node y sirve `dist` con nginx.
- `nginx.conf` redirige rutas SPA a `index.html`.
- La URL de API se inyecta en build con `VITE_API_BASE_URL`.

Ejemplo:

```powershell
docker build --build-arg VITE_API_BASE_URL="https://tu-api.run.app" -t crm-pos-frontend .
```

Despues de desplegar el frontend, su origen publico debe estar permitido en `Cors:AllowedOrigins` del backend.
