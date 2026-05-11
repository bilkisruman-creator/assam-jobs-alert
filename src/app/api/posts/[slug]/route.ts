import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await db.post.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        importantDates: true,
        importantLinks: true,
      },
    });

    if (!post || post.status !== 'published') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    // Fetch related posts from same category
    const relatedPosts = await db.post.findMany({
      where: {
        categoryId: post.categoryId,
        status: 'published',
        id: { not: post.id },
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        importantDates: true,
      },
    });

    // Transform tags from PostTag[] to tag[]
    const transformedPost = {
      ...post,
      viewCount: post.viewCount + 1,
      tags: post.tags.map((pt) => pt.tag),
    };

    return NextResponse.json({ post: transformedPost, relatedPosts });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
