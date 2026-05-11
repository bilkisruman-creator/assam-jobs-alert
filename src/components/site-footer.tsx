'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
  youtube_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  instagram_link?: string;
  android_app_link?: string;
}

export function SiteFooter() {
  const [settings, setSettings] = useState<Settings>({});
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success('Subscribed successfully!');
        setEmail('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch {
      toast.error('Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const categories = [
    { name: 'Latest Jobs', slug: 'latest-jobs' },
    { name: 'Results', slug: 'results' },
    { name: 'Admit Cards', slug: 'admit-cards' },
    { name: 'Admissions', slug: 'admissions' },
    { name: 'Scholarships', slug: 'scholarships' },
    { name: 'Answer Keys', slug: 'answer-keys' },
    { name: 'Syllabus', slug: 'syllabus' },
  ];

  const importantLinks = [
    { name: 'APSC Official', url: 'https://apsc.nic.in' },
    { name: 'SLPRB Assam', url: 'https://slprbassam.in' },
    { name: 'SEBA', url: 'https://sebaonline.org' },
    { name: 'AHSEC', url: 'https://ahsec.assam.gov.in' },
    { name: 'ASTU', url: 'https://astu.ac.in' },
    { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in' },
  ];

  const socialLinks = [
    { name: 'Telegram', url: settings.telegram_link || '#', color: 'bg-sky-500 hover:bg-sky-600' },
    { name: 'WhatsApp', url: settings.whatsapp_link || '#', color: 'bg-green-500 hover:bg-green-600' },
    { name: 'YouTube', url: settings.youtube_link || '#', color: 'bg-red-500 hover:bg-red-600' },
    { name: 'Facebook', url: settings.facebook_link || '#', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Twitter', url: settings.twitter_link || '#', color: 'bg-gray-700 hover:bg-gray-800' },
    { name: 'Instagram', url: settings.instagram_link || '#', color: 'bg-pink-500 hover:bg-pink-600' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Newsletter Section */}
      <div className="bg-green-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Send className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">Subscribe for Job Alerts</span>
          </div>
          <div className="flex gap-2 w-full sm:max-w-md">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <Button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-white text-green-800 hover:bg-green-50 shrink-0"
            >
              {subscribing ? '...' : 'Subscribe'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Assam Jobs Alert</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted source for Assam Government Jobs, Results, Admit Cards, Admissions & Scholarships. 
              Stay updated with the latest notifications.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} text-white text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1`}
                >
                  {social.name}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Important Links</h3>
            <ul className="space-y-2">
              {importantLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h3 className="font-semibold text-white mb-4">Get Our App</h3>
            <p className="text-sm text-gray-400 mb-4">
              Download our Android app for instant job notifications on your phone.
            </p>
            {settings.android_app_link && (
              <a
                href={settings.android_app_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white text-gray-900 hover:bg-gray-100 w-full">
                  Download Android App
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Assam Jobs Alert. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Made with ❤️ for the people of Assam
          </p>
        </div>
      </div>
    </footer>
  );
}
