import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FilePlus2, Search, Star, X } from 'lucide-react';
import ShortcutGlyph from './ShortcutGlyph';
import { DashboardAction } from '../lib/dashboard';
import { Shortcut } from '../lib/shortcuts';

type CommandPaletteProps = {
  actions: DashboardAction[];
  favorites: string[];
  isOpen: boolean;
  onClose: () => void;
  onOpenAction: (action: DashboardAction) => void;
  onOpenShortcut: (shortcut: Shortcut) => void;
  shortcuts: Shortcut[];
};

type PaletteItem =
  | { kind: 'shortcut'; id: string; label: string; description: string; shortcut: Shortcut; favorite: boolean }
  | { kind: 'action'; id: string; label: string; description: string; action: DashboardAction };

export default function CommandPalette({
  actions,
  favorites,
  isOpen,
  onClose,
  onOpenAction,
  onOpenShortcut,
  shortcuts,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  const items = useMemo<PaletteItem[]>(() => {
    const normalized = query.trim().toLowerCase();
    const actionItems: PaletteItem[] = actions.map((action) => ({
      kind: 'action',
      id: action.id,
      label: action.label,
      description: action.description,
      action,
    }));
    const shortcutItems: PaletteItem[] = shortcuts.map((shortcut) => ({
      kind: 'shortcut',
      id: shortcut.id,
      label: shortcut.name,
      description: 'Open app',
      shortcut,
      favorite: favorites.includes(shortcut.id),
    }));

    return [...actionItems, ...shortcutItems]
      .filter((item) => {
        if (!normalized) return true;
        return `${item.label} ${item.description}`.toLowerCase().includes(normalized);
      })
      .sort((first, second) => {
        const firstFavorite = first.kind === 'shortcut' && first.favorite ? 1 : 0;
        const secondFavorite = second.kind === 'shortcut' && second.favorite ? 1 : 0;
        return secondFavorite - firstFavorite;
      });
  }, [actions, favorites, query, shortcuts]);

  function submitPalette(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstItem = items[0];
    if (!firstItem) return;
    if (firstItem.kind === 'action') onOpenAction(firstItem.action);
    if (firstItem.kind === 'shortcut') onOpenShortcut(firstItem.shortcut);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
        <form className="command-search" onSubmit={submitPalette}>
          <Search size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search apps or quick actions"
            aria-label="Search apps or quick actions"
          />
          <button className="command-close" type="button" onClick={onClose} aria-label="Tutup command palette">
            <X size={18} />
          </button>
        </form>

        <div className="command-list" role="listbox" aria-label="Command results">
          {items.length ? (
            items.map((item) => (
              <button
                className="command-item"
                type="button"
                key={`${item.kind}-${item.id}`}
                onClick={() => {
                  if (item.kind === 'action') onOpenAction(item.action);
                  if (item.kind === 'shortcut') onOpenShortcut(item.shortcut);
                  onClose();
                }}
              >
                <span className="command-item-icon">
                  {item.kind === 'action' ? <FilePlus2 size={22} /> : <ShortcutGlyph shortcut={item.shortcut} iconSize={22} />}
                </span>
                <span className="command-item-copy">
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </span>
                {item.kind === 'shortcut' && item.favorite ? <Star className="command-favorite" size={16} fill="currentColor" /> : null}
                <ArrowRight className="command-arrow" size={17} />
              </button>
            ))
          ) : (
            <div className="command-empty">
              <p>No matching app.</p>
              <span>Try another name or open Admin Mode to edit shortcuts.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
