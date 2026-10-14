# choirchaos-pb

[PocketBase](https://pocketbase.io) backend for ChoirChaos.

## Run locally

```bash
docker compose up --build
```

- Dashboard: http://localhost:8090/_/
- API: http://localhost:8090/api/

To use a different port, set `PB_PORT` (e.g. `PB_PORT=9000 docker compose up`) or put it in a `.env` file.

On first start with an empty `pb_data/`, all migrations are applied automatically and a link to create the first superuser is printed in the logs.

## Structure

- `pb_migrations/` – schema migrations (committed)
- `pb_hooks/` – JS hooks (committed)
- `pb_data/` – database and uploaded files (not committed)

## Schema changes

Change collections in the **local** dashboard only. PocketBase writes a migration file to `pb_migrations/`; commit it and deploy. Production applies pending migrations on startup.
