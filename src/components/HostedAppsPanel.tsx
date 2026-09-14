import { ChangeEvent, useEffect, useState } from 'react';
import { Plus, Trash, Upload } from '../lib/icons';
import { deleteHostedApp, HostedApp, listHostedApps, uploadHostedApp } from '../lib/adminApi';
import { ShortcutCategory } from '../lib/shortcuts';

type Notice = {
  tone: 'success' | 'error' | 'info';
  message: string;
};

type HostedAppsPanelProps = {
  onNotice: (notice: Notice) => void;
  categories: ShortcutCategory[];
  onAddShortcut: (input: { name: string; url: string; categoryId: string }) => void;
};

function formatBytes(bytes: number) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

type Draft = {
  id: string;
  name: string;
  categoryId: string;
  file: File | null;
};

function createDraft(categoryId: string): Draft {
  return {
    id: crypto.randomUUID(),
    name: '',
    categoryId,
    file: null,
  };
}

export default function HostedAppsPanel({ onNotice, categories, onAddShortcut }: HostedAppsPanelProps) {
  const [apps, setApps] = useState<HostedApp[]>([]);
  const [maxBytes, setMaxBytes] = useState(0);
  const defaultCategoryId = categories[0]?.id ?? '';
  const [drafts, setDrafts] = useState<Draft[]>(() => [createDraft(categories[0]?.id ?? '')]);
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

  function addDraft() {
    setDrafts((items) => [...items, createDraft(defaultCategoryId)]);
  }

  function removeDraft(id: string) {
    setDrafts((items) => (items.length <= 1 ? items : items.filter((item) => item.id !== id)));
  }

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function pickFile(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setDrafts((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, file, name: item.name.trim() || file.name.replace(/\.html?$/i, '') }
          : item,
      ),
    );
  }

  async function handleUploadAll() {
    const pending = drafts.filter((draft) => draft.file);
    if (!pending.length) {
      onNotice({ tone: 'error', message: 'Pilih minimal satu file HTML dulu.' });
      return;
    }
    const unnamed = pending.find((draft) => !draft.name.trim());
    if (unnamed) {
      onNotice({ tone: 'error', message: 'Setiap file butuh nama aplikasi.' });
      return;
    }
    const tooBig = maxBytes ? pending.find((draft) => (draft.file?.size ?? 0) > maxBytes) : undefined;
    if (tooBig?.file) {
      onNotice({
        tone: 'error',
        message: `${tooBig.file.name} (${formatBytes(tooBig.file.size)}) melebihi batas penyimpanan Cloudflare ${formatBytes(maxBytes)}.`,
      });
      return;
    }

    setBusy(true);
    let uploaded = 0;
    const failures: string[] = [];
    for (const draft of pending) {
      try {
        onNotice({ tone: 'info', message: `Mengunggah ${draft.name}...` });
        const html = await draft.file!.text();
        const result = await uploadHostedApp(draft.name.trim(), html);
        setApps((items) => [...items, result.app]);
        onAddShortcut({ name: result.app.name, url: result.url, categoryId: draft.categoryId });
        uploaded += 1;
      } catch (error) {
        failures.push(`${draft.name}: ${error instanceof Error ? error.message : 'gagal'}`);
      }
    }
    setBusy(false);
    setDrafts([createDraft(defaultCategoryId)]);

    if (failures.length) {
      onNotice({ tone: 'error', message: `Sebagian gagal. ${failures.join(' | ')}` });
      return;
    }
    onNotice({
      tone: 'success',
      message: `${uploaded} file tersimpan di AppHub dan kartunya ditambahkan ke kategori terkait. Klik Save Perubahan untuk menyimpan daftar kartu.`,
    });
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
        File disimpan di AppHub, jadi siapa pun yang membuka URL-nya ikut melihat versi yang sama. Tiap file bisa
        ditaruh di kategori mana pun, dan kartunya langsung dibuat setelah upload.
      </p>

      <div className="grid gap-3">
        {drafts.map((draft, index) => (
          <div className="category-editor-item grid gap-2" key={draft.id}>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">File {index + 1}</span>
            <input
              className="field"
              value={draft.name}
              onChange={(event) => updateDraft(draft.id, { name: event.target.value })}
              placeholder="Nama aplikasi (mis. Kalkulator Cuti)"
              aria-label={`Nama aplikasi ${index + 1}`}
              disabled={busy}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="field"
                value={draft.categoryId}
                onChange={(event) => updateDraft(draft.id, { categoryId: event.target.value })}
                aria-label={`Kategori aplikasi ${index + 1}`}
                disabled={busy}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className={`secondary-button cursor-pointer justify-center text-center ${busy ? 'opacity-60' : ''}`}>
                <Upload size={18} />
                {draft.file ? draft.file.name.slice(0, 28) : 'Pilih file HTML'}
                <input
                  className="sr-only"
                  type="file"
                  accept="text/html,.html,.htm"
                  onChange={(event) => pickFile(draft.id, event)}
                  disabled={busy}
                />
              </label>
            </div>
            {drafts.length > 1 ? (
              <button className="text-button justify-self-start" type="button" onClick={() => removeDraft(draft.id)} disabled={busy}>
                Hapus baris ini
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className="secondary-button" type="button" onClick={addDraft} disabled={busy}>
          <Plus size={18} />
          Tambah File
        </button>
        <button className="primary-button" type="button" onClick={() => void handleUploadAll()} disabled={busy}>
          <Upload size={18} />
          {busy ? 'Memproses...' : 'Upload ke AppHub'}
        </button>
      </div>
      {maxBytes ? (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Batas Cloudflare {formatBytes(maxBytes)} per file. Single file, jadi gambar dan gaya harus ikut di dalam.
        </p>
      ) : null}

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
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onAddShortcut({ name: app.name, url: `/apps/${app.id}/`, categoryId: defaultCategoryId })}
                >
                  Tambah Kartu
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
