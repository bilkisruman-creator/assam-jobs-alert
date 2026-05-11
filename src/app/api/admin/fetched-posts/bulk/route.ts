import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, ids } = body

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'action and ids array are required' },
        { status: 400 }
      )
    }

    const validActions = ['approve', 'reject', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (action === 'delete') {
      const result = await db.fetchedPost.deleteMany({
        where: { id: { in: ids } },
      })

      await db.notification.create({
        data: {
          type: 'bulk_action',
          title: 'Bulk Delete',
          message: `${result.count} fetched posts were deleted`,
        },
      })

      return NextResponse.json({ success: true, action: 'delete', count: result.count })
    }

    if (action === 'reject') {
      const result = await db.fetchedPost.updateMany({
        where: {
          id: { in: ids },
          status: { not: 'rejected' },
        },
        data: {
          status: 'rejected',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      })

      await db.notification.create({
        data: {
          type: 'bulk_action',
          title: 'Bulk Reject',
          message: `${result.count} fetched posts were rejected`,
        },
      })

      return NextResponse.json({ success: true, action: 'reject', count: result.count })
    }

    if (action === 'approve') {
      // For bulk approve, we need to create actual posts for each fetched post
      const fetchedPosts = await db.fetchedPost.findMany({
        where: {
          id: { in: ids },
          status: { not: 'approved' },
        },
        include: { source: { include: { category: true } } },
      })

      let approvedCount = 0
      const errors: string[] = []

      for (const fp of fetchedPosts) {
        try {
          const title = fp.processedTitle || fp.originalTitle
          const content = fp.processedContent || fp.originalContent || ''

          // Generate unique slug
          let slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100)

          let slugCounter = 1
          let existingSlug = await db.post.findUnique({ where: { slug } })
          while (existingSlug) {
            slug = `${slug.substring(0, 90)}-${slugCounter}`
            slugCounter++
            existingSlug = await db.post.findUnique({ where: { slug } })
          }

          const categoryId = fp.categoryId || fp.source.categoryId

          // Parse important dates/links
          let importantDatesData: Array<{ label: string; date: string }> = []
          let importantLinksData: Array<{ label: string; url: string; linkType?: string }> = []

          if (fp.importantDates) {
            try {
              const parsed = JSON.parse(fp.importantDates)
              if (Array.isArray(parsed)) {
                importantDatesData = parsed
                  .map((d: Record<string, string>) => ({ label: d.label || '', date: d.date || '' }))
                  .filter((d: { label: string; date: string }) => d.label && d.date)
              }
            } catch { /* skip */ }
          }

          if (fp.importantLinks) {
            try {
              const parsed = JSON.parse(fp.importantLinks)
              if (Array.isArray(parsed)) {
                importantLinksData = parsed
                  .map((l: Record<string, string>) => ({ label: l.label || '', url: l.url || '', linkType: l.linkType || 'general' }))
                  .filter((l: { label: string; url: string }) => l.label && l.url)
              }
            } catch { /* skip */ }
          }

          const post = await db.post.create({
            data: {
              title,
              slug,
              excerpt: content ? content.replace(/<[^>]*>/g, '').substring(0, 200) : null,
              content,
              featuredImage: fp.originalImage || null,
              categoryId,
              templateType: fp.templateType || 'job',
              status: 'published',
              isFeatured: false,
              isBreaking: false,
              isTrending: false,
              seoTitle: fp.seoTitle || title.substring(0, 60),
              seoDescription: fp.seoDescription || (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) : title),
              viewCount: 0,
              readTime: Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
              publishedAt: new Date(),
              sourceId: fp.sourceId,
              sourceType: 'auto',
              aiProcessed: true,
              spamScore: fp.spamScore,
              qualityScore: fp.qualityScore,
              importantDates: { create: importantDatesData },
              importantLinks: { create: importantLinksData },
            },
          })

          await db.fetchedPost.update({
            where: { id: fp.id },
            data: {
              status: 'approved',
              publishedPostId: post.id,
              reviewedBy: admin.id,
              reviewedAt: new Date(),
            },
          })

          approvedCount++
        } catch (err) {
          errors.push(`Failed to approve "${fp.originalTitle}": ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      await db.notification.create({
        data: {
          type: 'bulk_action',
          title: 'Bulk Approve',
          message: `${approvedCount} fetched posts were approved and published${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
        },
      })

      return NextResponse.json({
        success: true,
        action: 'approve',
        count: approvedCount,
        errors: errors.length > 0 ? errors : undefined,
      })
    }

    return NextResponse.json({ error: 'Unhandled action' }, { status: 400 })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
