import { ArrowUpRight } from '../lib/icons';
import ShortcutGlyph from './ShortcutGlyph';
import { Shortcut } from '../lib/shortcuts';

type ShortcutGridProps = {
  shortcuts: Shortcut[];
};

export default function ShortcutGrid({ shortcuts }: ShortcutGridProps) {
  return (
    <section className="shortcut-grid" aria-label="Shortcut favorit">
      {shortcuts.slice(0, 8).map((shortcut) => (
        <a
          className="shortcut-card group"
          href={shortcut.url}
          target="_blank"
          rel="noreferrer"
          key={shortcut.id}
          aria-label={`Buka ${shortcut.name}`}
        >
          <span className="shortcut-launch" aria-hidden="true">
            <ArrowUpRight size={15} strokeWidth={2.4} />
          </span>
          <ShortcutGlyph shortcut={shortcut} iconSize={42} />
          <span className="shortcut-copy">
            <span className="shortcut-label">{shortcut.name}</span>
          </span>
        </a>
      ))}
    </section>
  );
}
