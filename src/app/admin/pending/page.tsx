'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle, XCircle, Trash2, Eye, Search, AlertTriangle,
  Clock, Shield, RefreshCw, ChevronLeft, ChevronRight,
  ExternalLink, Copy, CheckCheck, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface FetchedPost {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  originalContent: string | null;
  processedTitle: string | null;
  processedContent: string | null;
  originalUrl: string | null;
  originalImage: string | null;
  categoryId: string | null;
  templateType: string;
  status: string;
  spamScore: number;
  qualityScore: number;
  isDuplicate: boolean;
  duplicateOfId: string | null;
  aiTags: string | null;
  aiCategory: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100 dark:bg-green-900/30' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30' },
  spam: { label: 'Spam', color: 'text-orange-700', bg: 'bg-orange-100 dark:bg-orange-900/30' },
};

export default function PendingPostsPage() {
  const { admin, loading: authLoading } = useAdminAuth();
  const [posts, setPosts] = useState<FetchedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, spam: 0, total: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<FetchedPost | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, page: page.toString(), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/fetched-posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCounts(data.counts || counts);
    } catch {
      toast.error('Failed to load fetched posts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, search]);

  useEffect(() => {
    if (admin) fetchPosts();
  }, [admin, fetchPosts]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setProcessing(id);
    try {
      if (action === 'approve') {
        const res = await fetch(`/api/admin/fetched-posts/${id}/approve`, { method: 'POST' });
        if (!res.ok) throw new Error();
        toast.success('Post approved and published');
      } else if (action === 'reject') {
        const res = await fetch(`/api/admin/fetched-posts/${id}/reject`, { method: 'POST' });
        if (!res.ok) throw new Error();
        toast.success('Post rejected');
      } else {
        const res = await fetch(`/api/admin/fetched-posts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        toast.success('Post deleted');
      }
      fetchPosts();
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch {
      toast.error(`Failed to ${action} post`);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selected.size === 0) return;
    setBulkAction(true);
    try {
      const res = await fetch('/api/admin/fetched-posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Bulk ${action} completed`);
      setSelected(new Set());
      fetchPosts();
    } catch {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setBulkAction(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
    }
  };

  if (authLoading) return <div className="p-8"><Skeleton className="h-8 w-64" /></div>;
  if (!admin) return null;

  const statusTabs = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
    { key: 'spam', label: 'Spam', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Approval Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve fetched posts before publishing</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPosts}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const count = (counts as Record<string, number>)[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); setSelected(new Set()); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.key ? 'bg-primary-foreground/20' : 'bg-background'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search fetched posts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleBulkAction('approve')} disabled={bulkAction}>
              {bulkAction ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5 mr-1" />} Approve All
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')} disabled={bulkAction}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete All
            </Button>
          </div>
        )}
      </div>

      {/* Select All */}
      {posts.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={selected.size === posts.length && posts.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" />
          <span className="text-muted-foreground">Select all on this page</span>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium">No {statusFilter} posts</p>
          <p className="text-sm text-muted-foreground mt-1">{statusFilter === 'pending' ? 'Fetched posts will appear here for review' : `No ${statusFilter} posts found`}</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const cfg = statusConfig[post.status] || statusConfig.pending;
            return (
              <Card key={post.id} className={`transition-all ${selected.has(post.id) ? 'ring-2 ring-primary/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)} className="rounded border-gray-300 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2">{post.processedTitle || post.originalTitle}</h3>
                          {post.processedTitle && post.processedTitle !== post.originalTitle && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">Original: {post.originalTitle}</p>
                          )}
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${cfg.color} ${cfg.bg}`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />{post.sourceName}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        {post.spamScore > 50 && <span className="flex items-center gap-1 text-orange-600"><AlertTriangle className="h-3 w-3" />Spam: {post.spamScore}%</span>}
                        {post.isDuplicate && <span className="flex items-center gap-1 text-yellow-600"><Copy className="h-3 w-3" />Duplicate</span>}
                        <span>Quality: {post.qualityScore}%</span>
                        {post.aiCategory && <Badge variant="secondary" className="text-[10px]">AI: {post.aiCategory}</Badge>}
                      </div>
                      {post.aiTags && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {post.aiTags.split(',').map((tag) => <Badge key={tag} variant="outline" className="text-[10px]">{tag.trim()}</Badge>)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewPost(post)}><Eye className="h-3.5 w-3.5" /></Button>
                      {post.status === 'pending' && (
                        <>
                          <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white px-2" onClick={() => handleAction(post.id, 'approve')} disabled={processing === post.id}><CheckCircle className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleAction(post.id, 'reject')} disabled={processing === post.id}><XCircle className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleAction(post.id, 'delete')} disabled={processing === post.id}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogTitle className="sr-only">Post Preview</DialogTitle>
          {previewPost && (
            <div className="space-y-4">
              <Badge className={statusConfig[previewPost.status]?.color + ' ' + statusConfig[previewPost.status]?.bg}>{statusConfig[previewPost.status]?.label}</Badge>
              <h2 className="text-xl font-bold">{previewPost.processedTitle || previewPost.originalTitle}</h2>
              {previewPost.processedTitle && previewPost.processedTitle !== previewPost.originalTitle && (
                <div><p className="text-xs font-medium text-muted-foreground mb-1">Original Title:</p><p className="text-sm text-muted-foreground">{previewPost.originalTitle}</p></div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Source:</span> {previewPost.sourceName}</div>
                <div><span className="text-muted-foreground">Template:</span> {previewPost.templateType}</div>
                <div><span className="text-muted-foreground">Spam Score:</span> {previewPost.spamScore}%</div>
                <div><span className="text-muted-foreground">Quality:</span> {previewPost.qualityScore}%</div>
                {previewPost.aiCategory && <div><span className="text-muted-foreground">AI Category:</span> {previewPost.aiCategory}</div>}
                {previewPost.isDuplicate && <div className="text-yellow-600"><AlertTriangle className="h-3.5 w-3.5 inline mr-1" />Duplicate detected</div>}
              </div>
              {(previewPost.processedContent || previewPost.originalContent) && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{previewPost.processedContent ? 'Processed Content:' : 'Original Content:'}</p>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {previewPost.processedContent || previewPost.originalContent}
                  </div>
                </div>
              )}
              {previewPost.originalUrl && (
                <a href={previewPost.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> View Original Source
                </a>
              )}
              {previewPost.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => { handleAction(previewPost.id, 'approve'); setPreviewPost(null); }} disabled={processing === previewPost.id}>
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Approve & Publish
                  </Button>
                  <Button variant="destructive" onClick={() => { handleAction(previewPost.id, 'reject'); setPreviewPost(null); }} disabled={processing === previewPost.id}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
