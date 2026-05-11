'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Search, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Trophy, IdCard, GraduationCap, BookOpen, FileCheck, BookMarked,
  Landmark, Building2, Shield,
  Info, Mail, ShieldCheck, FileText, Megaphone,
  Scale, Globe, Download, MessageCircle, ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
  android_app_link?: string;
}

const bottomNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Jobs', href: '/category/latest-jobs', icon: Briefcase },
  { label: 'Results', href: '/category/results', icon: Trophy },
  { label: 'Search', href: '/search', icon: Search },
];

const categoryPills = [
  { name: 'Latest Jobs', slug: 'latest-jobs', color: '#16a34a', icon: Briefcase },
  { name: 'Results', slug: 'results', color: '#dc2626', icon: Trophy },
  { name: 'Admit Cards', slug: 'admit-cards', color: '#7c3aed', icon: IdCard },
  { name: 'Admissions', slug: 'admissions', color: '#0891b2', icon: GraduationCap },
  { name: 'Scholarships', slug: 'scholarships', color: '#db2777', icon: BookOpen },
  { name: 'Assam Govt', slug: 'assam-govt-jobs', color: '#0d9488', icon: Landmark },
  { name: 'Central Govt', slug: 'central-govt-jobs', color: '#1d4ed8', icon: Building2 },
  { name: 'Defence', slug: 'defence-jobs', color: '#b45309', icon: Shield },
  { name: 'Bank Jobs', slug: 'bank-jobs', color: '#c026d3', icon: Landmark },
  { name: 'Private Jobs', slug: 'private-jobs', color: '#be185d', icon: Briefcase },
  { name: 'Syllabus', slug: 'syllabus', color: '#6d28d9', icon: BookMarked },
  { name: 'Answer Key', slug: 'answer-key', color: '#059669', icon: FileCheck },
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
        {bottomNavItems.map((item) => {
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
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <SheetTitle className="sr-only">More Categories</SheetTitle>
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Category Pills Grid */}
            <div className="px-4 pt-2 pb-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Browse Categories</p>
              <div className="flex flex-wrap gap-2">
                {categoryPills.map((cat) => {
                  const isActive = pathname === `/category/${cat.slug}`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                        isActive
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-background border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-accent'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: cat.color, borderColor: cat.color, boxShadow: `0 1px 3px ${cat.color}30` }
                          : undefined
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white/80' : ''}`}
                        style={!isActive ? { backgroundColor: cat.color } : undefined}
                      />
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pages */}
            <div className="px-4 pt-2 pb-3 border-t">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Links</p>
              <div className="grid grid-cols-4 gap-2">
                {pageLinks.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                    >
                      <ItemIcon className="h-4 w-4" />
                      <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* External Links */}
            <div className="px-4 pt-2 pb-4 border-t">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Connect With Us</p>
              <div className="grid grid-cols-3 gap-2">
                {externalLinks.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                    >
                      <ItemIcon className="h-4 w-4" />
                      <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
