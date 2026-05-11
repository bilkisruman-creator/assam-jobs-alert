import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30d'
    const type = searchParams.get('type') || 'overview'

    // Calculate date range
    const now = new Date()
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[period] || 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - days)

    if (type === 'overview') {
      return await getOverview(startDate, days)
    }

    if (type === 'traffic') {
      return await getTraffic(startDate, days)
    }

    if (type === 'devices') {
      return await getDeviceDistribution(startDate, days)
    }

    if (type === 'browsers') {
      return await getBrowserDistribution(startDate, days)
    }

    if (type === 'countries') {
      return await getCountryDistribution(startDate, days)
    }

    if (type === 'pages') {
      return await getTopPages(startDate, days)
    }

    if (type === 'referrers') {
      return await getTopReferrers(startDate, days)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getOverview(startDate: Date, days: number) {
  const totalViews = await db.analyticsEvent.count({
    where: { createdAt: { gte: startDate } },
  })

  const uniqueSessions = await db.analyticsEvent.findMany({
    where: {
      createdAt: { gte: startDate },
      sessionId: { not: null },
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
  })

  const uniqueVisits = uniqueSessions.length

  // Bounce rate (single page sessions)
  const allSessions = await db.analyticsEvent.findMany({
    where: {
      createdAt: { gte: startDate },
      sessionId: { not: null },
    },
    select: { sessionId: true, pagePath: true },
  })

  const sessionPageCounts: Record<string, Set<string>> = {}
  for (const event of allSessions) {
    if (!sessionPageCounts[event.sessionId!]) {
      sessionPageCounts[event.sessionId!] = new Set()
    }
    sessionPageCounts[event.sessionId!].add(event.pagePath || '')
  }

  const singlePageSessions = Object.values(sessionPageCounts).filter(
    (pages) => pages.size <= 1
  ).length
  const bounceRate = uniqueVisits > 0 ? (singlePageSessions / uniqueVisits) * 100 : 0

  // Average duration
  const durationEvents = await db.analyticsEvent.findMany({
    where: {
      createdAt: { gte: startDate },
      duration: { gt: 0 },
    },
    select: { duration: true },
  })
  const avgDuration = durationEvents.length > 0
    ? durationEvents.reduce((sum, e) => sum + e.duration, 0) / durationEvents.length
    : 0

  // Top pages
  const topPages = await db.analyticsEvent.groupBy({
    by: ['pagePath'],
    where: { createdAt: { gte: startDate }, pagePath: { not: null } },
    _count: { pagePath: true },
    orderBy: { _count: { pagePath: 'desc' } },
    take: 10,
  })

  // Daily analytics for trend
  const dailyData = await db.dailyAnalytics.findMany({
    where: { date: { gte: startDate.toISOString().split('T')[0] } },
    orderBy: { date: 'asc' },
  })

  // Fill gaps in daily data
  const trends: Array<{ date: string; views: number; visits: number }> = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = dailyData.find((d) => d.date === dateStr)
    trends.push({
      date: dateStr,
      views: dayData?.totalViews || 0,
      visits: dayData?.uniqueVisits || 0,
    })
  }

  // Mock live visitors count
  const liveVisitors = Math.floor(Math.random() * 20) + 3

  return NextResponse.json({
    totalViews,
    uniqueVisits,
    bounceRate: Math.round(bounceRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
    topPages: topPages.map((p) => ({
      path: p.pagePath,
      views: p._count.pagePath,
    })),
    trends,
    liveVisitors,
  })
}

async function getTraffic(startDate: Date, days: number) {
  const dailyData = await db.dailyAnalytics.findMany({
    where: { date: { gte: startDate.toISOString().split('T')[0] } },
    orderBy: { date: 'asc' },
  })

  // Fill gaps
  const data: Array<{
    date: string
    views: number
    uniqueVisits: number
    bounceRate: number
    avgDuration: number
  }> = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = dailyData.find((d) => d.date === dateStr)
    data.push({
      date: dateStr,
      views: dayData?.totalViews || 0,
      uniqueVisits: dayData?.uniqueVisits || 0,
      bounceRate: dayData?.bounceRate || 0,
      avgDuration: dayData?.avgDuration || 0,
    })
  }

  return NextResponse.json({ data })
}

async function getDeviceDistribution(startDate: Date, _days: number) {
  const devices = await db.analyticsEvent.groupBy({
    by: ['device'],
    where: { createdAt: { gte: startDate }, device: { not: null } },
    _count: { device: true },
    orderBy: { _count: { device: 'desc' } },
    take: 10,
  })

  return NextResponse.json({
    devices: devices.map((d) => ({
      device: d.device,
      count: d._count.device,
    })),
  })
}

async function getBrowserDistribution(startDate: Date, _days: number) {
  const browsers = await db.analyticsEvent.groupBy({
    by: ['browser'],
    where: { createdAt: { gte: startDate }, browser: { not: null } },
    _count: { browser: true },
    orderBy: { _count: { browser: 'desc' } },
    take: 10,
  })

  return NextResponse.json({
    browsers: browsers.map((b) => ({
      browser: b.browser,
      count: b._count.browser,
    })),
  })
}

async function getCountryDistribution(startDate: Date, _days: number) {
  const countries = await db.analyticsEvent.groupBy({
    by: ['country'],
    where: { createdAt: { gte: startDate }, country: { not: null } },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  })

  return NextResponse.json({
    countries: countries.map((c) => ({
      country: c.country,
      count: c._count.country,
    })),
  })
}

async function getTopPages(startDate: Date, _days: number) {
  const pages = await db.analyticsEvent.groupBy({
    by: ['pagePath', 'postId'],
    where: { createdAt: { gte: startDate }, pagePath: { not: null } },
    _count: { pagePath: true },
    orderBy: { _count: { pagePath: 'desc' } },
    take: 20,
  })

  // Get post titles for pages that have postId
  const postIds = pages.map((p) => p.postId).filter(Boolean) as string[]
  const posts = postIds.length > 0
    ? await db.post.findMany({
        where: { id: { in: postIds } },
        select: { id: true, title: true, slug: true },
      })
    : []

  const postMap = new Map(posts.map((p) => [p.id, p]))

  return NextResponse.json({
    pages: pages.map((p) => ({
      path: p.pagePath,
      views: p._count.pagePath,
      post: p.postId ? postMap.get(p.postId) || null : null,
    })),
  })
}

async function getTopReferrers(startDate: Date, _days: number) {
  const referrers = await db.analyticsEvent.groupBy({
    by: ['referrer'],
    where: { createdAt: { gte: startDate }, referrer: { not: null } },
    _count: { referrer: true },
    orderBy: { _count: { referrer: 'desc' } },
    take: 20,
  })

  return NextResponse.json({
    referrers: referrers.map((r) => ({
      referrer: r.referrer,
      count: r._count.referrer,
    })),
  })
}
