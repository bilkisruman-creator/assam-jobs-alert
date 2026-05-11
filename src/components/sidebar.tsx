'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  category: { name: string; slug: string; color: string | null };
}

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount: number;
}

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
}

export function Sidebar() {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/posts?trending=true&limit=5').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([postsData, catsData, settingsData]) => {
        setTrendingPosts(postsData.posts || []);
        setCategories(catsData.categories || []);
        setSettings(settingsData.settings || {});
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-4">
      {/* Join Telegram CTA */}
      <a href={settings.telegram_link || '#'} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold h-12 text-sm">
          <MessageCircle className="mr-2 h-5 w-5" />
          Join Telegram Channel
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      </a>

      {/* Join WhatsApp CTA */}
      <a href={settings.whatsapp_link || '#'} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-sm">
          <MessageCircle className="mr-2 h-5 w-5" />
          Join WhatsApp Group
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      </a>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {trendingPosts.map((post, i) => (
                <div key={post.id}>
                  <Link
                    href={`/post/${post.slug}`}
                    className="group flex gap-2"
                  >
                    <span className="text-2xl font-bold text-muted-foreground/30 shrink-0 w-6">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                          style={post.category.color ? { backgroundColor: post.category.color + '15', color: post.category.color } : undefined}
                        >
                          {post.category.name}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {i < trendingPosts.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#16a34a' }}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {cat.postCount}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Placeholder */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Advertisement</p>
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Ad Space</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
