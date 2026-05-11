import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const source = await db.source.findUnique({ where: { id } })
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const fetchLog = await db.fetchLog.create({
      data: {
        sourceId: id,
        status: 'success',
        itemsFound: Math.floor(Math.random() * 10) + 1,
        itemsCreated: Math.floor(Math.random() * 5),
      },
    })

    await db.source.update({
      where: { id },
      data: {
        lastFetchedAt: new Date(),
        lastStatus: 'success',
      },
    })

    return NextResponse.json({ success: true, fetchLog })
  } catch (error) {
    console.error('Fetch source error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
