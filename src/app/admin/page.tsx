'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Eye, FolderOpen, Users, TrendingUp, Plus,
  ExternalLink, Settings, Activity, Clock, Shield, Zap,
  CheckCircle, AlertTriangle, Wifi, Radio,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'

interface DashboardData {
  stats: {
    totalPosts: number; publishedPosts: number; draftPosts: number
    totalViews: number; totalCategories: number; totalSubscribers: number
    breakingPosts: number; trendingPosts: number
  }
  recentPosts: {
    id: string; title: string; status: string; isFeatured: boolean
    isBreaking: boolean; viewCount: number; createdAt: string
    category: { name: string; color: string | null }
  }[]
  categoryStats: { id: string; name: string; color: string | null; postCount: number }[]
  viewsChart: { date: string; views: number }[]
  fetchedPostCounts?: { pending: number; approved: number; rejected: number; spam: number }
  sourceHealth?: { healthy: number; degraded: number; unhealthy: number }
  recentFetchedPosts?: {
    id: string; originalTitle: string; processedTitle: string | null
    sourceName: string; status: string; spamScore: number; qualityScore: number
    isDuplicate: boolean; createdAt: string
  }[]
  liveVisitors?: number
  notificationCount?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Assam Jobs Alert Admin</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse w-24" />
              <div className="h-8 bg-muted rounded animate-pulse w-16" />
            </div></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const chartData = data.viewsChart.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }))

  const fc = data.fetchedPostCounts || { pending: 0, approved: 0, rejected: 0, spam: 0 }
  const sh = data.sourceHealth || { healthy: 0, degraded: 0, unhealthy: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Assam Jobs Alert Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Radio className="h-3.5 w-3.5 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{data.liveVisitors || 0} live</span>
          </div>
          <Button onClick={() => router.push('/admin/posts/new')} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />New Post
          </Button>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />View Site
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Total Posts" value={data.stats.totalPosts} icon={FileText} color="green" trend={12} />
        <StatsCard title="Published" value={data.stats.publishedPosts} icon={Eye} color="blue" trend={8} />
        <StatsCard title="Total Views" value={data.stats.totalViews.toLocaleString()} icon={TrendingUp} color="purple" trend={15} />
        <StatsCard title="Subscribers" value={data.stats.totalSubscribers} icon={Users} color="orange" trend={5} />
        <StatsCard title="Pending" value={fc.pending} icon={Clock} color="yellow" />
        <StatsCard title="Sources" value={sh.healthy + sh.degraded + sh.unhealthy} icon={Wifi} color="cyan" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" /> Traffic (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="views" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryStats.filter((c) => c.postCount > 0).slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="postCount" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approval Widget */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" /> Pending Approval
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/pending')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                <div className="text-xl font-bold text-yellow-600">{fc.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-xl font-bold text-green-600">{fc.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-xl font-bold text-red-600">{fc.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <div className="text-xl font-bold text-orange-600">{fc.spam}</div>
                <div className="text-xs text-muted-foreground">Spam</div>
              </div>
            </div>
            {data.recentFetchedPosts && data.recentFetchedPosts.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">Latest Fetched</p>
                {data.recentFetchedPosts.slice(0, 3).map((fp) => (
                  <div key={fp.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-[10px] shrink-0">{fp.sourceName}</Badge>
                    <span className="line-clamp-1 flex-1">{fp.processedTitle || fp.originalTitle}</span>
                    {fp.isDuplicate && <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Health Widget */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" /> Source Health
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/sources')}>
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-xl font-bold text-green-600">{sh.healthy}</div>
                <div className="text-xs text-muted-foreground">Healthy</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                <div className="text-xl font-bold text-yellow-600">{sh.degraded}</div>
                <div className="text-xs text-muted-foreground">Degraded</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-xl font-bold text-red-600">{sh.unhealthy}</div>
                <div className="text-xs text-muted-foreground">Unhealthy</div>
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto Fetch</span>
                <Badge variant="secondary" className="text-[10px]">
                  <Zap className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Cron Run</span>
                <span className="text-xs">5 min ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fetch Interval</span>
                <span className="text-xs">5 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/posts/new')}>
              <Plus className="w-4 h-4 mr-3 text-green-600" />Create New Post
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/pending')}>
              <Clock className="w-4 h-4 mr-3 text-yellow-600" />Pending Approval ({fc.pending})
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/sources')}>
              <Wifi className="w-4 h-4 mr-3 text-blue-600" />Manage Sources
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/analytics')}>
              <Activity className="w-4 h-4 mr-3 text-purple-600" />View Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/categories')}>
              <FolderOpen className="w-4 h-4 mr-3 text-orange-600" />Manage Categories
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/settings')}>
              <Settings className="w-4 h-4 mr-3 text-gray-600" />Site Settings
            </Button>
            <div className="pt-3 border-t grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-sm font-bold text-green-600">{data.stats.publishedPosts}</div>
                <div className="text-[10px] text-muted-foreground">Published</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-sm font-bold text-red-600">{data.stats.breakingPosts}</div>
                <div className="text-[10px] text-muted-foreground">Breaking</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Posts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/posts')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentPosts.slice(0, 5).map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm line-clamp-1">{post.title}</span>
                      <div className="flex gap-1">
                        {post.isBreaking && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Breaking</Badge>}
                        {post.isFeatured && <Badge className="bg-green-100 text-green-700 text-[10px] px-1 py-0 h-4 border-0">Featured</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{post.category.name}</Badge></TableCell>
                  <TableCell>
                    <Badge className={post.status === 'published' ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{post.viewCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
