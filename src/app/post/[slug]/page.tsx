'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { JobTemplate } from '@/components/post-templates/job-template';
import { ResultTemplate } from '@/components/post-templates/result-template';
import { AdmitCardTemplate } from '@/components/post-templates/admit-card-template';
import { AdmissionTemplate } from '@/components/post-templates/admission-template';
import { ScholarshipTemplate } from '@/components/post-templates/scholarship-template';
import { PostCard } from '@/components/post-card';
import {
  Clock,
  Eye,
  Calendar,
  Share2,
  Copy,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  viewCount: number;
  readTime: number;
  publishedAt: string | null;
  templateType: string;
  isBreaking: boolean;
  isTrending: boolean;
  category: { name: string; slug: string; color: string | null };
  importantDates: { label: string; date: string }[];
  importantLinks: { label: string; url: string; linkType: string }[];
}

interface RelatedPost {
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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/posts/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = post?.title || '';

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const renderTemplate = () => {
    if (!post) return null;

    switch (post.templateType) {
      case 'result':
        return (
          <ResultTemplate
            content={post.content}
            importantLinks={post.importantLinks}
          />
        );
      case 'admit-card':
        return (
          <AdmitCardTemplate
            content={post.content}
            importantDates={post.importantDates}
            importantLinks={post.importantLinks}
          />
        );
      case 'admission':
        return (
          <AdmissionTemplate
            content={post.content}
            importantDates={post.importantDates}
            importantLinks={post.importantLinks}
          />
        );
      case 'scholarship':
        return (
          <ScholarshipTemplate
            content={post.content}
            importantDates={post.importantDates}
            importantLinks={post.importantLinks}
          />
        );
      case 'job':
      default:
        return (
          <JobTemplate
            content={post.content}
            importantDates={post.importantDates}
            importantLinks={post.importantLinks}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-muted-foreground mb-4">The post you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const categoryColor = post.category.color || '#16a34a';

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 pb-20 lg:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/category/${post.category.slug}`}>
                {post.category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-none">
                {post.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Post Header */}
        <div className="mb-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge
              className="text-xs font-semibold"
              style={{ backgroundColor: categoryColor + '15', color: categoryColor, borderColor: categoryColor + '30' }}
            >
              {post.category.name}
            </Badge>
            {post.isBreaking && (
              <Badge variant="destructive" className="text-xs">Breaking</Badge>
            )}
            {post.isTrending && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Trending
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatRelativeTime(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount} views
            </span>
          </div>
        </div>

        {/* Template Content */}
        {renderTemplate()}

        {/* Share Buttons */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share This Post
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => handleShare('whatsapp')}
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => handleShare('telegram')}
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                Telegram
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleShare('facebook')}
              >
                Facebook
              </Button>
              <Button
                size="sm"
                className="bg-gray-700 hover:bg-gray-800 text-white"
                onClick={() => handleShare('twitter')}
              >
                Twitter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('copy')}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-1.5" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.id} post={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
