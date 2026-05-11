import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const existing = await db.ad.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    const ad = await db.ad.update({
      where: { id },
      data: {
        title: data.title,
        code: data.code,
        placement: data.placement,
        isActive: data.isActive,
        order: data.order,
      },
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Update ad error:', error)
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
    const existing = await db.ad.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    await db.ad.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
