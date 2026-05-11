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
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const sourceId = searchParams.get('sourceId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (sourceId) {
      where.sourceId = sourceId
    } else if (source) {
      where.sourceName = { contains: source }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (search) {
      where.OR = [
        { originalTitle: { contains: search } },
        { processedTitle: { contains: search } },
        { sourceName: { contains: search } },
        { originalUrl: { contains: search } },
      ]
    }

    const [posts, total, statusCounts] = await Promise.all([
      db.fetchedPost.findMany({
        where,
        orderBy: { [sort]: order === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.fetchedPost.count({ where }),
      db.fetchedPost.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    const countsByStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      spam: 0,
    }
    for (const sc of statusCounts) {
      countsByStatus[sc.status] = sc._count.status
    }

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      countsByStatus,
    })
  } catch (error) {
    console.error('Fetched posts list error:', error)
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

    if (!data.sourceId || !data.originalTitle) {
      return NextResponse.json(
        { error: 'sourceId and originalTitle are required' },
        { status: 400 }
      )
    }

    const source = await db.source.findUnique({ where: { id: data.sourceId } })
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const post = await db.fetchedPost.create({
      data: {
        sourceId: data.sourceId,
        sourceName: source.name,
        sourceUrl: source.url,
        originalTitle: data.originalTitle,
        originalContent: data.originalContent || null,
        processedTitle: data.processedTitle || null,
        processedContent: data.processedContent || null,
        originalUrl: data.originalUrl || null,
        originalImage: data.originalImage || null,
        categoryId: data.categoryId || source.categoryId,
        templateType: data.templateType || 'job',
        status: data.status || 'pending',
        spamScore: data.spamScore || 0,
        qualityScore: data.qualityScore || 0,
        isDuplicate: data.isDuplicate || false,
        duplicateOfId: data.duplicateOfId || null,
        aiTags: data.aiTags || null,
        aiCategory: data.aiCategory || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        importantDates: data.importantDates || null,
        importantLinks: data.importantLinks || null,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Create fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ error: 'ids query parameter is required' }, { status: 400 })
    }

    const ids = idsParam.split(',').filter(Boolean)
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 })
    }

    const result = await db.fetchedPost.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Bulk delete fetched posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
