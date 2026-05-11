'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string; slug: string; color: string | null };
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchPosts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.posts || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchPosts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(`/post/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search Posts</DialogTitle>
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, results, admit cards..."
            className="border-0 focus-visible:ring-0 text-lg h-14 px-3"
            autoFocus
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />}
          {!loading && query && (
            <button onClick={() => setQuery('')} className="shrink-0">
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {query && !loading && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}
          {results.map((post) => (
            <button
              key={post.id}
              onClick={() => handleSelect(post.slug)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0"
                      style={post.category.color ? { backgroundColor: post.category.color + '20', color: post.category.color } : undefined}
                    >
                      {post.category.name}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
                  )}
                </div>
                <Search className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          ))}
          {!query && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Type to search across all posts</p>
              <p className="text-xs mt-1">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> to open search anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
