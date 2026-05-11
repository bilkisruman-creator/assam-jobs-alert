import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest, generateSlug, calculateReadTime } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const fetchedPost = await db.fetchedPost.findUnique({
      where: { id },
      include: { source: { include: { category: true } } },
    })

    if (!fetchedPost) {
      return NextResponse.json({ error: 'Fetched post not found' }, { status: 404 })
    }

    if (fetchedPost.status === 'approved') {
      return NextResponse.json({ error: 'Post is already approved' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))

    // Use processed content or fall back to original
    const title = fetchedPost.processedTitle || fetchedPost.originalTitle
    const content = fetchedPost.processedContent || fetchedPost.originalContent || ''

    // Generate unique slug
    let slug = body.slug || generateSlug(title)
    let slugCounter = 1
    let existingSlug = await db.post.findUnique({ where: { slug } })
    while (existingSlug) {
      slug = `${generateSlug(title)}-${slugCounter}`
      slugCounter++
      existingSlug = await db.post.findUnique({ where: { slug } })
    }

    // Determine category
    const categoryId = body.categoryId || fetchedPost.categoryId || fetchedPost.source.categoryId

    // Verify category exists
    const category = await db.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    // Generate SEO fields
    const seoTitle = fetchedPost.seoTitle || title.substring(0, 60)
    const seoDescription = fetchedPost.seoDescription || (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) : title)

    // Parse important dates and links from JSON strings
    let importantDatesData: Array<{ label: string; date: string }> = []
    let importantLinksData: Array<{ label: string; url: string; linkType?: string }> = []

    if (fetchedPost.importantDates) {
      try {
        const parsed = JSON.parse(fetchedPost.importantDates)
        if (Array.isArray(parsed)) {
          importantDatesData = parsed.map((d: Record<string, string>) => ({
            label: d.label || '',
            date: d.date || '',
          })).filter((d: { label: string; date: string }) => d.label && d.date)
        }
      } catch {
        // Not valid JSON, skip
      }
    }

    if (fetchedPost.importantLinks) {
      try {
        const parsed = JSON.parse(fetchedPost.importantLinks)
        if (Array.isArray(parsed)) {
          importantLinksData = parsed.map((l: Record<string, string>) => ({
            label: l.label || '',
            url: l.url || '',
            linkType: l.linkType || 'general',
          })).filter((l: { label: string; url: string }) => l.label && l.url)
        }
      } catch {
        // Not valid JSON, skip
      }
    }

    // Merge with body overrides
    if (body.importantDates && Array.isArray(body.importantDates)) {
      importantDatesData = body.importantDates
    }
    if (body.importantLinks && Array.isArray(body.importantLinks)) {
      importantLinksData = body.importantLinks
    }

    // Create the published post
    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 200) : null),
        content,
        featuredImage: body.featuredImage || fetchedPost.originalImage || null,
        categoryId,
        templateType: body.templateType || fetchedPost.templateType || 'job',
        status: 'published',
        isFeatured: body.isFeatured || false,
        isBreaking: body.isBreaking || false,
        isTrending: body.isTrending || false,
        seoTitle,
        seoDescription,
        seoKeywords: body.seoKeywords || null,
        viewCount: 0,
        readTime: calculateReadTime(content),
        publishedAt: new Date(),
        sourceId: fetchedPost.sourceId,
        sourceType: 'auto',
        aiProcessed: true,
        spamScore: fetchedPost.spamScore,
        qualityScore: fetchedPost.qualityScore,
        importantDates: {
          create: importantDatesData,
        },
        importantLinks: {
          create: importantLinksData,
        },
      },
      include: {
        category: true,
        importantDates: true,
        importantLinks: true,
      },
    })

    // Update fetched post
    await db.fetchedPost.update({
      where: { id },
      data: {
        status: 'approved',
        publishedPostId: post.id,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    })

    // Create notification
    await db.notification.create({
      data: {
        type: 'fetch_approved',
        title: 'Post Approved & Published',
        message: `"${title}" has been approved and published from fetched data (Source: ${fetchedPost.sourceName})`,
        link: `/admin/posts/${post.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      post,
      fetchedPostId: id,
    })
  } catch (error) {
    console.error('Approve fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
