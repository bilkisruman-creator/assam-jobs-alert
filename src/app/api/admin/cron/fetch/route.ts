import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all active sources that need fetching
    const now = new Date()
    const sources = await db.source.findMany({
      where: {
        isActive: true,
      },
      include: { category: true },
      orderBy: { priority: 'desc' },
    })

    const eligibleSources = sources.filter((source) => {
      if (!source.lastFetchedAt) return true
      const secondsSinceLastFetch = (now.getTime() - source.lastFetchedAt.getTime()) / 1000
      return secondsSinceLastFetch >= source.fetchInterval
    })

    if (eligibleSources.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sources need fetching at this time',
        totalSources: sources.length,
        eligibleSources: 0,
        results: [],
      })
    }

    const results: Array<{
      sourceId: string
      sourceName: string
      success: boolean
      itemsFound: number
      itemsCreated: number
      error?: string
      duration: number
    }> = []

    // Process sources in priority order
    for (const source of eligibleSources) {
      const startTime = Date.now()

      try {
        // Create FetchQueue entry
        const queueEntry = await db.fetchQueue.create({
          data: {
            sourceId: source.id,
            priority: source.priority,
            status: 'processing',
            startedAt: new Date(),
          },
        })

        // Fetch and parse
        const parsedItems = await fetchAndParse(source)
        let itemsCreated = 0

        for (const item of parsedItems) {
          try {
            // Duplicate detection
            const duplicateCheck = await checkDuplicate(item.title, item.url)

            // Spam and quality scoring
            const spamScore = calculateSpamScore(item)
            const qualityScore = calculateQualityScore(item)

            // Skip high-spam items
            if (spamScore >= 80) continue

            // AI detection
            const aiCategory = detectCategory(item.title + ' ' + (item.description || ''))
            const aiTags = detectTags(item.title + ' ' + (item.description || ''))
            const templateType = detectTemplateType(item.title + ' ' + (item.description || ''))
            const seoTitle = item.title.substring(0, 60)
            const seoDescription = (item.description || item.title).substring(0, 160)

            await db.fetchedPost.create({
              data: {
                sourceId: source.id,
                sourceName: source.name,
                sourceUrl: source.url,
                originalTitle: item.title,
                originalContent: item.description || item.content || null,
                processedTitle: item.title,
                processedContent: item.content || item.description || null,
                originalUrl: item.url || null,
                originalImage: item.image || null,
                categoryId: source.categoryId,
                templateType,
                status: 'pending',
                spamScore,
                qualityScore,
                isDuplicate: duplicateCheck.isDuplicate,
                duplicateOfId: duplicateCheck.duplicateOfId || null,
                aiTags,
                aiCategory,
                seoTitle,
                seoDescription,
              },
            })

            itemsCreated++
          } catch (itemError) {
            console.error(`Error creating fetched post from source ${source.name}:`, itemError)
          }
        }

        const duration = Date.now() - startTime

        // Update FetchQueue
        await db.fetchQueue.update({
          where: { id: queueEntry.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        })

        // Update source
        await db.source.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            lastStatus: 'success',
            healthScore: Math.min(100, source.healthScore + 5),
            totalFetched: source.totalFetched + itemsCreated,
            consecutiveFail: 0,
          },
        })

        // Create FetchLog
        await db.fetchLog.create({
          data: {
            sourceId: source.id,
            status: 'success',
            itemsFound: parsedItems.length,
            itemsCreated,
            itemsPending: itemsCreated,
            fetchDuration: duration,
          },
        })

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: true,
          itemsFound: parsedItems.length,
          itemsCreated,
          duration,
        })
      } catch (fetchErr) {
        const duration = Date.now() - startTime
        const errorMessage = fetchErr instanceof Error ? fetchErr.message : 'Unknown error'

        // Update source
        await db.source.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            lastStatus: 'error',
            lastError: errorMessage,
            healthScore: Math.max(0, source.healthScore - 15),
            totalFailed: source.totalFailed + 1,
            consecutiveFail: source.consecutiveFail + 1,
          },
        })

        // Create FetchLog
        await db.fetchLog.create({
          data: {
            sourceId: source.id,
            status: 'error',
            error: errorMessage,
            fetchDuration: duration,
          },
        })

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          itemsFound: 0,
          itemsCreated: 0,
          error: errorMessage,
          duration,
        })
      }
    }

    // Create summary notification
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    const totalItems = results.reduce((sum, r) => sum + r.itemsCreated, 0)

    await db.notification.create({
      data: {
        type: 'cron_fetch',
        title: 'Auto-Fetch Complete',
        message: `Fetched ${eligibleSources.length} sources: ${successCount} successful, ${failCount} failed. ${totalItems} new items created.`,
      },
    })

    return NextResponse.json({
      success: true,
      totalSources: sources.length,
      eligibleSources: eligibleSources.length,
      successCount,
      failCount,
      totalItemsCreated: totalItems,
      results,
    })
  } catch (error) {
    console.error('Auto fetch cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// --- Helper functions (same as in source fetch route) ---

async function fetchAndParse(
  source: {
    sourceType: string
    url: string
    rssUrl?: string | null
    apiHeaders?: string | null
    apiToken?: string | null
    selectors?: string | null
    mappingRules?: string | null
    cssSelector?: string | null
  }
): Promise<Array<{ title: string; url?: string; description?: string; content?: string; image?: string }>> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; AssamJobsBot/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml, application/json, text/html',
  }

  if (source.apiToken) {
    headers['Authorization'] = `Bearer ${source.apiToken}`
  }
  if (source.apiHeaders) {
    try { Object.assign(headers, JSON.parse(source.apiHeaders)) } catch { /* skip */ }
  }

  if (source.sourceType === 'rss') {
    const rssUrl = source.rssUrl || source.url
    const response = await fetch(rssUrl, { signal: AbortSignal.timeout(30000), headers })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    return parseRssFeed(text)
  }

  if (source.sourceType === 'api') {
    const response = await fetch(source.url, { signal: AbortSignal.timeout(30000), headers })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return extractApiItems(data, source.mappingRules)
  }

  if (source.sourceType === 'scrape') {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(30000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AssamJobsBot/1.0)', Accept: 'text/html' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    return extractScrapeItems(html, source.cssSelector || source.selectors)
  }

  throw new Error(`Unknown source type: ${source.sourceType}`)
}

