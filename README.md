# AppHub Homepage

Static Vite + React + TypeScript + TailwindCSS homepage for Cloudflare Pages.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Production URL: `https://apphub-uat.pages.dev`
- Backend/database: none
- Server-side Node.js: none
- Admin password validation: Cloudflare Pages Functions at `/api/admin/*`

Set these Cloudflare Pages environment variables:

```text
ADMIN_PIN=bcabca08
ADMIN_SESSION_SECRET=a-long-random-secret
```

`ADMIN_PIN` is checked only inside Pages Functions. It is not bundled into frontend code. Admin session uses an `HttpOnly`, `SameSite=Strict` cookie with a 2 hour max age.

## Local Development

```bash
npm install
npm run dev
```

For local admin auth with Pages Functions:

```bash
copy .dev.vars.example .dev.vars
npm run pages:dev
```

## Features

- Public homepage has no login, profile, or edit button.
- Public users can only open up to 8 visible shortcuts.
- `/admin` is the private route for owner editing.
- Shortcuts support name, URL, icon, color, order, save, export JSON, and import JSON.
- Shortcut icons are resolved automatically from each URL favicon, with the selected Lucide icon as fallback.
- Shortcut data is stored in browser `localStorage`.
- Weather uses Browser Geolocation API, Open-Meteo forecast, reverse geocoding, and Jakarta fallback when location is denied.

Reference docs:

- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages Functions bindings and environment variables](https://developers.cloudflare.com/pages/functions/bindings/)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
