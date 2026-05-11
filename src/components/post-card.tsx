'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Eye, Calendar } from 'lucide-react';

interface PostCardProps {
  post: {
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
    category: {
      name: string;
      slug: string;
      color: string | null;
    };
    importantDates: { label: string; date: string }[];
  };
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatViewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export function PostCard({ post }: PostCardProps) {
  const nextDate = post.importantDates?.[0];
  const categoryColor = post.category.color || '#16a34a';

  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50">
        {/* Category color bar */}
        <div className="h-1.5" style={{ backgroundColor: categoryColor }} />

        <CardContent className="p-4">
          {/* Category + Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{ backgroundColor: categoryColor + '15', color: categoryColor }}
            >
              {post.category.name}
            </Badge>
            {post.isBreaking && (
              <Badge variant="destructive" className="text-xs">
                Breaking
              </Badge>
            )}
            {post.isTrending && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Trending
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          {/* Next Important Date */}
          {nextDate && (
            <div className="flex items-center gap-1.5 text-xs mb-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="font-medium">{nextDate.label}:</span>
              <span>{new Date(nextDate.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(post.viewCount)}
            </span>
            {post.readTime > 0 && (
              <span>{post.readTime} min read</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