function parseRssFeed(text: string): Array<{ title: string; url?: string; description?: string; content?: string; image?: string }> {
  const items: Array<{ title: string; url?: string; description?: string; content?: string; image?: string }> = []
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(text)) !== null && items.length < 100) {
    const itemText = match[1]
    const title = extractXmlTag(itemText, 'title')
    if (!title) continue
    const link = extractXmlTag(itemText, 'link')
    const description = extractXmlTag(itemText, 'description')
    const content = extractXmlTag(itemText, 'content:encoded') || description
    let image: string | undefined
    const enclosureMatch = itemText.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"/i)
    const mediaMatch = itemText.match(/<media:content[^>]*url="([^"]*)"[^>]*medium="image"/i)
    if (enclosureMatch) image = enclosureMatch[1]
    else if (mediaMatch) image = mediaMatch[1]
    items.push({ title: decodeHtmlEntities(title), url: link || undefined, description: description ? decodeHtmlEntities(description) : undefined, content: content ? decodeHtmlEntities(content) : undefined, image })
  }

  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi
    while ((match = entryRegex.exec(text)) !== null && items.length < 100) {
      const entryText = match[1]
      const title = extractXmlTag(entryText, 'title')
      if (!title) continue
      const link = extractAtomLink(entryText)
      const summary = extractXmlTag(entryText, 'summary') || extractXmlTag(entryText, 'content')
      items.push({ title: decodeHtmlEntities(title), url: link || undefined, description: summary ? decodeHtmlEntities(summary) : undefined })
    }
  }

  return items
}

