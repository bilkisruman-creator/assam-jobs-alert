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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        take: limit,
      }),
      db.notification.count({ where: { isRead: false } }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { ids, all } = body

    if (all) {
      // Mark all as read
      const result = await db.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true, marked: result.count })
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const result = await db.notification.updateMany({
        where: { id: { in: ids }, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true, marked: result.count })
    }

    return NextResponse.json(
      { error: 'Provide either { all: true } or { ids: string[] }' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Mark notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
