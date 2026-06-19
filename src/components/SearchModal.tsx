'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search as SearchIcon, X, Loader2, Calendar } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  date: string;
  authorName: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Arrows to navigate, Enter to select)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex].slug);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const activeElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Perform search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (slug: string) => {
    onClose();
    router.push(`/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <SearchIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, news..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-none outline-none focus:ring-0 text-base"
          />

          {isLoading ? (
            <Loader2 className="w-5 h-5 text-sky-500 animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 font-sans font-medium">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4" ref={resultsRef}>
          {results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">
                Search Results ({results.length})
              </p>
              {results.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.slug)}
                  className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    idx === selectedIndex
                      ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100/50 dark:border-sky-900/30">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No articles matching "<span className="font-semibold text-slate-800 dark:text-slate-200">{query}</span>" found.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try searching for category names or other keywords.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Type above to start searching the blog posts...
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Search is instant, lightweight, and keyboard-friendly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
