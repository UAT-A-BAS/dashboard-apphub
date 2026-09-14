export async function getAdminSession() {
  const response = await fetch('/api/admin/session', { credentials: 'include' });
  if (!response.ok) return false;
  const payload = (await response.json()) as { authenticated?: boolean };
  return Boolean(payload.authenticated);
}

export async function loginAdmin(pin: string) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pin }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'PIN tidak valid.' }));
    throw new Error(String(payload.message || 'PIN tidak valid.'));
  }
}

export async function logoutAdmin() {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export type HostedApp = {
  id: string;
  name: string;
  bytes: number;
  uploadedAt: string;
};

export async function listHostedApps() {
  const response = await fetch('/api/admin/apps', { credentials: 'include', cache: 'no-store' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Gagal memuat daftar aplikasi.' }));
    throw new Error(String(payload.message || 'Gagal memuat daftar aplikasi.'));
  }
  const payload = (await response.json()) as { apps?: HostedApp[]; maxBytes?: number };
  return { apps: Array.isArray(payload.apps) ? payload.apps : [], maxBytes: payload.maxBytes ?? 0 };
}

export async function uploadHostedApp(name: string, html: string) {
  const response = await fetch('/api/admin/apps', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, html }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Gagal mengunggah aplikasi.' }));
    throw new Error(String(payload.message || 'Gagal mengunggah aplikasi.'));
  }
  return (await response.json()) as { app: HostedApp; url: string };
}

export async function deleteHostedApp(id: string) {
  const response = await fetch(`/api/admin/apps?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Gagal menghapus aplikasi.' }));
    throw new Error(String(payload.message || 'Gagal menghapus aplikasi.'));
  }
}

/**
 * Download the stored bytes so the file can be opened from disk instead of
 * being served by Cloudflare. The stored file has no extension, so a filename
 * is always supplied for the save dialog.
 */
export async function downloadHostedApp(app: HostedApp) {
  const response = await fetch(`/api/apps/${encodeURIComponent(app.id)}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Gagal mengunduh file.');
  }
  const blob = await response.blob();
  const filename = `${app.id}.html`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
}