function extractXmlTag(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = regex.exec(text)
  return match ? match[1].trim() : null
}

function extractAtomLink(text: string): string | null {
  const match = /<link[^>]*href="([^"]*)"[^>]*>/i.exec(text)
  return match ? match[1] : null
}

function decodeHtmlEntities(text: string): string {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}

function extractApiItems(data: unknown, mappingRules?: string | null): Array<{ title: string; url?: string; description?: string; image?: string }> {
  let rules: Record<string, string> = {}
  if (mappingRules) { try { rules = JSON.parse(mappingRules) } catch { /* skip */ } }
  const itemPath = rules.itemsPath || 'items'
  const titlePath = rules.titlePath || 'title'
  const urlPath = rules.urlPath || 'url'
  const descPath = rules.descPath || 'description'
  const imagePath = rules.imagePath || 'image'
  const dataArray = findArrayInObject(data, itemPath)
  if (!dataArray || !Array.isArray(dataArray)) return []
  return dataArray.slice(0, 100).map((item) => {
    if (typeof item !== 'object' || item === null) return null
    const obj = item as Record<string, unknown>
    return { title: String(getNestedValue(obj, titlePath) || ''), url: String(getNestedValue(obj, urlPath) || undefined), description: String(getNestedValue(obj, descPath) || '').substring(0, 2000), image: String(getNestedValue(obj, imagePath) || undefined) }
  }).filter((item): item is NonNullable<typeof item> => item !== null && item.title.length > 0)
}

function findArrayInObject(obj: unknown, path: string): unknown {
  if (Array.isArray(obj)) return obj
  if (typeof obj !== 'object' || obj === null) return null
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) { if (typeof current !== 'object' || current === null) return null; current = (current as Record<string, unknown>)[part] }
  if (Array.isArray(current)) return current
  for (const cp of ['data', 'items', 'results', 'posts', 'articles', 'entries']) { const found = (obj as Record<string, unknown>)[cp]; if (Array.isArray(found)) return found }
  return null
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) { if (typeof current !== 'object' || current === null) return undefined; current = (current as Record<string, unknown>)[part] }
  return current
}

