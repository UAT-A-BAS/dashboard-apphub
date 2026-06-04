import { ArrowUpRight } from '../lib/icons';
import ShortcutGlyph from './ShortcutGlyph';
import { Shortcut, ShortcutCategory } from '../lib/shortcuts';

type ShortcutGridProps = {
  shortcuts: Shortcut[];
  categories: ShortcutCategory[];
  query: string;
};

export default function ShortcutGrid({ shortcuts, categories, query }: ShortcutGridProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredShortcuts = normalizedQuery
    ? shortcuts.filter((shortcut) => `${shortcut.name} ${shortcut.url}`.toLowerCase().includes(normalizedQuery))
    : shortcuts;
  const uncategorized = { id: 'uncategorized', name: 'Lainnya' };
  const visibleCategories = [...categories, uncategorized]
    .map((category) => ({
      ...category,
      shortcuts: filteredShortcuts.filter((shortcut) => (shortcut.categoryId || uncategorized.id) === category.id),
    }))
    .filter((category) => category.shortcuts.length > 0);

  if (!visibleCategories.length) {
    return (
      <section className="shortcut-empty" aria-live="polite">
        <p>Tidak ada aplikasi yang cocok.</p>
      </section>
    );
  }

  return (
    <div className="shortcut-sections">
      {visibleCategories.map((category) => (
        <section className="shortcut-section" key={category.id} aria-label={category.name}>
          <div className="shortcut-section-head">
            <h2>{category.name}</h2>
            <span>{category.shortcuts.length}</span>
          </div>
          <div className="shortcut-grid">
            {category.shortcuts.map((shortcut) => (
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
          </div>
        </section>
      ))}
    </div>
  );
}
