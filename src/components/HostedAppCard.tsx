import { MouseEvent, useState } from 'react';
import { ArrowUpRight, Download } from '../lib/icons';
import ShortcutGlyph from './ShortcutGlyph';
import { hostedAppId, Shortcut } from '../lib/shortcuts';
import { closeTab, fillReservedTab, readCachedApp, reserveTab, writeCachedApp } from '../lib/localAppCache';

type HostedAppCardProps = {
  shortcut: Shortcut;
  onNotice: (message: string, tone: 'info' | 'error' | 'success') => void;
};

type HostedAppListResponse = {
  apps?: Array<{ id: string; version?: string }>;
};

/**
 * A card for a file stored in AppHub. Files are meant to run offline, so the
 * click never opens a page hosted by Cloudflare. Instead it:
 *   1. opens the copy already saved inside this browser, when there is one;
 *   2. otherwise fetches the bytes once, keeps a copy, and opens it right away.
 * Either way the app runs from local bytes, and a repeat click needs no download.
 */
export default function HostedAppCard({ shortcut, onNotice }: HostedAppCardProps) {
  const [busy, setBusy] = useState(false);
  const appId = hostedAppId(shortcut.url);

  /**
   * The upload timestamp is a cheap version stamp: a re-uploaded file gets a new
   * one, so the cached copy is replaced instead of going stale. If the listing
   * is unavailable the cached copy is still used, since being offline is the
   * normal way this app is meant to run.
   */
  async function currentVersion() {
    try {
      const response = await fetch('/api/apps', { cache: 'no-store' });
      if (!response.ok) return '';
      const payload = (await response.json()) as HostedAppListResponse;
      return payload.apps?.find((app) => app.id === appId)?.version ?? '';
    } catch {
      return '';
    }
  }

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!appId) return;
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    // Reserve the tab now, while the user gesture is still active.
    const tab = reserveTab();

    try {
      const version = await currentVersion();
      const cached = await readCachedApp(appId);
      if (cached && version && cached.version === version) {
        if (fillReservedTab(tab, cached.blob)) {
          onNotice(`${shortcut.name} dibuka dari salinan lokal di komputer ini.`, 'success');
          return;
        }
      }

      const response = await fetch(`/api/apps/${appId}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Gagal mengambil file dari AppHub.');
      const blob = await response.blob();
      await writeCachedApp({ id: appId, version: version || String(Date.now()), blob, savedAt: Date.now() });

      if (fillReservedTab(tab, blob)) {
        onNotice(
          cached ? `${shortcut.name} diperbarui dan dibuka.` : `${shortcut.name} tersimpan di komputer ini dan dibuka.`,
          'success',
        );
        return;
      }

      // Popup blocked: hand the file over as a normal download instead.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${appId}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      onNotice(`${shortcut.name} diunduh. Buka file itu dari folder Downloads.`, 'success');
      closeTab(tab);
    } catch (error) {
      closeTab(tab);
      onNotice(error instanceof Error ? error.message : 'Gagal membuka aplikasi.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <a
      className="shortcut-card group"
      href={`/api/apps/${appId}`}
      onClick={(event) => void handleClick(event)}
      aria-label={`Buka ${shortcut.name} dari file lokal`}
      aria-busy={busy}
      data-offline-card="true"
    >
      <span className="shortcut-launch" aria-hidden="true">
        {busy ? <Download size={15} strokeWidth={2.4} /> : <ArrowUpRight size={15} strokeWidth={2.4} />}
      </span>
      <ShortcutGlyph shortcut={shortcut} iconSize={42} />
      <span className="shortcut-copy">
        <span className="shortcut-label">{shortcut.name}</span>
      </span>
    </a>
  );
}
