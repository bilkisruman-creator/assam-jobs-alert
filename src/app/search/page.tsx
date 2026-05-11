'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  viewCount: number;
  readTime: number;
  publishedAt: string | null;
  isBreaking: boolean;
  isTrending: boolean;
  category: { name: string; slug: string; color: string | null };
  importantDates: { label: string; date: string }[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchPosts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
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
    if (initialQuery) {
      searchPosts(initialQuery);
    }
  }, [initialQuery, searchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPosts(query);
  };

  const suggestions = [
    'APSC',
    'Assam Police',
    'DHS Assam',
    'Scholarship',
    'Admit Card',
    'SEBA HSLC',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 pb-20 lg:pb-10">
      <div className="max-w-2xl mx-auto">
        {/* Search Input */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Search Posts</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Find jobs, results, admit cards, and more
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for jobs, results, notifications..."
                className="pl-9 h-12 text-base"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Search
            </Button>
          </form>

          {/* Quick Search Suggestions */}
          {!searched && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    searchPosts(s);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                <Skeleton className="h-1.5" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-medium mb-2">No results found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn&apos;t find any posts matching &quot;{query}&quot;
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s);
                        searchPosts(s);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
