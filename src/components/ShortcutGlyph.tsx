import { shortcutIcons } from '../lib/icons';
import { getCustomShortcutIcon, Shortcut } from '../lib/shortcuts';

type ShortcutGlyphProps = {
  shortcut: Shortcut;
  iconSize?: number;
};

export default function ShortcutGlyph({ shortcut, iconSize = 30 }: ShortcutGlyphProps) {
  const customIconUrl = getCustomShortcutIcon(shortcut);
  const Icon = shortcutIcons[shortcut.icon] ?? shortcutIcons.Home;

  return (
    <span
      className={`shortcut-icon ${customIconUrl ? 'shortcut-icon-brand' : ''}`}
      style={{ backgroundColor: customIconUrl ? 'rgba(255, 255, 255, 0.92)' : shortcut.color }}
    >
      {customIconUrl ? (
        <img
          className="shortcut-brand-image"
          src={customIconUrl}
          alt=""
          decoding="async"
          loading="lazy"
        />
      ) : (
        <Icon size={iconSize} strokeWidth={2} />
      )}
    </span>
  );
}
