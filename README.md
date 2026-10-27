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

To test a migration on real data, copy production's `pb_data` into a scratch folder (the local `pull-pb-data.sh` helper replaces the `pb_data/` next to itself, so run a copy of it from that folder) and run `pocketbase migrate up --dir=<copy>` there. Never point it at the production server's data.

## Songs

A song stores its measures and everything that refers to them in three JSON fields. Each field is always read and written as a whole, and they reference each other only through measure IDs:

- `score`: `{ measures, unnumberedBoxes }`. Measures in score order, each `{ id, label, beats, layout? }`. IDs are `m1`, `m2`, … and never change. Labels are the printed numbers as free text (`"12"`, `"12a"`). `unnumberedBoxes` are boxes on the PDF that belong to no measure yet.
- `recording`: `{ spans, warpMarkers }`. The order in which the backing track plays the measures, as inclusive `{ from, to }` spans of measure IDs, and for audio songs the sync anchors `{ measure, occurrence, time }` (time in seconds).
- `arrangement`: `{ markers, sections, segue }`. Markers `{ at, text }` and cut, repeat and vamp sections, all placed with locations `{ measure, beat, occurrence? }`.

A MIDI song (`midiFile` plus the beat map `jsonFile`) has exactly the measures of its beat map. The client builds `score` and `recording` from the beat map when it is uploaded.

`1792936800_updated_songs.js` converted the old fields `measures`, `unnumberedBoxes`, `warpMarkers` and `events` into these three fields:

- Audio songs keep their measures in the old numbering order as `m1..mn`, labelled with the old number, and play one span over all of them.
- MIDI songs are rebuilt from their stored beat map: `N-k` labels are passes of measure `N`, the terminal bar is dropped, and the layouts move to the written measures.
- Markers, vamps and warp markers move to measure IDs and occurrences. Vamps become `vamp` sections ending on their last beat that play until released, whatever their old `iterations` count, and keep their `out` and `vocals` settings. References that no longer resolve are dropped, and the migration logs them.

Its down migration restores the old fields, losing what they cannot express: occurrences, cuts, repeats, and the `N-k` and terminal measures of MIDI songs. Vamps come back with `iterations: 0`, which the old format plays until released.

## Audio uploads

`pb_hooks/audio.pb.js` converts every file uploaded to `songs.audioFiles` to VBR MP3 before the record is saved. ffmpeg decodes any format it can read to WAV, then `lame` encodes it. The encoder settings live in `pb_hooks/audio.js`. Files are renamed to `.mp3` and keep their upload order. A file that cannot be decoded fails the whole request and nothing is stored.

PocketBase validates the field after the conversion, so the `audio/mpeg` MIME restriction and the field's max file size apply to the converted MP3, not to the upload. Large WAV uploads are therefore only limited by the request size limits below.

Conversion runs inside the upload request, roughly 1 to 3 seconds per five-minute track, and the proxy holds the whole upload. On Dokku, raise the nginx limits once per app:

```bash
dokku nginx:set <app> proxy-read-timeout 300s
dokku nginx:set <app> client-max-body-size 1000m
dokku proxy:build-config <app>
```
