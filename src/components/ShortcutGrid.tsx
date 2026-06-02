import { ExternalLink } from 'lucide-react';
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
          <ShortcutGlyph shortcut={shortcut} />
          <span className="mt-5 text-center text-base font-semibold text-slate-950">{shortcut.name}</span>
          <span className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-500" aria-hidden="true">
            <span>Open</span>
            <ExternalLink className="opacity-0 transition-opacity duration-200 group-hover:opacity-100" size={14} />
          </span>
        </a>
      ))}
    </section>
  );
}
