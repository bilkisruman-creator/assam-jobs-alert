import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { posts: { where: { status: 'published' } } },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Transform to include post count as a regular field
    const categoriesWithCount = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      order: cat.order,
      postCount: cat._count.posts,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Public categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
