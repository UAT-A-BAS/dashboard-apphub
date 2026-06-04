import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown } from '../lib/icons';
import ShortcutGlyph from './ShortcutGlyph';
import { Shortcut, ShortcutCategory } from '../lib/shortcuts';

const COLLAPSED_CATEGORIES_KEY = 'apphub.collapsedCategories.v1';

type ShortcutGridProps = {
  shortcuts: Shortcut[];
  categories: ShortcutCategory[];
  query: string;
  sortMode: 'default' | 'az' | 'za';
};

function readCollapsedCategories() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COLLAPSED_CATEGORIES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export default function ShortcutGrid({ shortcuts, categories, query, sortMode }: ShortcutGridProps) {
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<string[]>(() => readCollapsedCategories());
  const normalizedQuery = query.trim().toLowerCase();
  const uncategorized = { id: 'uncategorized', name: 'Lainnya' };
  const visibleCategories = useMemo(
    () =>
      [...categories, uncategorized]
        .map((category) => {
          const categoryShortcuts = shortcuts.filter((shortcut) => (shortcut.categoryId || uncategorized.id) === category.id);
          const filteredShortcuts = normalizedQuery
            ? categoryShortcuts.filter((shortcut) => shortcut.name.toLowerCase().includes(normalizedQuery))
            : categoryShortcuts;
          return {
            ...category,
            shortcuts:
              sortMode === 'default'
                ? filteredShortcuts
                : [...filteredShortcuts].sort((a, b) =>
                    sortMode === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
                  ),
          };
        })
        .filter((category) => category.shortcuts.length > 0),
    [categories, normalizedQuery, shortcuts, sortMode],
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSED_CATEGORIES_KEY, JSON.stringify(collapsedCategoryIds));
  }, [collapsedCategoryIds]);

  function toggleCategory(categoryId: string) {
    setCollapsedCategoryIds((items) =>
      items.includes(categoryId) ? items.filter((item) => item !== categoryId) : [...items, categoryId],
    );
  }

  if (!visibleCategories.length) {
    return (
      <section className="shortcut-empty" aria-live="polite">
        <p>Tidak ada aplikasi yang cocok.</p>
      </section>
    );
  }

  return (
    <div className="shortcut-sections">
      {visibleCategories.map((category) => {
        const sectionId = `shortcut-section-${category.id}`;
        const collapsed = !normalizedQuery && collapsedCategoryIds.includes(category.id);

        return (
          <section className="shortcut-section" key={category.id} aria-label={category.name} data-collapsed={collapsed}>
            <button
              className="shortcut-section-head"
              type="button"
              onClick={() => toggleCategory(category.id)}
              aria-expanded={!collapsed}
              aria-controls={sectionId}
            >
              <span className="shortcut-section-title">
                <h2>{category.name}</h2>
                <span className="shortcut-section-count">{category.shortcuts.length}</span>
              </span>
              <ChevronDown className="shortcut-section-chevron" size={18} strokeWidth={2.4} />
            </button>
            <div className="shortcut-grid" id={sectionId} hidden={collapsed}>
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
        );
      })}
    </div>
  );
}
