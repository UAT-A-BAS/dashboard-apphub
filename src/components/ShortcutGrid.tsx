import { ExternalLink, Search, Star } from 'lucide-react';
import ShortcutGlyph from './ShortcutGlyph';
import { Shortcut } from '../lib/shortcuts';

type ShortcutGridProps = {
  favorites: string[];
  onOpen: (shortcut: Shortcut) => void;
  onToggleFavorite: (id: string) => void;
  query: string;
  recentIds: string[];
  shortcuts: Shortcut[];
};

export default function ShortcutGrid({ favorites, onOpen, onToggleFavorite, query, recentIds, shortcuts }: ShortcutGridProps) {
  if (!shortcuts.length) {
    return (
      <section className="shortcut-empty" aria-label="Shortcut favorit kosong">
        <Search size={24} />
        <h2>No apps found</h2>
        <p>{query.trim() ? `No app matches "${query.trim()}".` : 'No shortcut has been configured yet.'}</p>
      </section>
    );
  }

  return (
    <section className="shortcut-grid" aria-label="Shortcut favorit">
      {shortcuts.slice(0, 8).map((shortcut) => {
        const isFavorite = favorites.includes(shortcut.id);
        const isRecent = recentIds.includes(shortcut.id);

        return (
          <article className="shortcut-card-shell" key={shortcut.id}>
            <button
              className={`favorite-button ${isFavorite ? 'favorite-button-active' : ''}`}
              type="button"
              onClick={() => onToggleFavorite(shortcut.id)}
              aria-label={isFavorite ? `Remove ${shortcut.name} from favorites` : `Add ${shortcut.name} to favorites`}
            >
              <Star size={17} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <a
              className="shortcut-card group"
              href={shortcut.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => onOpen(shortcut)}
              aria-label={`Buka ${shortcut.name}`}
            >
              <div className="shortcut-badges" aria-hidden="true">
                {isFavorite ? <span>Favorite</span> : null}
                {isRecent ? <span>Recent</span> : null}
              </div>
              <ShortcutGlyph shortcut={shortcut} />
              <span className="mt-5 text-center text-base font-semibold text-slate-950">{shortcut.name}</span>
              <span className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-500" aria-hidden="true">
                <span>Open</span>
                <ExternalLink className="opacity-0 transition-opacity duration-200 group-hover:opacity-100" size={14} />
              </span>
            </a>
          </article>
        );
      })}
    </section>
  );
}
