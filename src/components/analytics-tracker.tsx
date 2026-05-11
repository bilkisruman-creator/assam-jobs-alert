'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function detectDevice(ua: string): string {
  if (/Mobile|Android|iPhone/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function detectBrowser(ua: string): string {
  if (/Edg/i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua)) return 'Safari';
  if (/Opera|OPR/i.test(ua)) return 'Opera';
  return 'Other';
}

function detectOS(ua: string): string {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad/i.test(ua)) return 'iOS';
  return 'Other';
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_sid');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem('_sid', sid);
  }
  return sid;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef(Date.now());
  const trackedRef = useRef<string>('');

  useEffect(() => {
    if (trackedRef.current === pathname) return;
    trackedRef.current = pathname;

    const sid = getSessionId();
    const ua = navigator.userAgent;

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'pageview',
        pagePath: pathname,
        referrer: document.referrer || undefined,
        device: detectDevice(ua),
        browser: detectBrowser(ua),
        os: detectOS(ua),
        sessionId: sid,
      }),
    }).catch(() => {});

    startTimeRef.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const sid = getSessionId();
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/track',
          JSON.stringify({
            eventType: 'duration',
            pagePath: pathname,
            sessionId: sid,
            duration,
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return null;
}
