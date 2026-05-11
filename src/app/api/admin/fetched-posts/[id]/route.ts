import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const post = await db.fetchedPost.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            name: true,
            url: true,
            sourceType: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Fetched post not found' }, { status: 404 })
    }

    // Check for potential duplicates
    const duplicates = await db.fetchedPost.findMany({
      where: {
        id: { not: id },
        status: { not: 'rejected' },
        originalTitle: { contains: post.originalTitle.substring(0, 30) },
      },
      take: 5,
      select: {
        id: true,
        originalTitle: true,
        status: true,
        sourceName: true,
        createdAt: true,
      },
    })

    // Check for published post with similar title
    const publishedSimilar = await db.post.findFirst({
      where: {
        title: { contains: post.originalTitle.substring(0, 30) },
        status: 'published',
      },
      select: { id: true, title: true, slug: true, publishedAt: true },
    })

    return NextResponse.json({
      post,
      duplicateWarnings: duplicates,
      publishedSimilar,
    })
  } catch (error) {
    console.error('Get fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const existing = await db.fetchedPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fetched post not found' }, { status: 404 })
    }

    const post = await db.fetchedPost.update({
      where: { id },
      data: {
        processedTitle: data.processedTitle !== undefined ? data.processedTitle : existing.processedTitle,
        processedContent: data.processedContent !== undefined ? data.processedContent : existing.processedContent,
        categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
        templateType: data.templateType !== undefined ? data.templateType : existing.templateType,
        seoTitle: data.seoTitle !== undefined ? data.seoTitle : existing.seoTitle,
        seoDescription: data.seoDescription !== undefined ? data.seoDescription : existing.seoDescription,
        aiTags: data.aiTags !== undefined ? data.aiTags : existing.aiTags,
        aiCategory: data.aiCategory !== undefined ? data.aiCategory : existing.aiCategory,
        importantDates: data.importantDates !== undefined ? data.importantDates : existing.importantDates,
        importantLinks: data.importantLinks !== undefined ? data.importantLinks : existing.importantLinks,
        originalImage: data.originalImage !== undefined ? data.originalImage : existing.originalImage,
        spamScore: data.spamScore !== undefined ? data.spamScore : existing.spamScore,
        qualityScore: data.qualityScore !== undefined ? data.qualityScore : existing.qualityScore,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Update fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.fetchedPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fetched post not found' }, { status: 404 })
    }

    await db.fetchedPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
