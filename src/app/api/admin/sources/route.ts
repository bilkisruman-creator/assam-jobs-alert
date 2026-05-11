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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('Sources list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    const source = await db.source.create({
      data: {
        name: data.name,
        url: data.url,
        sourceType: data.sourceType || 'rss',
        categoryId: data.categoryId,
        isActive: data.isActive !== false,
        fetchInterval: data.fetchInterval || 60,
        selectors: data.selectors || null,
        mappingRules: data.mappingRules || null,
        autoPublish: data.autoPublish || false,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, source })
  } catch (error) {
    console.error('Create source error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
