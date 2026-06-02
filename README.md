# Botica Frontend

Interfaz React + TypeScript conectada a Supabase para el esquema `db_botica_supabase.sql`.

## Variables

Crear `.env.local`:

```env
VITE_SUPABASE_URL=https://sydzlregwastikkqfbme.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

La cadena `postgresql://...` no debe usarse en React. Es solo para migraciones, scripts backend o herramientas como `psql`.

## Requisito de acceso

El SQL activa RLS. Para que el usuario pueda ver datos:

1. Crear el usuario en Supabase Auth.
2. Vincularlo con `public.usuarios.auth_user_id`.

```sql
update public.usuarios
set auth_user_id = '<uuid-del-usuario-auth>'
where email = 'admin@botica.com';
```

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Capas

```txt
src/
  domain/                 # modelos del negocio y datos semilla de respaldo
  application/            # casos de uso que consume la UI
  infrastructure/supabase # cliente, tipos DB y repositorio Supabase
  presentation/           # composicion de pantallas y componentes UI
```

La UI llama a `application/*UseCases`. La capa de aplicacion delega en `infrastructure/supabase`, donde viven los detalles de tablas, mapeos y cliente Supabase.

## Migracion Angular a React

Las vistas principales de `angular_botica` fueron reflejadas en React:

- Dashboard, ventas, pedidos, detalles, boletas
- Productos, categorias, inventario
- Clientes, proveedores
- Reportes, roles, usuarios y backups

La matriz de campos contra Supabase esta en `../docs/angular_supabase_parameter_matrix.md`.

## Verificacion

```bash
pnpm lint
pnpm build
```
