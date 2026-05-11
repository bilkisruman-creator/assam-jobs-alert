import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sources = await db.source.findMany({
      include: {
        category: { select: { name: true, slug: true } },
        fetchLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { healthScore: 'asc' },
    })

    const healthData = sources.map((source) => {
      const status = source.healthScore >= 80 ? 'healthy'
        : source.healthScore >= 50 ? 'degraded'
        : 'unhealthy'

      return {
        id: source.id,
        name: source.name,
        url: source.url,
        sourceType: source.sourceType,
        healthScore: source.healthScore,
        status,
        consecutiveFails: source.consecutiveFail,
        lastFetchedAt: source.lastFetchedAt,
        lastStatus: source.lastStatus,
        lastError: source.lastError,
        totalFetched: source.totalFetched,
        totalFailed: source.totalFailed,
        fetchInterval: source.fetchInterval,
        qualityScore: source.qualityScore,
        isActive: source.isActive,
        category: source.category,
        recentLogs: source.fetchLogs.map((log) => ({
          id: log.id,
          status: log.status,
          itemsFound: log.itemsFound,
          itemsCreated: log.itemsCreated,
          error: log.error,
          fetchDuration: log.fetchDuration,
          createdAt: log.createdAt,
        })),
      }
    })

    // Summary stats
    const summary = {
      total: sources.length,
      healthy: healthData.filter((s) => s.status === 'healthy').length,
      degraded: healthData.filter((s) => s.status === 'degraded').length,
      unhealthy: healthData.filter((s) => s.status === 'unhealthy').length,
      inactive: sources.filter((s) => !s.isActive).length,
      avgHealthScore: sources.length > 0
        ? Math.round(sources.reduce((sum, s) => sum + s.healthScore, 0) / sources.length)
        : 0,
    }

    return NextResponse.json({
      sources: healthData,
      summary,
    })
  } catch (error) {
    console.error('Source health error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
