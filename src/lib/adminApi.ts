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
