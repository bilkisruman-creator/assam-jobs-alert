import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        importantDates: true,
        importantLinks: true,
        tags: { include: { tag: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await db.post.findUnique({ where: { slug: data.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 })
      }
    }

    if (data.importantDates) {
      await db.importantDate.deleteMany({ where: { postId: id } })
    }
    if (data.importantLinks) {
      await db.importantLink.deleteMany({ where: { postId: id } })
    }

    const wasPublished = existing.status === 'published'
    const willBePublished = data.status === 'published'

    const post = await db.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        categoryId: data.categoryId,
        templateType: data.templateType,
        status: data.status,
        isFeatured: data.isFeatured,
        isBreaking: data.isBreaking,
        isTrending: data.isTrending,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        readTime: Math.max(1, Math.ceil((data.content || '').length / 1000)),
        publishedAt: !wasPublished && willBePublished ? new Date() : existing.publishedAt,
        importantDates: data.importantDates
          ? {
              create: data.importantDates.map((d: { label: string; date: string }) => ({
                label: d.label,
                date: d.date,
              })),
            }
          : undefined,
        importantLinks: data.importantLinks
          ? {
              create: data.importantLinks.map((l: { label: string; url: string; linkType?: string }) => ({
                label: l.label,
                url: l.url,
                linkType: l.linkType || 'general',
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        importantDates: true,
        importantLinks: true,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await db.post.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
