'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface BreakingPost {
  id: string;
  title: string;
  slug: string;
  category: { slug: string; name: string };
}

export function BreakingTicker() {
  const [breakingPosts, setBreakingPosts] = useState<BreakingPost[]>([]);

  useEffect(() => {
    fetch('/api/posts?breaking=true&limit=5')
      .then((res) => res.json())
      .then((data) => setBreakingPosts(data.posts || []))
      .catch(() => {});
  }, []);

  if (breakingPosts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-sm overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="bg-red-700/80 px-3 py-1.5 font-bold flex items-center gap-1.5 shrink-0 z-10">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>NEW</span>
        </div>
        <div className="overflow-hidden flex-1 py-1.5">
          <div className="animate-ticker whitespace-nowrap">
            {breakingPosts.map((post, i) => (
              <span key={post.id}>
                <Link
                  href={`/post/${post.slug}`}
                  className="hover:underline font-medium px-4"
                >
                  {post.title}
                </Link>
                {i < breakingPosts.length - 1 && (
                  <span className="mx-2 opacity-50">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
