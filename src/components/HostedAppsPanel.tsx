import { ChangeEvent, useEffect, useState } from 'react';
import { Trash, Upload } from '../lib/icons';
import { deleteHostedApp, HostedApp, listHostedApps, uploadHostedApp } from '../lib/adminApi';

type Notice = {
  tone: 'success' | 'error' | 'info';
  message: string;
};

type HostedAppsPanelProps = {
  onNotice: (notice: Notice) => void;
  onPickUrl: (url: string) => void;
};

function formatBytes(bytes: number) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export default function HostedAppsPanel({ onNotice, onPickUrl }: HostedAppsPanelProps) {
  const [apps, setApps] = useState<HostedApp[]>([]);
  const [maxBytes, setMaxBytes] = useState(0);
  const [appName, setAppName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listHostedApps()
      .then((result) => {
        setApps(result.apps);
        setMaxBytes(result.maxBytes);
      })
      .catch(() => {
        // The panel is optional; a failed listing must not block the editor.
      });
  }, []);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const name = appName.trim() || file.name.replace(/\.html?$/i, '');
    if (!name) {
      onNotice({ tone: 'error', message: 'Isi nama aplikasi dulu.' });
      return;
    }
    if (maxBytes && file.size > maxBytes) {
      onNotice({ tone: 'error', message: `File terlalu besar (${formatBytes(file.size)}). Maksimum ${formatBytes(maxBytes)}.` });
      return;
    }

    setBusy(true);
    onNotice({ tone: 'info', message: 'Mengunggah file...' });
    try {
      const html = await file.text();
      const result = await uploadHostedApp(name, html);
      setApps((items) => [...items, result.app]);
      setAppName('');
      onNotice({
        tone: 'success',
        message: `${result.app.name} tersimpan di AppHub. Klik "Pakai URL ini" untuk menambahkan kartunya.`,
      });
    } catch (error) {
      onNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Gagal mengunggah aplikasi.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(app: HostedApp) {
    if (!window.confirm(`Hapus "${app.name}" dari AppHub? Kartu yang memakai URL ini akan berhenti bekerja.`)) return;
    setBusy(true);
    try {
      await deleteHostedApp(app.id);
      setApps((items) => items.filter((item) => item.id !== app.id));
      onNotice({ tone: 'success', message: `${app.name} dihapus.` });
    } catch (error) {
      onNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Gagal menghapus aplikasi.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="category-admin-panel">
      <div className="category-admin-head">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">File di AppHub</p>
          <h2>Aplikasi HTML tersimpan</h2>
        </div>
        <span className="text-sm font-semibold text-slate-500">{apps.length} file</span>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600">
        File disimpan di AppHub, jadi siapa pun yang membuka URL-nya ikut melihat versi yang sama.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="field"
          value={appName}
          onChange={(event) => setAppName(event.target.value)}
          placeholder="Nama aplikasi (mis. Kalkulator Cuti)"
          aria-label="Nama aplikasi"
        />
        <label className={`secondary-button cursor-pointer text-center ${busy ? 'opacity-60' : ''}`}>
          <Upload size={18} />
          {busy ? 'Memproses...' : 'Upload HTML'}
          <input className="sr-only" type="file" accept="text/html,.html,.htm" onChange={(event) => void handleFile(event)} disabled={busy} />
        </label>
      </div>
      {maxBytes ? <p className="mt-2 text-xs font-semibold text-slate-500">Maksimum {formatBytes(maxBytes)} per file, single file.</p> : null}

      {apps.length ? (
        <ul className="mt-5 grid gap-2">
          {apps.map((app) => (
            <li className="category-editor-item flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" key={app.id}>
              <div>
                <p className="text-sm font-semibold text-slate-950">{app.name}</p>
                <p className="text-xs font-semibold text-slate-500">
                  /apps/{app.id}/ <span aria-hidden="true">-</span> {formatBytes(app.bytes)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a className="text-button" href={`/apps/${app.id}/`} target="_blank" rel="noreferrer">
                  Buka
                </a>
                <button className="text-button" type="button" onClick={() => onPickUrl(`/apps/${app.id}/`)}>
                  Pakai URL ini
                </button>
                <button className="icon-button" type="button" onClick={() => void handleDelete(app)} disabled={busy} aria-label={`Hapus ${app.name}`}>
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Belum ada file yang diunggah.</p>
      )}
    </section>
  );
}
