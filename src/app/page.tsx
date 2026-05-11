'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroSlider } from '@/components/hero-slider';
import { PostCard } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  Trophy,
  IdCard,
  GraduationCap,
  BookOpen,
  Star,
  Bell,
} from 'lucide-react';

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
  isFeatured: boolean;
  category: { name: string; slug: string; color: string | null };
  importantDates: { label: string; date: string }[];
}

interface SectionConfig {
  key: string;
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  slug: string;
  limit: number;
  badge?: string;
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

function SectionSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}

const quickCategories = [
  { name: 'Latest Jobs', slug: 'latest-jobs', color: '#16a34a' },
  { name: 'Results', slug: 'results', color: '#dc2626' },
  { name: 'Admit Cards', slug: 'admit-cards', color: '#7c3aed' },
  { name: 'Admissions', slug: 'admissions', color: '#0891b2' },
  { name: 'Scholarships', slug: 'scholarships', color: '#db2777' },
  { name: 'Assam Govt', slug: 'assam-govt-jobs', color: '#0d9488' },
  { name: 'Central Govt', slug: 'central-govt-jobs', color: '#1d4ed8' },
  { name: 'Defence', slug: 'defence-jobs', color: '#b45309' },
  { name: 'Bank Jobs', slug: 'bank-jobs', color: '#c026d3' },
  { name: 'Private Jobs', slug: 'private-jobs', color: '#be185d' },
  { name: 'Syllabus', slug: 'syllabus', color: '#6d28d9' },
  { name: 'Answer Key', slug: 'answer-key', color: '#059669' },
];

const sections: SectionConfig[] = [
  {
    key: 'latest-jobs',
    title: 'Latest Jobs',
    icon: Briefcase,
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600',
    slug: 'latest-jobs',
    limit: 4,
    badge: 'New',
  },
  {
    key: 'results',
    title: 'Results',
    icon: Trophy,
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-600',
    slug: 'results',
    limit: 4,
  },
  {
    key: 'admit-cards',
    title: 'Admit Cards',
    icon: IdCard,
    iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600',
    slug: 'admit-cards',
    limit: 4,
  },
  {
    key: 'admissions',
    title: 'Admissions',
    icon: GraduationCap,
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    iconColor: 'text-cyan-600',
    slug: 'admissions',
    limit: 4,
  },
  {
    key: 'scholarships',
    title: 'Scholarships',
    icon: BookOpen,
    iconBg: 'bg-pink-50 dark:bg-pink-900/20',
    iconColor: 'text-pink-600',
    slug: 'scholarships',
    limit: 4,
  },
];

export default function HomePage() {
  const [sectionData, setSectionData] = useState<Record<string, Post[]>>({});
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all section data in parallel
        const fetches = sections.map((section) =>
          fetch(`/api/posts?category=${section.slug}&limit=${section.limit}`)
            .then((r) => r.json())
            .then((data) => ({ key: section.key, posts: data.posts || [] }))
        );

        // Also fetch trending and featured
        fetches.push(
          fetch('/api/posts?trending=true&limit=6')
            .then((r) => r.json())
            .then((data) => ({ key: '_trending', posts: data.posts || [] }))
        );
        fetches.push(
          fetch('/api/posts?featured=true&limit=4')
            .then((r) => r.json())
            .then((data) => ({ key: '_featured', posts: data.posts || [] }))
        );

        const results = await Promise.all(fetches);
        const dataMap: Record<string, Post[]> = {};

        results.forEach((result) => {
          if (result.key === '_trending') {
            setTrendingPosts(result.posts);
          } else if (result.key === '_featured') {
            setFeaturedPosts(result.posts);
          } else {
            dataMap[result.key] = result.posts;
          }
        });

        setSectionData(dataMap);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="pb-16 lg:pb-0">
      {/* Hero Slider */}
      <section className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <HeroSlider />
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-6">
                <SectionSkeleton />
                <SectionSkeleton />
                <SectionSkeleton />
              </div>
            ) : (
              <>
                {/* Featured Posts - Hero Banner Style */}
                {featuredPosts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-900/20">
                          <Star className="h-4 w-4 text-amber-500" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold">Featured</h2>
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Editor&apos;s Pick
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {featuredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Category Sections */}
                {sections.map((section) => {
                  const posts = sectionData[section.key] || [];
                  if (posts.length === 0) return null;

                  const SectionIcon = section.icon;
                  return (
                    <div key={section.key} className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.iconBg}`}>
                            <SectionIcon className={`h-4 w-4 ${section.iconColor}`} />
                          </div>
                          <h2 className="text-lg md:text-xl font-bold">{section.title}</h2>
                          {section.badge && (
                            <Badge variant="secondary" className="text-[10px]">
                              {posts.length} new
                            </Badge>
                          )}
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

                {/* Important Updates */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                        <Bell className="h-4 w-4 text-blue-500" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold">Important Updates</h2>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {quickCategories.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/category/${item.slug}`}
                          className="flex items-center gap-2 p-3 rounded-lg bg-background/80 hover:bg-background border border-border/30 hover:border-primary/20 transition-all group"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </div>
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