function extractScrapeItems(html: string, selectors?: string | null): Array<{ title: string; url?: string; description?: string }> {
  const items: Array<{ title: string; url?: string; description?: string }> = []
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = linkRegex.exec(html)) !== null && items.length < 100) {
    const url = match[1]
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    if (text.length > 15 && text.length < 200 && !url.startsWith('#') && !url.startsWith('javascript')) {
      items.push({ title: text, url: url.startsWith('http') ? url : undefined, description: '' })
    }
  }
  if (items.length === 0 && selectors) {
    const selectorStr = selectors.replace(/[.#]/g, '').split(/\s+/)[0]
    const containerRegex = new RegExp(`<[^>]*(?:class|id)="[^"]*${selectorStr}[^"]*"[^>]*>([\\s\\S]*?)<\\/`, 'gi')
    while ((match = containerRegex.exec(html)) !== null && items.length < 20) {
      const content = match[1].replace(/<[^>]*>/g, '').trim()
      if (content.length > 10) items.push({ title: content.substring(0, 100), description: content.substring(0, 500) })
    }
  }
  return items
}

async function checkDuplicate(title: string, url?: string): Promise<{ isDuplicate: boolean; duplicateOfId: string | null }> {
  if (url) {
    const urlMatch = await db.fetchedPost.findFirst({ where: { originalUrl: url, status: { not: 'rejected' } }, select: { id: true } })
    if (urlMatch) return { isDuplicate: true, duplicateOfId: urlMatch.id }
  }
  const titleSub = title.substring(0, 50)
  const titleMatch = await db.fetchedPost.findFirst({ where: { originalTitle: { contains: titleSub }, status: { not: 'rejected' } }, select: { id: true } })
  if (titleMatch) return { isDuplicate: true, duplicateOfId: titleMatch.id }
  const publishedMatch = await db.post.findFirst({ where: { title: { contains: titleSub }, status: 'published' }, select: { id: true } })
  if (publishedMatch) return { isDuplicate: true, duplicateOfId: publishedMatch.id }
  return { isDuplicate: false, duplicateOfId: null }
}

function calculateSpamScore(item: { title: string; description?: string; url?: string }): number {
  let score = 0
  const text = `${item.title} ${item.description || ''}`.toLowerCase()
  const spamKeywords = ['buy now', 'click here', 'free money', 'act now', 'limited time', 'urgent', 'congratulations you won', 'lottery', 'prize claim']
  for (const keyword of spamKeywords) { if (text.includes(keyword)) score += 20 }
  const capsRatio = item.title.replace(/[^A-Z]/g, '').length / Math.max(1, item.title.length)
  if (capsRatio > 0.5 && item.title.length > 10) score += 15
  if (item.title.length < 10) score += 10
  if (!item.description || item.description.length < 20) score += 10
  const exclCount = (item.title.match(/!/g) || []).length
  if (exclCount > 2) score += 10
  return Math.min(100, score)
}

function calculateQualityScore(item: { title: string; description?: string; content?: string; image?: string }): number {
  let score = 30
  if (item.title.length >= 20 && item.title.length <= 100) score += 15
  else if (item.title.length >= 10) score += 5
  if (item.description && item.description.length > 50) score += 15
  if (item.description && item.description.length > 200) score += 5
  if (item.content && item.content.length > 200) score += 10
  if (item.image) score += 10
  if (item.url) score += 5
  const relevantKeywords = ['recruitment', 'job', 'vacancy', 'post', 'application', 'exam', 'result', 'admit card', 'admission', 'notification', 'assam']
  const text = `${item.title} ${item.description || ''}`.toLowerCase()
  let relScore = 0
  for (const keyword of relevantKeywords) { if (text.includes(keyword)) relScore++ }
  score += Math.min(15, relScore * 3)
  return Math.min(100, score)
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase()
  const categories: Record<string, string[]> = {
    'job': ['recruitment', 'job', 'vacancy', 'post', 'salary', 'qualification', 'apply online', 'hiring'],
    'result': ['result', 'merit list', 'selected', 'outcome', 'marks'],
    'admit-card': ['admit card', 'hall ticket', 'call letter', 'exam date'],
    'admission': ['admission', 'enrollment', 'course', 'university', 'counseling'],
    'scholarship': ['scholarship', 'fellowship', 'stipend', 'financial aid'],
  }
  for (const [category, keywords] of Object.entries(categories)) { for (const keyword of keywords) { if (lower.includes(keyword)) return category } }
  return 'job'
}

function detectTags(text: string): string | null {
  const lower = text.toLowerCase()
  const tags: string[] = []
  const tagKeywords: Record<string, string[]> = {
    'Government Job': ['government', 'govt', 'sarkari'],
    'Assam': ['assam', 'guwahati'],
    'APSC': ['apsc'],
    'Police': ['police', 'constable'],
    'Education': ['education', 'teacher', 'school'],
    'Engineering': ['engineer', 'engineering', 'btech'],
    'Medical': ['medical', 'doctor', 'nurse'],
    'Banking': ['bank', 'sbi', 'ibps'],
    'Railway': ['railway', 'rrb'],
    'Defense': ['army', 'navy', 'air force'],
    'Last Date': ['last date', 'deadline'],
    'Online Apply': ['apply online', 'online application'],
  }
  for (const [tag, keywords] of Object.entries(tagKeywords)) { for (const keyword of keywords) { if (lower.includes(keyword)) { tags.push(tag); break } } }
  return tags.length > 0 ? JSON.stringify(tags) : null
}

function detectTemplateType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('result') || lower.includes('merit list')) return 'result'
  if (lower.includes('admit card') || lower.includes('hall ticket')) return 'admit-card'
  if (lower.includes('admission') || lower.includes('enrollment')) return 'admission'
  if (lower.includes('scholarship') || lower.includes('fellowship')) return 'scholarship'
  return 'job'
}
