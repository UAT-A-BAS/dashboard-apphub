# Local HTML launcher

1. Copy `start.command` and `start.bat` next to your single-file HTML app.
2. Install Python 3 if it is not already installed.
3. On macOS, double-click `start.command`. On Windows, double-click `start.bat`.
4. The launcher opens your app and prints its URL. Keep the terminal open.
5. In https://apphub-uat.pages.dev/admin, create or edit an app and paste
   `http://localhost:PORT/index.html` into its URL field, replacing `PORT`
   and the filename with the exact values printed by the launcher. Save it.

The launcher prefers `index.html`, otherwise the first HTML file alphabetically.
You can also pass a filename, for example `./start.command "My App.html"`
or `start.bat "My App.html"` from a terminal.
It uses port 8080, or the first free port through 8090.
If the chosen port changes, update the URL in AppHub.

The localhost URL works only on the machine running the server. Each person
needs their own HTML file and running launcher. This does not upload the HTML
to AppHub or start a server automatically when an AppHub shortcut is clicked.
Press Ctrl-C in the terminal to stop the server.

If macOS reports a permission error, run `chmod +x start.command` in that folder.
