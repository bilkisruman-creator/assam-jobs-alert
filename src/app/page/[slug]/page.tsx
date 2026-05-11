'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaticPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchPage() {
      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          setPage(null);
        } else {
          const data = await res.json();
          if (cancelled) return;
          setPage(data.page || null);
          setNotFound(false);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setPage(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const formatSlug = (s: string) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="pb-16 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {page?.title || formatSlug(slug)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : notFound ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This page doesn&apos;t exist yet. Check back later!
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <article>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{page?.title}</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date(page?.updatedAt || '').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {page?.content ? (
              <div
                className="page-content max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Content for this page is being prepared. Check back soon!
                </p>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
