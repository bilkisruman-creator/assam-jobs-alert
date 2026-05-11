'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroSlider } from '@/components/hero-slider';
import { PostCard } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { CategoryGrid } from '@/components/category-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Briefcase, Award, IdCard, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

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

const categorySections = [
  { slug: 'latest-jobs', title: 'Latest Jobs', icon: Briefcase, color: '#16a34a' },
  { slug: 'results', title: 'Results', icon: Award, color: '#ea580c' },
  { slug: 'admit-cards', title: 'Admit Cards', icon: IdCard, color: '#7c3aed' },
  { slug: 'admissions', title: 'Admissions', icon: GraduationCap, color: '#0891b2' },
  { slug: 'scholarships', title: 'Scholarships', icon: BookOpen, color: '#db2777' },
];

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Skeleton className="h-1.5" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [sectionPosts, setSectionPosts] = useState<Record<string, Post[]>>({});
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ...categorySections.map((section) =>
        fetch(`/api/posts?category=${section.slug}&limit=4`)
          .then((r) => r.json())
          .then((data) => ({ slug: section.slug, posts: data.posts || [] }))
      ),
      fetch('/api/posts?trending=true&limit=6')
        .then((r) => r.json())
        .then((data) => data.posts || []),
    ])
      .then((results) => {
        const postsMap: Record<string, Post[]> = {};
        results.slice(0, categorySections.length).forEach((result: { slug: string; posts: Post[] }) => {
          postsMap[result.slug] = result.posts;
        });
        setSectionPosts(postsMap);
        setTrendingPosts(results[categorySections.length] as Post[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="pb-16 lg:pb-0">
      {/* Hero Slider */}
      <section className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <HeroSlider />
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <CategoryGrid />
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              </div>
            ) : (
              <>
                {categorySections.map((section) => {
                  const posts = sectionPosts[section.slug] || [];
                  if (posts.length === 0) return null;

                  const IconComp = section.icon;
                  return (
                    <div key={section.slug} className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: section.color + '15' }}
                          >
                            <IconComp className="h-4 w-4" style={{ color: section.color }} />
                          </div>
                          <h2 className="text-lg md:text-xl font-bold">{section.title}</h2>
                        </div>
                        <Link href={`/category/${section.slug}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            View All <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Trending Notifications */}
                {trendingPosts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold">Trending Notifications</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trendingPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar - Hidden on mobile/tablet */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
