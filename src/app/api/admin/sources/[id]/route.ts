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

    const existing = await db.source.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const source = await db.source.update({
      where: { id },
      data: {
        name: data.name,
        url: data.url,
        sourceType: data.sourceType,
        categoryId: data.categoryId,
        isActive: data.isActive,
        fetchInterval: data.fetchInterval,
        selectors: data.selectors,
        mappingRules: data.mappingRules,
        autoPublish: data.autoPublish,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, source })
  } catch (error) {
    console.error('Update source error:', error)
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
    const existing = await db.source.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    await db.source.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete source error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
