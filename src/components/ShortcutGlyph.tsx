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
  const iconMode = shortcut.iconMode ?? 'favicon';
  const uploadedIconUrl = iconMode === 'custom' ? shortcut.customIconDataUrl || '' : '';
  const brandIconUrl = iconMode === 'favicon' ? getCustomShortcutIcon(shortcut) : '';
  const candidates = useMemo(() => (iconMode === 'favicon' ? getFaviconCandidates(shortcut.url) : []), [iconMode, shortcut.url]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const faviconUrl = uploadedIconUrl || brandIconUrl || candidates[candidateIndex];
  const Icon = shortcutIcons[shortcut.icon] ?? shortcutIcons.Home;
  const hasFramedImage = Boolean(uploadedIconUrl || brandIconUrl);

  useEffect(() => {
    setCandidateIndex(0);
  }, [iconMode, shortcut.url]);

  return (
    <span
      className={`shortcut-icon ${hasFramedImage ? 'shortcut-icon-brand' : ''}`}
      style={{ backgroundColor: faviconUrl ? 'rgba(255, 255, 255, 0.92)' : shortcut.color }}
    >
      {faviconUrl ? (
        <img
          className={hasFramedImage ? 'shortcut-brand-image' : 'shortcut-favicon'}
          src={faviconUrl}
          alt=""
          decoding="async"
          loading="lazy"
          onLoad={() => {
            if (!uploadedIconUrl && !brandIconUrl) rememberFaviconSuccess(shortcut.url, faviconUrl);
          }}
          onError={() => {
            if (!uploadedIconUrl && !brandIconUrl) {
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
