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
    const source = await db.source.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const startTime = Date.now()

    // Create FetchQueue entry
    const queueEntry = await db.fetchQueue.create({
      data: {
        sourceId: id,
        priority: source.priority,
        status: 'processing',
        startedAt: new Date(),
      },
    })

    let itemsFound = 0
    let itemsCreated = 0
    let fetchStatus = 'success'
    let fetchError: string | null = null
    const createdPosts: Array<{ id: string; title: string; isDuplicate: boolean }> = []

    try {
      // Fetch and parse based on source type
      const parsedItems = await fetchAndParse(source)
      itemsFound = parsedItems.length

      // Process each parsed item
      for (const item of parsedItems) {
        try {
          // Run duplicate detection
          const duplicateCheck = await checkDuplicate(item.title, item.url)

          // Run spam scoring
          const spamScore = calculateSpamScore(item)

          // Run quality scoring
          const qualityScore = calculateQualityScore(item)

          // Determine AI category and tags
          const aiCategory = detectCategory(item.title + ' ' + (item.description || ''))
          const aiTags = detectTags(item.title + ' ' + (item.description || ''))

          // Determine template type
          const templateType = detectTemplateType(item.title + ' ' + (item.description || ''))

          // Auto-generate SEO fields
          const seoTitle = item.title.substring(0, 60)
          const seoDescription = (item.description || item.title).substring(0, 160)

          const fetchedPost = await db.fetchedPost.create({
            data: {
              sourceId: id,
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
          createdPosts.push({
            id: fetchedPost.id,
            title: item.title,
            isDuplicate: duplicateCheck.isDuplicate,
          })
        } catch (itemError) {
          console.error('Error creating fetched post:', itemError)
        }
      }
    } catch (fetchErr) {
      fetchStatus = 'error'
      fetchError = fetchErr instanceof Error ? fetchErr.message : 'Unknown fetch error'
    }

    const fetchDuration = Date.now() - startTime

    // Update FetchQueue entry
    await db.fetchQueue.update({
      where: { id: queueEntry.id },
      data: {
        status: fetchStatus === 'error' ? 'failed' : 'completed',
        error: fetchError,
        completedAt: new Date(),
      },
    })

    // Update source stats
    const healthScoreDelta = fetchStatus === 'success' ? 5 : -15
    const newConsecutiveFail = fetchStatus === 'success' ? 0 : source.consecutiveFail + 1

    await db.source.update({
      where: { id },
      data: {
        lastFetchedAt: new Date(),
        lastStatus: fetchStatus,
        lastError: fetchError,
        healthScore: Math.max(0, Math.min(100, source.healthScore + healthScoreDelta)),
        totalFetched: source.totalFetched + itemsCreated,
        totalFailed: fetchStatus === 'error' ? source.totalFailed + 1 : source.totalFailed,
        consecutiveFail: newConsecutiveFail,
        qualityScore: itemsCreated > 0
          ? Math.round((source.qualityScore * source.totalFetched + itemsCreated * 70) / (source.totalFetched + itemsCreated))
          : source.qualityScore,
      },
    })

    // Create FetchLog entry
    await db.fetchLog.create({
      data: {
        sourceId: id,
        status: fetchStatus,
        itemsFound,
        itemsCreated,
        itemsPending: itemsCreated,
        error: fetchError,
        fetchDuration,
      },
    })

    // Create notifications for important events
    if (fetchStatus === 'error') {
      await db.notification.create({
        data: {
          type: 'fetch_error',
          title: 'Source Fetch Failed',
          message: `Failed to fetch from "${source.name}": ${fetchError}`,
          link: `/admin/sources/${id}`,
        },
      })
    } else if (newConsecutiveFail >= 3) {
      await db.notification.create({
        data: {
          type: 'source_warning',
          title: 'Source Health Warning',
          message: `"${source.name}" has failed ${newConsecutiveFail} consecutive times. Health score: ${Math.max(0, Math.min(100, source.healthScore + healthScoreDelta))}`,
          link: `/admin/sources/${id}`,
        },
      })
    }

    if (itemsCreated > 0) {
      await db.notification.create({
        data: {
          type: 'fetch_success',
          title: 'Source Fetch Complete',
          message: `Fetched ${itemsCreated} items from "${source.name}" (${itemsFound} found, ${createdPosts.filter(p => p.isDuplicate).length} duplicates detected)`,
          link: '/admin/fetched-posts',
        },
      })
    }

    return NextResponse.json({
      success: fetchStatus === 'success',
      itemsFound,
      itemsCreated,
      fetchDuration,
      fetchStatus,
      error: fetchError || undefined,
      createdPosts,
    })
  } catch (error) {
    console.error('Source fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
): Promise<Array<{ title: string; url?: string; description?: string; content?: string; image?: string; pubDate?: string }>> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; AssamJobsBot/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml, application/json, text/html',
  }

  if (source.apiToken) {
    headers['Authorization'] = `Bearer ${source.apiToken}`
  }

  if (source.apiHeaders) {
    try {
      Object.assign(headers, JSON.parse(source.apiHeaders))
    } catch { /* skip */ }
  }

  if (source.sourceType === 'rss') {
    const rssUrl = source.rssUrl || source.url
    const response = await fetch(rssUrl, {
      signal: AbortSignal.timeout(30000),
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    return parseRssFeed(text)
  }

  if (source.sourceType === 'api') {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(30000),
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return extractApiItems(data, source.mappingRules)
  }

  if (source.sourceType === 'scrape') {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(30000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AssamJobsBot/1.0)',
        Accept: 'text/html',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    return extractScrapeItems(html, source.cssSelector || source.selectors)
  }

  throw new Error(`Unknown source type: ${source.sourceType}`)
}

function parseRssFeed(text: string): Array<{ title: string; url?: string; description?: string; content?: string; image?: string; pubDate?: string }> {
  const items: Array<{ title: string; url?: string; description?: string; content?: string; image?: string; pubDate?: string }> = []

  // RSS <item> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(text)) !== null && items.length < 100) {
    const itemText = match[1]
    const title = extractXmlTag(itemText, 'title')
    if (!title) continue

    const link = extractXmlTag(itemText, 'link')
    const description = extractXmlTag(itemText, 'description')
    const content = extractXmlTag(itemText, 'content:encoded') || description
    const pubDate = extractXmlTag(itemText, 'pubDate')

    // Try to extract image from enclosure or media:content
    let image: string | undefined
    const enclosureMatch = itemText.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"/i)
    const mediaMatch = itemText.match(/<media:content[^>]*url="([^"]*)"[^>]*medium="image"/i)
    if (enclosureMatch) image = enclosureMatch[1]
    else if (mediaMatch) image = mediaMatch[1]

    items.push({
      title: decodeHtmlEntities(title),
      url: link || undefined,
      description: description ? decodeHtmlEntities(description) : undefined,
      content: content ? decodeHtmlEntities(content) : undefined,
      image,
      pubDate: pubDate || undefined,
    })
  }

  // Atom <entry> blocks
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi
    while ((match = entryRegex.exec(text)) !== null && items.length < 100) {
      const entryText = match[1]
      const title = extractXmlTag(entryText, 'title')
      if (!title) continue

      const link = extractAtomLink(entryText)
      const summary = extractXmlTag(entryText, 'summary') || extractXmlTag(entryText, 'content')
      const published = extractXmlTag(entryText, 'published') || extractXmlTag(entryText, 'updated')

      items.push({
        title: decodeHtmlEntities(title),
        url: link || undefined,
        description: summary ? decodeHtmlEntities(summary) : undefined,
        pubDate: published || undefined,
      })
    }
  }

  return items
}

