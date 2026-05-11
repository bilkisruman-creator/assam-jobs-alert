import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalPosts, publishedPosts, draftPosts, totalViews, totalCategories, totalSubscribers, breakingPosts, trendingPosts] = await Promise.all([
      db.post.count(),
      db.post.count({ where: { status: 'published' } }),
      db.post.count({ where: { status: 'draft' } }),
      db.post.aggregate({ _sum: { viewCount: true } }),
      db.category.count(),
      db.subscriber.count(),
      db.post.count({ where: { isBreaking: true } }),
      db.post.count({ where: { isTrending: true } }),
    ])

    const recentPosts = await db.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, color: true } },
      },
    })

    const categoryStats = await db.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { order: 'asc' },
    })

    const viewsPerDay: { date: string; views: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      viewsPerDay.push({
        date: dateStr,
        views: Math.floor(Math.random() * 500 + 200),
      })
    }

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews._sum.viewCount || 0,
        totalCategories,
        totalSubscribers,
        breakingPosts,
        trendingPosts,
      },
      recentPosts,
      categoryStats: categoryStats.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        postCount: c._count.posts,
      })),
      viewsChart: viewsPerDay,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
