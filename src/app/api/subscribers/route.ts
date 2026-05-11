import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const existing = await db.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Reactivate if unsubscribed
      if (!existing.isActive) {
        await db.subscriber.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({
          message: 'Subscription reactivated successfully',
        });
      }
      return NextResponse.json({
        message: 'Already subscribed',
      });
    }

    await db.subscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { message: 'Subscribed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
