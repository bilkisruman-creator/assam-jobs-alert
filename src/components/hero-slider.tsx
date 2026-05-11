'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string; slug: string; color: string | null };
  importantDates: { label: string; date: string }[];
}

export function HeroSlider() {
  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts?featured=true&limit=5')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + posts.length) % posts.length);
  }, [posts.length]);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, posts.length]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white rounded-xl p-8 md:p-12 min-h-[280px] animate-pulse">
        <div className="h-6 w-24 bg-white/20 rounded mb-4" />
        <div className="h-8 w-3/4 bg-white/20 rounded mb-3" />
        <div className="h-4 w-1/2 bg-white/20 rounded" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  const post = posts[current];
  const nextDate = post.importantDates?.[0];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white">
      <div className="p-6 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <Badge
            className="mb-4 text-xs font-semibold"
            style={post.category.color ? { backgroundColor: post.category.color + '30', color: '#fff', borderColor: post.category.color } : undefined}
          >
            {post.category.name}
          </Badge>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 line-clamp-2 leading-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-green-100 text-sm md:text-base line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}
          {nextDate && (
            <p className="text-sm text-green-200 mb-4">
              <span className="font-medium">{nextDate.label}:</span>{' '}
              {new Date(nextDate.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <Link href={`/post/${post.slug}`}>
            <Button className="bg-white text-green-800 hover:bg-green-50 font-semibold">
              Read More <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {posts.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
