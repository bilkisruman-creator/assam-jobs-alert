import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      );
    }

    const searchTerm = q.trim();

    const posts = await db.post.findMany({
      where: {
        status: 'published',
        publishedAt: { not: null },
        OR: [
          { title: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } },
          { seoKeywords: { contains: searchTerm } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        importantDates: true,
        importantLinks: true,
      },
    });

    return NextResponse.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}
