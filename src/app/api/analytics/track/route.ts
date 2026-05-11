import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      eventType,
      pagePath,
      postId,
      referrer,
      device,
      browser,
      os,
      country,
      city,
      sessionId,
      duration,
    } = body

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 })
    }

    // Get IP and user agent from request headers
    const forwarded = req.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || null
    const userAgent = req.headers.get('user-agent') || null

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        eventType,
        pagePath: pagePath || null,
        postId: postId || null,
        referrer: referrer || null,
        country: country || null,
        city: city || null,
        device: device || null,
        browser: browser || null,
        os: os || null,
        ipAddress,
        userAgent,
        sessionId: sessionId || null,
        duration: duration || 0,
      },
    })

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0]

    const existing = await db.dailyAnalytics.findUnique({
      where: { date: today },
    })

    if (existing) {
      const updateData: Record<string, unknown> = {
        totalViews: existing.totalViews + 1,
        updatedAt: new Date(),
      }

      // Track unique visits by sessionId
      if (sessionId) {
        const todayStart = new Date(today)
        const todayEnd = new Date(today + 'T23:59:59.999Z')
        const uniqueSessions = await db.analyticsEvent.findMany({
          where: {
            createdAt: { gte: todayStart, lte: todayEnd },
            sessionId: { not: null },
          },
          select: { sessionId: true },
          distinct: ['sessionId'],
        })
        updateData.uniqueVisits = uniqueSessions.length
      }

      // Update top fields if provided
      if (country) updateData.topCountry = country
      if (device) updateData.topDevice = device
      if (browser) updateData.topBrowser = browser
      if (referrer) updateData.topReferrer = referrer

      // Update duration stats
      if (duration && duration > 0) {
        const allDurations = await db.analyticsEvent.findMany({
          where: {
            createdAt: {
              gte: new Date(today),
              lte: new Date(today + 'T23:59:59.999Z'),
            },
            duration: { gt: 0 },
          },
          select: { duration: true },
        })
        if (allDurations.length > 0) {
          updateData.avgDuration = allDurations.reduce((sum, e) => sum + e.duration, 0) / allDurations.length
        }
      }

      await db.dailyAnalytics.update({
        where: { date: today },
        data: updateData,
      })
    } else {
      await db.dailyAnalytics.create({
        data: {
          date: today,
          totalViews: 1,
          uniqueVisits: 1,
          newUsers: eventType === 'new_user' ? 1 : 0,
          bounceRate: 0,
          avgDuration: duration || 0,
          topCountry: country || null,
          topDevice: device || null,
          topBrowser: browser || null,
          topReferrer: referrer || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
