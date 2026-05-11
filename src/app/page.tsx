'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroSlider } from '@/components/hero-slider';
import { PostCard } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, TrendingUp, ChevronRight } from 'lucide-react';

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

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  postCount: number;
}

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

const quickCategories = [
  { name: 'Latest Jobs', slug: 'latest-jobs', icon: 'Briefcase', color: '#16a34a' },
  { name: 'Results', slug: 'results', icon: 'Trophy', color: '#dc2626' },
  { name: 'Admit Cards', slug: 'admit-cards', icon: 'IdCard', color: '#7c3aed' },
  { name: 'Admissions', slug: 'admissions', icon: 'GraduationCap', color: '#0891b2' },
  { name: 'Scholarships', slug: 'scholarships', icon: 'BookOpen', color: '#db2777' },
  { name: 'Assam Govt', slug: 'assam-govt-jobs', icon: 'Landmark', color: '#0d9488' },
  { name: 'Central Govt', slug: 'central-govt-jobs', icon: 'Building2', color: '#1d4ed8' },
  { name: 'Defence', slug: 'defence-jobs', icon: 'Shield', color: '#b45309' },
  { name: 'Bank Jobs', slug: 'bank-jobs', icon: 'Banknote', color: '#c026d3' },
  { name: 'Syllabus', slug: 'syllabus', icon: 'BookMarked', color: '#6d28d9' },
];

export default function HomePage() {
  const [latestJobs, setLatestJobs] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/posts?category=latest-jobs&limit=4').then((r) => r.json()),
      fetch('/api/posts?trending=true&limit=6').then((r) => r.json()),
    ])
      .then(([jobsData, trendData]) => {
        setLatestJobs(jobsData.posts || []);
        setTrendingPosts(trendData.posts || []);
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

      {/* Quick Category Pills */}
      <section className="max-w-7xl mx-auto px-4 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/30 hover:bg-accent text-sm font-medium transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
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
                {/* Latest Jobs Section */}
                {latestJobs.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-900/20">
                          <Briefcase className="h-4 w-4 text-green-600" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold">Latest Jobs</h2>
                        <Badge variant="secondary" className="text-[10px]">
                          {latestJobs.length} new
                        </Badge>
                      </div>
                      <Link href="/category/latest-jobs">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {latestJobs.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Notifications */}
                {trendingPosts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold">Trending Now</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trendingPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Browse by Category - Compact Grid */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold">Browse Categories</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {quickCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="group flex items-center gap-2 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat.color + '12' }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {cat.name}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 ml-auto group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>
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
