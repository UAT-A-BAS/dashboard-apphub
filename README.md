# AppHub Homepage

Static Vite + React + TypeScript + TailwindCSS homepage for Cloudflare Pages.

https://apphub-uat.pages.dev/

## Shortcut links

Shortcuts can point at a public URL or at a local server on the visitor's own
machine, for example `http://localhost:8080/index.html`. The admin form accepts a
bare `localhost:8080/...` and writes the correct `http://` scheme itself. A local
link only opens on the machine that runs that server.

One-click launchers for a single-file local HTML app live in
`tools/local-app/` (macOS `start.command`, Windows `start.bat`).

## Uploaded apps

The admin page can store a single-file HTML app in AppHub itself, so everyone who
opens its `/apps/<id>/` URL sees the same file. Stored apps are served with a
`sandbox` Content-Security-Policy, which runs them in an opaque origin: they
cannot read the admin cookie, `localStorage`, or the admin API.

### Replacing a stored file

Each row in **Aplikasi HTML tersimpan** has a **Ganti File** button. Picking a new
HTML file overwrites the stored bytes through `PUT /api/admin/apps` while keeping
the same id, so the `/apps/<id>/` URL, every shortcut card, and any shared link
keep working. The new `uploadedAt` stamp invalidates the cached copy in each
visitor's browser, so the next click opens the new version.

Replacing is not the same as re-uploading: a new upload creates a second app with
a suffixed id (`nama-2`) and needs its card added again. Use **Ganti File** when
the id and the cards should stay put.

Files are kept in the `APPHUB_CONFIG` KV namespace, capped at 25 MB each and 50
files total.

## Deploy

Pushing to `main` deploys to the `apphub-uat` Pages project through GitHub
Actions. It needs the repo secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; `scripts/setup-cloudflare-ci.sh` walks through setting
them up. Without the token the workflow still builds and tests, and skips only
the deploy step.
