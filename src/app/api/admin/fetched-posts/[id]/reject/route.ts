import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

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
    const body = await req.json().catch(() => ({}))
    const reason = body.reason || null

    const fetchedPost = await db.fetchedPost.findUnique({ where: { id } })
    if (!fetchedPost) {
      return NextResponse.json({ error: 'Fetched post not found' }, { status: 404 })
    }

    if (fetchedPost.status === 'rejected') {
      return NextResponse.json({ error: 'Post is already rejected' }, { status: 400 })
    }

    await db.fetchedPost.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    })

    // Create notification
    await db.notification.create({
      data: {
        type: 'fetch_rejected',
        title: 'Fetched Post Rejected',
        message: `"${fetchedPost.originalTitle}" was rejected${reason ? `: ${reason}` : ''} (Source: ${fetchedPost.sourceName})`,
      },
    })

    return NextResponse.json({
      success: true,
      reason,
    })
  } catch (error) {
    console.error('Reject fetched post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
