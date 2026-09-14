#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' 'Error: Python 3 is required. Install Python 3 and run again.' >&2
  exit 1
fi

selection=$(python3 - "${1:-}" <<'PY'
import pathlib, socket, sys, urllib.parse
files = sorted(p for p in pathlib.Path('.').iterdir() if p.is_file() and p.suffix.lower() == '.html')
requested = pathlib.Path(sys.argv[1]) if sys.argv[1] else None
if requested and (not requested.is_file() or requested.resolve().parent != pathlib.Path.cwd() or requested.suffix.lower() != '.html'):
    sys.exit('Error: The requested HTML file must exist next to this launcher.')
if not files:
    sys.exit('Error: No HTML files found. Copy this launcher next to your HTML file.')
file = requested or next((p for p in files if p.name == 'index.html'), files[0])
for port in range(8080, 8091):
    with socket.socket() as probe:
        try:
            probe.bind(('127.0.0.1', port))
        except OSError:
            continue
        print(port)
        print('http://localhost:%d/%s' % (port, urllib.parse.quote(file.name)))
        break
else:
    sys.exit('Error: All ports from 8080 through 8090 are busy. Free a port and try again.')
PY
)
port=${selection%%$'\n'*}
url=${selection#*$'\n'}

# Wait for the foreground server before opening the browser.
python3 - "$url" <<'PY' &
import subprocess, sys, time, urllib.request
url = sys.argv[1]
for attempt in range(50):
    try:
        with urllib.request.urlopen(url, timeout=0.2) as response:
            ready = response.status == 200
    except Exception:
        ready = False
    if ready:
        subprocess.run(['open', url], check=True)
        print('Opened: ' + url, flush=True)
        print('Paste this URL into the AppHub admin page: https://apphub-uat.pages.dev/admin', flush=True)
        break
    time.sleep(0.1)
else:
    print('Error: Server did not become ready. Check the terminal output.', file=sys.stderr)
PY
opener_pid=$!
trap 'kill "$opener_pid" 2>/dev/null || true' EXIT
printf '%s\n' "Serving: $url" 'Press Ctrl-C to stop the server.'
python3 -m http.server "$port" --bind 127.0.0.1
