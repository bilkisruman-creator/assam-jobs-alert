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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      if (status === 'featured') {
        where.isFeatured = true
      } else if (status === 'breaking') {
        where.isBreaking = true
      } else {
        where.status = status
      }
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          category: { select: { name: true, color: true, slug: true } },
          importantDates: true,
          importantLinks: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Posts list error:', error)
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

    const existing = await db.post.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 })
    }

    const post = await db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content || null,
        featuredImage: data.featuredImage || null,
        categoryId: data.categoryId,
        templateType: data.templateType || 'job',
        status: data.status || 'draft',
        isFeatured: data.isFeatured || false,
        isBreaking: data.isBreaking || false,
        isTrending: data.isTrending || false,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        viewCount: 0,
        readTime: Math.max(1, Math.ceil((data.content || '').length / 1000)),
        publishedAt: data.status === 'published' ? new Date() : null,
        importantDates: {
          create: (data.importantDates || []).map((d: { label: string; date: string }) => ({
            label: d.label,
            date: d.date,
          })),
        },
        importantLinks: {
          create: (data.importantLinks || []).map((l: { label: string; url: string; linkType?: string }) => ({
            label: l.label,
            url: l.url,
            linkType: l.linkType || 'general',
          })),
        },
      },
      include: {
        category: true,
        importantDates: true,
        importantLinks: true,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
