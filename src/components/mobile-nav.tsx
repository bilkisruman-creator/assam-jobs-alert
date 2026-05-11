'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, GraduationCap, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronDown, Landmark, Building2, Users,
  Trophy, IdCard, BookOpen, FileCheck, BookMarked,
  Info, Mail, ShieldCheck, FileText, Megaphone,
  Scale, Globe, Download, MessageCircle, ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
  android_app_link?: string;
}

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Jobs', href: '/category/latest-jobs', icon: Briefcase },
  { label: 'Results', href: '/category/results', icon: Trophy },
  { label: 'Search', href: '/search', icon: Search },
];

const categoryGroups = [
  {
    label: 'Jobs', color: '#16a34a',
    items: [
      { label: 'Latest Jobs', href: '/category/latest-jobs', icon: Briefcase },
      { label: 'Assam Govt', href: '/category/assam-govt-jobs', icon: Landmark },
      { label: 'Central Govt', href: '/category/central-govt-jobs', icon: Building2 },
      { label: 'Private Jobs', href: '/category/private-jobs', icon: Briefcase },
      { label: 'Walk-in', href: '/category/walk-in-interviews', icon: Users },
    ],
  },
  {
    label: 'Education', color: '#0891b2',
    items: [
      { label: 'Results', href: '/category/results', icon: Trophy },
      { label: 'Admit Cards', href: '/category/admit-cards', icon: IdCard },
      { label: 'Admissions', href: '/category/admissions', icon: GraduationCap },
      { label: 'Scholarships', href: '/category/scholarships', icon: BookOpen },
      { label: 'Syllabus', href: '/category/syllabus', icon: BookMarked },
      { label: 'Answer Key', href: '/category/answer-key', icon: FileCheck },
    ],
  },
];

const pageLinks = [
  { label: 'About Us', href: '/page/about-us', icon: Info, external: false },
  { label: 'Contact Us', href: '/page/contact-us', icon: Mail, external: false },
  { label: 'Privacy Policy', href: '/page/privacy-policy', icon: ShieldCheck, external: false },
  { label: 'Disclaimer', href: '/page/disclaimer', icon: FileText, external: false },
  { label: 'Terms & Conditions', href: '/page/terms-and-conditions', icon: Scale, external: false },
  { label: 'DMCA', href: '/page/dmca', icon: ShieldCheck, external: false },
  { label: 'Advertise', href: '/page/advertise-with-us', icon: Megaphone, external: false },
  { label: 'Sitemap', href: '/page/sitemap', icon: Globe, external: false },
];

export function MobileNav() {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Jobs');
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const externalLinks = [
    { label: 'App Download', href: settings.android_app_link || '#', icon: Download },
    { label: 'Telegram', href: settings.telegram_link || '#', icon: MessageCircle },
    { label: 'WhatsApp', href: settings.whatsapp_link || '#', icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[56px] transition-colors ${
                isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[56px] text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl max-h-[75vh] overflow-y-auto">
            <SheetTitle className="sr-only">More Categories</SheetTitle>
            <div className="py-2">
              {categoryGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                    onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                  >
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: group.color + '15' }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                    </div>
                    {group.label}
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedGroup === group.label && (
                    <div className="grid grid-cols-3 gap-2 px-3 pb-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-accent transition-colors ${
                              pathname.startsWith(item.href) ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''
                            }`}
                          >
                            <ItemIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Pages Section */}
              <div className="mt-2 pt-2 border-t">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                  onClick={() => setExpandedGroup(expandedGroup === 'Pages' ? null : 'Pages')}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Info className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                  </div>
                  Pages
                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${expandedGroup === 'Pages' ? 'rotate-180' : ''}`} />
                </button>
                {expandedGroup === 'Pages' && (
                  <>
                    <div className="grid grid-cols-4 gap-2 px-3 pb-2">
                      {pageLinks.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                          >
                            <ItemIcon className="h-5 w-5" />
                            <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    {/* External Links */}
                    <div className="px-3 pb-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connect</p>
                      <div className="grid grid-cols-3 gap-2">
                        {externalLinks.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <a
                              key={item.label}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                            >
                              <ItemIcon className="h-5 w-5" />
                              <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
