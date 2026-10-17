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

## Audio uploads

`pb_hooks/audio.pb.js` converts every file uploaded to `songs.audioFiles` to VBR MP3 before the record is saved. ffmpeg decodes any format it can read to WAV, then `lame` encodes it. The encoder settings live in `pb_hooks/audio.js`. Files are renamed to `.mp3` and keep their upload order. A file that cannot be decoded fails the whole request and nothing is stored.

PocketBase validates the field after the conversion, so the `audio/mpeg` MIME restriction and the field's max file size apply to the converted MP3, not to the upload. Large WAV uploads are therefore only limited by the request size limits below.

Conversion runs inside the upload request, roughly 1 to 3 seconds per five-minute track, and the proxy holds the whole upload. On Dokku, raise the nginx limits once per app:

```bash
dokku nginx:set <app> proxy-read-timeout 300s
dokku nginx:set <app> client-max-body-size 1000m
dokku proxy:build-config <app>
```
