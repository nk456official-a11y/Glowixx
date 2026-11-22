# Glowixx

Приложение для просмотра разнообразного контента и переписок с друзьями или родственниками.

Glowixx — React / Express / tRPC / Drizzle приложение, адаптированное из Sandbox web-db-user template.

## Команды

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations.
- `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Platform login, storage, payments and service contracts live in the shared Webdev references. `server/_core/publicConfig.ts` exposes only named public runtime values; private keys stay server-side. The platform serves managed `/manus-storage/` assets, and the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints.
