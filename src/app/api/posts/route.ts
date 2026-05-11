import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured');
    const breaking = searchParams.get('breaking');
    const trending = searchParams.get('trending');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      status: 'published',
      publishedAt: { not: null },
    };

    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (breaking === 'true') {
      where.isBreaking = true;
    }

    if (trending === 'true') {
      where.isTrending = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          category: true,
          importantDates: true,
          importantLinks: true,
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
