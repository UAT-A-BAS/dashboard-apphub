import { useEffect, useMemo, useState } from 'react';
import { shortcutIcons } from '../lib/icons';
import {
  getCustomShortcutIcon,
  getFaviconCandidates,
  rememberFaviconFailure,
  rememberFaviconSuccess,
  Shortcut,
} from '../lib/shortcuts';

type ShortcutGlyphProps = {
  shortcut: Shortcut;
  iconSize?: number;
};

export default function ShortcutGlyph({ shortcut, iconSize = 30 }: ShortcutGlyphProps) {
  const customIconUrl = getCustomShortcutIcon(shortcut);
  const candidates = useMemo(() => getFaviconCandidates(shortcut.url), [shortcut.url]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const faviconUrl = customIconUrl || candidates[candidateIndex];
  const Icon = shortcutIcons[shortcut.icon] ?? shortcutIcons.Home;

  useEffect(() => {
    setCandidateIndex(0);
  }, [shortcut.url]);

  return (
    <span
      className={`shortcut-icon ${customIconUrl ? 'shortcut-icon-brand' : ''}`}
      style={{ backgroundColor: faviconUrl ? 'rgba(255, 255, 255, 0.92)' : shortcut.color }}
    >
      {faviconUrl ? (
        <img
          className={customIconUrl ? 'shortcut-brand-image' : 'shortcut-favicon'}
          src={faviconUrl}
          alt=""
          decoding="async"
          loading="lazy"
          onLoad={() => {
            if (!customIconUrl) rememberFaviconSuccess(shortcut.url, faviconUrl);
          }}
          onError={() => {
            if (!customIconUrl) {
              rememberFaviconFailure(shortcut.url, faviconUrl);
              setCandidateIndex((index) => index + 1);
            }
          }}
        />
      ) : (
        <Icon size={iconSize} strokeWidth={2} />
      )}
    </span>
  );
}
