@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "APPHUB_HTML=%~1"
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 (
  set "PYTHON=py -3"
  goto launch
)
python -c "import sys; assert sys.version_info.major == 3" >nul 2>&1
if not errorlevel 1 (
  set "PYTHON=python"
  goto launch
)
echo Error: Python 3 is required. Install Python 3 and run again.
pause
exit /b 1

:launch
%PYTHON% -u -c "import os,pathlib,socket,subprocess,sys,threading,time,urllib.parse,urllib.request; exec('files = sorted(p for p in pathlib.Path().iterdir() if p.is_file() and p.suffix.lower() == \'.html\')\nrequested = pathlib.Path(os.environ[\'APPHUB_HTML\']) if os.environ.get(\'APPHUB_HTML\') else None\nif requested and (not requested.is_file() or requested.resolve().parent != pathlib.Path.cwd() or requested.suffix.lower() != \'.html\'):\n    sys.exit(\'Error: The requested HTML file must exist next to this launcher.\')\nif not files:\n    sys.exit(\'Error: No HTML files found. Copy this launcher next to your HTML file.\')\nfile = requested or next((p for p in files if p.name == \'index.html\'), files[0])\nfor port in range(8080,8091):\n    with socket.socket() as probe:\n        try:\n            probe.bind((\'127.0.0.1\',port))\n        except OSError:\n            continue\n        break\nelse:\n    sys.exit(\'Error: All ports from 8080 through 8090 are busy. Free a port and try again.\')\nurl = \'http://localhost:\' + str(port) + \'/\' + urllib.parse.quote(file.name)\ndef open_when_ready():\n    for attempt in range(50):\n        try:\n            with urllib.request.urlopen(url,timeout=0.2) as response:\n                ready = response.status == 200\n        except Exception:\n            ready = False\n        if ready:\n            subprocess.run([\'cmd\',\'/c\',\'start\',\'\',url],check=True)\n            print(\'Opened: \' + url)\n            print(\'Paste this URL into the AppHub admin page: https://apphub-uat.pages.dev/admin\')\n            return\n        time.sleep(0.1)\n    print(\'Error: Server did not become ready. Check the terminal output.\',file=sys.stderr)\nthreading.Thread(target=open_when_ready,daemon=True).start()\nprint(\'Serving: \' + url)\nprint(\'Press Ctrl-C to stop the server.\')\nserver = subprocess.Popen([sys.executable,\'-m\',\'http.server\',str(port),\'--bind\',\'127.0.0.1\'])\ntry:\n    sys.exit(server.wait())\nexcept KeyboardInterrupt:\n    try:\n        server.wait(timeout=3)\n    except subprocess.TimeoutExpired:\n        server.terminate()\n        server.wait()\n')"
if errorlevel 1 (
  pause
  exit /b 1
)
endlocal