function extractXmlTag(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag.replace(':', ':')}[^>]*>([\\s\\S]*?)<\\/${tag.replace(':', ':')}>`, 'i')
  const match = regex.exec(text)
  return match ? match[1].trim() : null
}

function extractAtomLink(text: string): string | null {
  const regex = /<link[^>]*href="([^"]*)"[^>]*>/i
  const match = regex.exec(text)
  return match ? match[1] : null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}

function extractApiItems(data: unknown, mappingRules?: string | null): Array<{ title: string; url?: string; description?: string; content?: string; image?: string }> {
  let rules: Record<string, string> = {}
  if (mappingRules) {
    try { rules = JSON.parse(mappingRules) } catch { /* skip */ }
  }

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
    return {
      title: String(getNestedValue(obj, titlePath) || ''),
      url: String(getNestedValue(obj, urlPath) || undefined),
      description: String(getNestedValue(obj, descPath) || '').substring(0, 2000),
      image: String(getNestedValue(obj, imagePath) || undefined),
    }
  }).filter((item): item is NonNullable<typeof item> => item !== null && item.title.length > 0)
}

function findArrayInObject(obj: unknown, path: string): unknown {
  if (Array.isArray(obj)) return obj
  if (typeof obj !== 'object' || obj === null) return null

  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return null
    current = (current as Record<string, unknown>)[part]
  }
  if (Array.isArray(current)) return current

  const commonPaths = ['data', 'items', 'results', 'posts', 'articles', 'entries']
  for (const cp of commonPaths) {
    const found = (obj as Record<string, unknown>)[cp]
    if (Array.isArray(found)) return found
  }
  return null
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function extractScrapeItems(html: string, selectors?: string | null): Array<{ title: string; url?: string; description?: string }> {
  const items: Array<{ title: string; url?: string; description?: string }> = []

  // Try to extract links and titles using regex
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null && items.length < 100) {
    const url = match[1]
    const text = match[2].replace(/<[^>]*>/g, '').trim()

    // Filter for meaningful links (not navigation, not short text)
    if (
      text.length > 15 &&
      text.length < 200 &&
      !url.startsWith('#') &&
      !url.startsWith('javascript') &&
      !text.match(/^(home|about|contact|login|sign up|register)$/i)
    ) {
      items.push({
        title: text,
        url: url.startsWith('http') ? url : undefined,
        description: '',
      })
    }
  }

  // If selectors provided, try to be more targeted
  if (items.length === 0 && selectors) {
    const selectorStr = selectors.replace(/[.#]/g, '').split(/\s+/)[0]
    const containerRegex = new RegExp(
      `<[^>]*(?:class|id)="[^"]*${selectorStr}[^"]*"[^>]*>([\\s\\S]*?)<\\/`,
      'gi'
    )
    while ((match = containerRegex.exec(html)) !== null && items.length < 20) {
      const content = match[1].replace(/<[^>]*>/g, '').trim()
      if (content.length > 10) {
        items.push({
          title: content.substring(0, 100),
          description: content.substring(0, 500),
        })
      }
    }
  }

  return items
}

// Duplicate detection
async function checkDuplicate(title: string, url?: string): Promise<{ isDuplicate: boolean; duplicateOfId: string | null }> {
  // Check by exact URL match
  if (url) {
    const urlMatch = await db.fetchedPost.findFirst({
      where: {
        originalUrl: url,
        status: { not: 'rejected' },
      },
      select: { id: true },
    })
    if (urlMatch) {
      return { isDuplicate: true, duplicateOfId: urlMatch.id }
    }
  }

  // Check by title similarity
  const titleSub = title.substring(0, 50)
  const titleMatch = await db.fetchedPost.findFirst({
    where: {
      originalTitle: { contains: titleSub },
      status: { not: 'rejected' },
    },
    select: { id: true },
  })
  if (titleMatch) {
    return { isDuplicate: true, duplicateOfId: titleMatch.id }
  }

  // Check against published posts
  const publishedMatch = await db.post.findFirst({
    where: {
      title: { contains: titleSub },
      status: 'published',
    },
    select: { id: true },
  })
  if (publishedMatch) {
    return { isDuplicate: true, duplicateOfId: publishedMatch.id }
  }

  return { isDuplicate: false, duplicateOfId: null }
}

// Spam scoring heuristics
function calculateSpamScore(item: { title: string; description?: string; url?: string }): number {
  let score = 0
  const text = `${item.title} ${item.description || ''}`.toLowerCase()

  // Spam indicators
  const spamKeywords = ['buy now', 'click here', 'free money', 'act now', 'limited time', 'urgent', 'congratulations you won', 'lottery', 'prize claim']
  for (const keyword of spamKeywords) {
    if (text.includes(keyword)) score += 20
  }

  // Excessive caps
  const capsRatio = (item.title.replace(/[^A-Z]/g, '').length) / Math.max(1, item.title.length)
  if (capsRatio > 0.5 && item.title.length > 10) score += 15

  // Very short content
  if (item.title.length < 10) score += 10
  if (!item.description || item.description.length < 20) score += 10

  // Excessive exclamation marks
  const exclCount = (item.title.match(/!/g) || []).length
  if (exclCount > 2) score += 10

  // URL looks suspicious
  if (item.url) {
    try {
      const urlObj = new URL(item.url)
      if (urlObj.hostname.includes('bit.ly') || urlObj.hostname.includes('tinyurl')) score += 10
    } catch { /* skip */ }
  }

  return Math.min(100, score)
}

// Quality scoring
function calculateQualityScore(item: { title: string; description?: string; content?: string; image?: string }): number {
  let score = 30 // base score

  // Good title length
  if (item.title.length >= 20 && item.title.length <= 100) score += 15
  else if (item.title.length >= 10) score += 5

  // Has description
  if (item.description && item.description.length > 50) score += 15
  if (item.description && item.description.length > 200) score += 5

  // Has content
  if (item.content && item.content.length > 200) score += 10

  // Has image
  if (item.image) score += 10

  // Has URL
  if (item.url) score += 5

  // Contains relevant keywords for job/education portal
  const relevantKeywords = ['recruitment', 'job', 'vacancy', 'post', 'application', 'exam', 'result', 'admit card', 'admission', 'notification', 'salary', 'qualification', 'last date', 'apply online', 'assam', 'guwahati']
  const text = `${item.title} ${item.description || ''}`.toLowerCase()
  let relevanceScore = 0
  for (const keyword of relevantKeywords) {
    if (text.includes(keyword)) relevanceScore++
  }
  score += Math.min(15, relevanceScore * 3)

  return Math.min(100, score)
}

// AI category detection
function detectCategory(text: string): string {
  const lower = text.toLowerCase()
  const categories: Record<string, string[]> = {
    'job': ['recruitment', 'job', 'vacancy', 'post', 'salary', 'qualification', 'apply online', 'hiring', 'posting'],
    'result': ['result', 'merit list', 'selected', 'outcome', 'marks', 'score card'],
    'admit-card': ['admit card', 'hall ticket', 'call letter', 'exam date', 'roll number'],
    'admission': ['admission', 'enrollment', 'course', 'university', 'college', 'counseling'],
    'scholarship': ['scholarship', 'fellowship', 'stipend', 'financial aid', 'grant'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category
    }
  }

  return 'job'
}

// Tag detection
function detectTags(text: string): string {
  const lower = text.toLowerCase()
  const tags: string[] = []

  const tagKeywords: Record<string, string[]> = {
    'Government Job': ['government', 'govt', 'sarkari'],
    'Assam': ['assam', 'guwahati', 'dispur'],
    'APSC': ['apsc', 'assam public service'],
    'Police': ['police', 'sipahi', 'constable'],
    'Education': ['education', 'teacher', 'school', 'college'],
    'Engineering': ['engineer', 'engineering', 'btech', 'mtech'],
    'Medical': ['medical', 'doctor', 'nurse', 'hospital', 'health'],
    'Banking': ['bank', 'banking', 'sbi', 'ibps'],
    'Railway': ['railway', 'rly', 'rrb', 'train'],
    'Defense': ['army', 'navy', 'air force', 'defence', 'military'],
    'Last Date': ['last date', 'closing date', 'deadline'],
    'Online Apply': ['apply online', 'online application'],
  }

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        tags.push(tag)
        break
      }
    }
  }

  return tags.length > 0 ? JSON.stringify(tags) : null
}

// Template type detection
function detectTemplateType(text: string): string {
  const lower = text.toLowerCase()

  if (lower.includes('result') || lower.includes('merit list') || lower.includes('selected')) return 'result'
  if (lower.includes('admit card') || lower.includes('hall ticket') || lower.includes('exam date')) return 'admit-card'
  if (lower.includes('admission') || lower.includes('enrollment') || lower.includes('counseling')) return 'admission'
  if (lower.includes('scholarship') || lower.includes('fellowship') || lower.includes('stipend')) return 'scholarship'

  return 'job'
}
