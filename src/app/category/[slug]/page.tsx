'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Award,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  ChevronLeft,
  ChevronRight,
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
  category: { name: string; slug: string; color: string | null };
  importantDates: { label: string; date: string }[];
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Award,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [prevSlug, setPrevSlug] = useState(slug);

  // Reset page when slug changes
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setPage(1);
  }

  const fetchData = useCallback(async (categorySlug: string, pageNum: number) => {
    setLoading(true);
    try {
      const [postsData, catsData] = await Promise.all([
        fetch(`/api/posts?category=${categorySlug}&page=${pageNum}&limit=12`).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setPosts(postsData.posts || []);
      setTotalPages(postsData.pagination?.totalPages || 1);
      const cat = (catsData.categories || []).find(
        (c: CategoryInfo) => c.slug === categorySlug
      );
      if (cat) setCategory(cat);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(slug, page);
  }, [slug, page, fetchData]);

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.viewCount - a.viewCount;
      case 'oldest':
        return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
      default:
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    }
  });

  const IconComponent = (category?.icon && iconMap[category.icon]) || Briefcase;
  const color = category?.color || '#16a34a';

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 pb-20 lg:pb-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category?.name || slug}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="mb-6 rounded-xl p-6" style={{ backgroundColor: color + '10' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <IconComponent className="h-6 w-6" style={{ color }} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color }}>
              {category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </h1>
            {category?.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort + Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${posts.length} posts found`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                  <Skeleton className="h-1.5" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-muted-foreground mb-2">No posts found</p>
              <p className="text-sm text-muted-foreground mb-4">
                There are no posts in this category yet.
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
