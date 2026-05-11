import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ads = await db.ad.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Ads list error:', error)
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

    const ad = await db.ad.create({
      data: {
        title: data.title,
        code: data.code,
        placement: data.placement,
        isActive: data.isActive !== false,
        order: data.order || 0,
      },
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Create ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
