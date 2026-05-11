'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, IdCard, GraduationCap, BookOpen, FileCheck,
  BookMarked, Landmark, Building2, Users, ChevronRight,
  Trophy, Info, Mail, ShieldCheck, FileText, Megaphone,
  Scale, Download, MessageCircle, Globe, MapPin,
} from 'lucide-react';

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
  android_app_link?: string;
}

const categoryGroups = [
  {
    label: 'Jobs',
    icon: Briefcase,
    color: '#16a34a',
    items: [
      { name: 'Latest Jobs', slug: 'latest-jobs', icon: Briefcase, desc: 'All new job notifications' },
      { name: 'Assam Govt Jobs', slug: 'assam-govt-jobs', icon: Landmark, desc: 'Assam state government jobs' },
      { name: 'State Government Jobs', slug: 'state-government-jobs', icon: MapPin, desc: 'All state government jobs' },
      { name: 'Central Govt Jobs', slug: 'central-govt-jobs', icon: Building2, desc: 'Central government jobs' },
      { name: 'Private Jobs', slug: 'private-jobs', icon: Briefcase, desc: 'Private sector jobs' },
      { name: 'Walk-in Interviews', slug: 'walk-in-interviews', icon: Users, desc: 'Walk-in interview updates' },
    ],
  },
  {
    label: 'Education',
    icon: GraduationCap,
    color: '#0891b2',
    items: [
      { name: 'Results', slug: 'results', icon: Trophy, desc: 'Exam results & merit lists' },
      { name: 'Admit Cards', slug: 'admit-cards', icon: IdCard, desc: 'Download admit cards' },
      { name: 'Admissions', slug: 'admissions', icon: GraduationCap, desc: 'Admission notifications' },
      { name: 'Scholarships', slug: 'scholarships', icon: BookOpen, desc: 'Scholarship opportunities' },
      { name: 'Syllabus', slug: 'syllabus', icon: BookMarked, desc: 'Exam syllabus & pattern' },
      { name: 'Answer Key', slug: 'answer-key', icon: FileCheck, desc: 'Exam answer keys' },
    ],
  },
];

const pageLinks = [
  { name: 'About Us', href: '/page/about-us', icon: Info, desc: 'Know more about us' },
  { name: 'Contact Us', href: '/page/contact-us', icon: Mail, desc: 'Get in touch' },
  { name: 'Privacy Policy', href: '/page/privacy-policy', icon: ShieldCheck, desc: 'How we handle your data' },
  { name: 'Disclaimer', href: '/page/disclaimer', icon: FileText, desc: 'Important disclaimers' },
  { name: 'Terms & Conditions', href: '/page/terms-and-conditions', icon: Scale, desc: 'Terms of service' },
  { name: 'DMCA', href: '/page/dmca', icon: ShieldCheck, desc: 'Copyright policy' },
  { name: 'Advertise With Us', href: '/page/advertise-with-us', icon: Megaphone, desc: 'Advertising options' },
  { name: 'Sitemap', href: '/page/sitemap', icon: Globe, desc: 'Browse all pages' },
];

export function MegaMenu() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const externalLinks = [
    { name: 'App Download', href: settings.android_app_link || '#', icon: Download, desc: 'Get our Android app', external: true },
    { name: 'Telegram', href: settings.telegram_link || '#', icon: MessageCircle, desc: 'Join Telegram channel', external: true },
    { name: 'WhatsApp Channel', href: settings.whatsapp_link || '#', icon: MessageCircle, desc: 'Join WhatsApp channel', external: true },
  ];

  return (
    <div className="relative flex items-center">
      {categoryGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div
            key={group.label}
            className="relative inline-block"
            onMouseEnter={() => setActiveGroup(group.label)}
            onMouseLeave={() => setActiveGroup(null)}
          >
            <Link
              href={`/category/${group.items[0].slug}`}
              className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1"
            >
              <GroupIcon className="h-3.5 w-3.5" />
              {group.label}
            </Link>

            {activeGroup === group.label && (
              <div className="absolute top-full left-0 z-50 pt-1">
                <div className="bg-popover border rounded-xl shadow-xl w-[480px] p-4 animate-in fade-in-0 zoom-in-95 duration-100">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: group.color + '15' }}
                    >
                      <GroupIcon className="h-4 w-4" style={{ color: group.color }} />
                    </div>
                    <span className="font-semibold text-sm">{group.label}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">
                      {group.items.length} categories
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.slug}
                          href={`/category/${item.slug}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: group.color + '10' }}
                          >
                            <ItemIcon className="h-4 w-4" style={{ color: group.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.desc}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-1 ml-auto group-hover:text-primary transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pages dropdown */}
      <div
        className="relative inline-block"
        onMouseEnter={() => setActiveGroup('pages')}
        onMouseLeave={() => setActiveGroup(null)}
      >
        <button className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          Pages
        </button>

        {activeGroup === 'pages' && (
          <div className="absolute top-full right-0 z-50 pt-1">
            <div className="bg-popover border rounded-xl shadow-xl w-[520px] p-4 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-semibold text-sm">Pages & Links</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {pageLinks.length + externalLinks.length} links
                </Badge>
              </div>

              {/* Internal Pages */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {pageLinks.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-gray-50 dark:bg-gray-800">
                        <ItemIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* External Links */}
              <div className="pt-2 border-t">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Connect With Us</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {externalLinks.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/10">
                          <ItemIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-primary" />
                        </div>
                        <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
