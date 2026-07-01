import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { getAdminSession, loginAdmin, logoutAdmin } from '../lib/adminApi';
import { ArrowDown, ArrowUp, Download, LogOut, Plus, Save, ShieldCheck, shortcutIconNames, Trash, Upload } from '../lib/icons';
import {
  createCategoryDraft,
  createShortcutDraft,
  fetchGlobalShortcutConfig,
  MAX_SHORTCUTS,
  readShortcutConfig,
  saveGlobalShortcutConfig,
  saveShortcutConfig,
  Shortcut,
  ShortcutCategory,
} from '../lib/shortcuts';
import ShortcutGlyph from './ShortcutGlyph';
import { compressIcon } from '../lib/imageCompression';

type Notice = {
  tone: 'success' | 'error' | 'info';
  message: string;
};

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => readShortcutConfig().shortcuts);
  const [categories, setCategories] = useState<ShortcutCategory[]>(() => readShortcutConfig().categories);

  useEffect(() => {
    void getAdminSession()
      .then(setAuthenticated)
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void fetchGlobalShortcutConfig().then((globalConfig) => {
      if (!globalConfig) return;
      setShortcuts(globalConfig.shortcuts);
      setCategories(globalConfig.categories);
    });
  }, [authenticated]);

  const canSave = useMemo(
    () => shortcuts.length > 0 && shortcuts.length <= MAX_SHORTCUTS && shortcuts.every((item) => item.name.trim() && item.url.trim()),
    [shortcuts],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    try {
      await loginAdmin(pin);
      setAuthenticated(true);
      setPin('');
      setNotice({ tone: 'success', message: 'Admin Mode aktif.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'PIN tidak valid.' });
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    setAuthenticated(false);
    setNotice({ tone: 'info', message: 'Admin Mode nonaktif.' });
  }

  function updateShortcut(id: string, patch: Partial<Shortcut>) {
    setShortcuts((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function moveShortcut(index: number, direction: -1 | 1) {
    setShortcuts((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addShortcut() {
    setShortcuts((items) =>
      items.length >= MAX_SHORTCUTS ? items : [...items, { ...createShortcutDraft(items.length), categoryId: categories[0]?.id }],
    );
    setNotice({ tone: 'info', message: 'Aplikasi baru ditambahkan. Lengkapi nama dan URL, lalu simpan.' });
  }

  function removeShortcut(id: string) {
    setShortcuts((items) => items.filter((item) => item.id !== id));
  }

  function updateIconMode(id: string, iconMode: NonNullable<Shortcut['iconMode']>) {
    setShortcuts((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              iconMode,
              customIconDataUrl: iconMode === 'custom' ? item.customIconDataUrl : undefined,
            }
          : item,
      ),
    );
  }

  async function uploadCustomIcon(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setNotice({ tone: 'info', message: 'Mengoptimalkan icon...' });
      const compressed = await compressIcon(file);
      updateShortcut(id, {
        iconMode: 'custom',
        customIconDataUrl: compressed.dataUrl,
      });
      const originalKb = Math.max(1, Math.round(file.size / 1024));
      const compressedKb = Math.max(1, Math.round(compressed.dataUrl.length * 0.75 / 1024));
      setNotice({
        tone: 'success',
        message: `Icon otomatis dioptimalkan dari ${originalKb} KB menjadi sekitar ${compressedKb} KB (${compressed.width}×${compressed.height}). Klik Save Perubahan untuk menyimpan.`,
      });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Gagal mengompres icon.' });
    } finally {
      event.target.value = '';
    }
  }

  function clearCustomIcon(id: string) {
    updateShortcut(id, { customIconDataUrl: undefined });
  }

  function addCategory() {
    setCategories((items) => [...items, createCategoryDraft(items.length)]);
    setNotice({ tone: 'info', message: 'Kategori baru ditambahkan. Rename lalu simpan.' });
  }

  function updateCategory(id: string, patch: Partial<ShortcutCategory>) {
    setCategories((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function moveCategory(index: number, direction: -1 | 1) {
    setCategories((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeCategory(id: string) {
    if (categories.length <= 1) return;
    const fallbackId = categories.find((category) => category.id !== id)?.id || categories[0].id;
    setCategories((items) => items.filter((item) => item.id !== id));
    setShortcuts((items) => items.map((item) => (item.categoryId === id ? { ...item, categoryId: fallbackId } : item)));
  }

  async function handleSave() {
    try {
      const clean = await saveGlobalShortcutConfig({ shortcuts, categories });
      setShortcuts(clean.shortcuts);
      setCategories(clean.categories);
      setNotice({ tone: 'success', message: 'Shortcut global disimpan. Perubahan berlaku untuk semua pengguna.' });
    } catch (error) {
      const clean = saveShortcutConfig({ shortcuts, categories });
      setShortcuts(clean.shortcuts);
      setCategories(clean.categories);
      setNotice({
        tone: 'error',
        message: `${error instanceof Error ? error.message : 'Gagal menyimpan shortcut global.'} Perubahan hanya tersimpan lokal di browser ini.`,
      });
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ shortcuts, categories }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'apphub-shortcuts.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice({ tone: 'success', message: 'JSON shortcut diekspor.' });
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed) ? parsed : parsed.shortcuts;
        if (!Array.isArray(list)) throw new Error('Format JSON harus array atau { shortcuts: [] }.');
        const clean = saveShortcutConfig({ shortcuts: list.slice(0, MAX_SHORTCUTS), categories: parsed.categories });
        setShortcuts(clean.shortcuts);
        setCategories(clean.categories);
        setNotice({ tone: 'success', message: `JSON diimpor. Maksimal ${MAX_SHORTCUTS} shortcut aktif.` });
      } catch (error) {
        setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'JSON tidak valid.' });
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  if (checking) {
    return (
      <main className="admin-shell grid min-h-dvh place-items-center">
        <div className="admin-card w-full max-w-md">
          <p className="text-sm font-semibold text-slate-500">Admin Mode</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">Memeriksa session...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-shell grid min-h-dvh place-items-center px-4">
        <form className="admin-card w-full max-w-md" onSubmit={handleLogin}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-normal text-slate-950">Admin Mode</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masukkan PIN owner. Validasi dilakukan oleh Cloudflare Pages Function, bukan frontend.
          </p>
          <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="admin-pin">
            Password / PIN
          </label>
          <input className="sr-only" type="text" name="username" autoComplete="username" value="admin" readOnly tabIndex={-1} />
          <input
            id="admin-pin"
            className="field mt-2"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            minLength={1}
          />
          <button className="primary-button mt-5 w-full" type="submit">
            Masuk
          </button>
          {notice ? <NoticeBanner notice={notice} /> : null}
          <a className="mt-6 inline-flex text-sm font-semibold text-slate-600 hover:text-slate-950" href="/">
            Kembali ke homepage
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Private Owner Area</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-slate-950">Edit Shortcuts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Perubahan urutan dan aplikasi disimpan sebagai konfigurasi global. Export JSON tetap tersedia untuk backup.
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={() => void handleLogout()}>
            <LogOut size={18} />
            Keluar
          </button>
        </header>

        {notice ? <NoticeBanner notice={notice} /> : null}

        <section className="category-admin-panel">
          <div className="category-admin-head">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Kategori</p>
              <h2>Kelompok aplikasi</h2>
            </div>
            <button className="secondary-button" type="button" onClick={addCategory}>
              <Plus size={18} />
              Tambah Kategori
            </button>
          </div>
          <div className="category-editor-grid">
            {categories.map((category, index) => (
              <div className="category-editor-item" key={category.id}>
                <span>Nama Kategori</span>
                <input className="field" value={category.name} onChange={(event) => updateCategory(category.id, { name: event.target.value })} />
                <div className="category-editor-actions">
                  <button className="icon-button" type="button" onClick={() => moveCategory(index, -1)} disabled={index === 0} aria-label="Naikkan kategori">
                    <ArrowUp size={18} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categories.length - 1}
                    aria-label="Turunkan kategori"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    className="icon-button danger-button"
                    type="button"
                    onClick={() => removeCategory(category.id)}
                    disabled={categories.length <= 1}
                    aria-label={`Hapus kategori ${category.name}`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5">
          {shortcuts.map((shortcut, index) => {
            return (
              <article className="editor-row" key={shortcut.id}>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <ShortcutGlyph shortcut={shortcut} iconSize={28} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Urutan {index + 1}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{shortcut.name}</p>
                  </div>
                </div>

                <div className="editor-fields">
                  <label>
                    <span>Nama</span>
                    <input className="field" value={shortcut.name} onChange={(event) => updateShortcut(shortcut.id, { name: event.target.value })} />
                  </label>
                  <label>
                    <span>URL</span>
                    <input className="field" value={shortcut.url} onChange={(event) => updateShortcut(shortcut.id, { url: event.target.value })} />
                  </label>
                  <label>
                    <span>Kategori</span>
                    <select
                      className="field"
                      value={shortcut.categoryId || categories[0]?.id}
                      onChange={(event) => updateShortcut(shortcut.id, { categoryId: event.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Sumber Icon</span>
                    <select
                      className="field"
                      value={shortcut.iconMode ?? 'favicon'}
                      onChange={(event) => updateIconMode(shortcut.id, event.target.value as NonNullable<Shortcut['iconMode']>)}
                    >
                      <option value="favicon">Favicon Web</option>
                      <option value="custom">Upload Sendiri</option>
                      <option value="generic">Generic</option>
                    </select>
                  </label>
                  <label>
                    <span>Generic Icon</span>
                    <select
                      className="field"
                      value={shortcut.icon}
                      onChange={(event) => updateShortcut(shortcut.id, { icon: event.target.value as Shortcut['icon'] })}
                    >
                      {shortcutIconNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Warna</span>
                    <input
                      className="field h-12 p-1"
                      value={shortcut.color}
                      type="color"
                      onChange={(event) => updateShortcut(shortcut.id, { color: event.target.value })}
                    />
                  </label>
                  <label className="upload-field">
                    <span>Upload</span>
                    <input className="field file-field" type="file" accept="image/*" onChange={(event) => void uploadCustomIcon(shortcut.id, event)} />
                    {shortcut.customIconDataUrl ? (
                      <button className="text-button" type="button" onClick={() => clearCustomIcon(shortcut.id)}>
                        Hapus upload
                      </button>
                    ) : null}
                  </label>
                </div>

                <div className="flex gap-2 justify-self-end">
                  <button className="icon-button" type="button" onClick={() => moveShortcut(index, -1)} disabled={index === 0} aria-label="Naikkan urutan">
                    <ArrowUp size={18} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => moveShortcut(index, 1)}
                    disabled={index === shortcuts.length - 1}
                    aria-label="Turunkan urutan"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    className="icon-button danger-button"
                    type="button"
                    onClick={() => removeShortcut(shortcut.id)}
                    disabled={shortcuts.length <= 1}
                    aria-label={`Hapus ${shortcut.name}`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <div className="admin-actions">
          <button className="secondary-button" type="button" onClick={addShortcut} disabled={shortcuts.length >= MAX_SHORTCUTS}>
            <Plus size={18} />
            Tambah Aplikasi
          </button>
          <button className="primary-button" type="button" onClick={() => void handleSave()} disabled={!canSave}>
            <Save size={18} />
            Save Perubahan
          </button>
          <button className="secondary-button" type="button" onClick={exportJson}>
            <Download size={18} />
            Export JSON
          </button>
          <label className="secondary-button cursor-pointer">
            <Upload size={18} />
            Import JSON
            <input className="sr-only" type="file" accept="application/json" onChange={importJson} />
          </label>
          <a className="secondary-button" href="/">
            Lihat Homepage
          </a>
        </div>
      </div>
    </main>
  );
}

function NoticeBanner({ notice }: { notice: Notice }) {
  const toneClass =
    notice.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : notice.tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-800'
        : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${toneClass}`} role="status" aria-live="polite">
      {notice.message}
    </div>
  );
}
