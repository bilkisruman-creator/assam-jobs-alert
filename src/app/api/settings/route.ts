import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public settings keys - safe to expose to frontend
const PUBLIC_SETTINGS_KEYS = [
  'site_name',
  'site_tagline',
  'site_description',
  'site_logo',
  'site_favicon',
  'logo_url',
  'favicon_url',
  'social_facebook',
  'social_twitter',
  'social_instagram',
  'social_youtube',
  'social_telegram',
  'social_whatsapp',
  'footer_text',
  'header_notification',
  'google_analytics_id',
];

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: { in: PUBLIC_SETTINGS_KEYS },
      },
    });

    const result: Record<string, string> = {};
    settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
