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

Files are kept in the `APPHUB_CONFIG` KV namespace, capped at 2 MB each and 50
files total.

## Deploy

Pushing to `main` deploys to the `apphub-uat` Pages project through GitHub
Actions. It needs the repo secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; `scripts/setup-cloudflare-ci.sh` walks through setting
them up. Without the token the workflow still builds and tests, and skips only
the deploy step.
