'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Eye,
  FolderOpen,
  Users,
  Zap,
  TrendingUp,
  Plus,
  ExternalLink,
  Settings,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface DashboardData {
  stats: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    totalCategories: number
    totalSubscribers: number
    breakingPosts: number
    trendingPosts: number
  }
  recentPosts: {
    id: string
    title: string
    status: string
    isFeatured: boolean
    isBreaking: boolean
    viewCount: number
    createdAt: string
    category: { name: string; color: string | null }
  }[]
  categoryStats: {
    id: string
    name: string
    color: string | null
    postCount: number
  }[]
  viewsChart: {
    date: string
    views: number
  }[]
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
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  <div className="h-8 bg-muted rounded animate-pulse w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const chartData = data.viewsChart.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Assam Jobs Alert Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/admin/posts/new')} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Site
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Posts"
          value={data.stats.totalPosts}
          icon={FileText}
          color="green"
          trend={12}
        />
        <StatsCard
          title="Published"
          value={data.stats.publishedPosts}
          icon={Eye}
          color="blue"
          trend={8}
        />
        <StatsCard
          title="Total Views"
          value={data.stats.totalViews.toLocaleString()}
          icon={TrendingUp}
          color="purple"
          trend={15}
        />
        <StatsCard
          title="Categories"
          value={data.stats.totalCategories}
          icon={FolderOpen}
          color="orange"
        />
        <StatsCard
          title="Subscribers"
          value={data.stats.totalSubscribers}
          icon={Users}
          color="yellow"
          trend={5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#16a34a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category-wise Posts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryStats.filter((c) => c.postCount > 0).slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="postCount" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Posts</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/posts')}>
                View All
              </Button>
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
                {data.recentPosts.map((post) => (
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
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {post.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-yellow-100 text-yellow-700 border-0'
                        }
                      >
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

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/admin/posts/new')}
            >
              <Plus className="w-4 h-4 mr-3 text-green-600" />
              Create New Post
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/admin/categories')}
            >
              <FolderOpen className="w-4 h-4 mr-3 text-orange-600" />
              Manage Categories
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/admin/settings')}
            >
              <Settings className="w-4 h-4 mr-3 text-gray-600" />
              Site Settings
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-3 text-blue-600" />
                Visit Website
              </a>
            </Button>

            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Status Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <div className="text-lg font-bold text-green-600">{data.stats.publishedPosts}</div>
                  <div className="text-xs text-muted-foreground">Published</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                  <div className="text-lg font-bold text-yellow-600">{data.stats.draftPosts}</div>
                  <div className="text-xs text-muted-foreground">Drafts</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <div className="text-lg font-bold text-red-600">{data.stats.breakingPosts}</div>
                  <div className="text-xs text-muted-foreground">Breaking</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                  <div className="text-lg font-bold text-purple-600">{data.stats.trendingPosts}</div>
                  <div className="text-xs text-muted-foreground">Trending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
