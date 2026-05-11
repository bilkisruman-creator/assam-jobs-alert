'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchModal } from '@/components/search-modal';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Menu,
  Briefcase,
  Home,
  Info,
  Mail,
  ShieldCheck,
  FileText,
  Megaphone,
  Scale,
  Globe,
  Download,
  MessageCircle,
  ExternalLink,
  Trophy,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  Landmark,
  Building2,
  Shield,
  Landmark as Bank,
  ChevronRight,
} from 'lucide-react';

interface Settings {
  telegram_link?: string;
  whatsapp_link?: string;
  android_app_link?: string;
  logo_url?: string;
}

const categoryPills = [
  { name: 'Latest Jobs', slug: 'latest-jobs', color: '#16a34a', icon: Briefcase },
  { name: 'Results', slug: 'results', color: '#dc2626', icon: Trophy },
  { name: 'Admit Cards', slug: 'admit-cards', color: '#7c3aed', icon: IdCard },
  { name: 'Admissions', slug: 'admissions', color: '#0891b2', icon: GraduationCap },
  { name: 'Scholarships', slug: 'scholarships', color: '#db2777', icon: BookOpen },
  { name: 'Assam Govt', slug: 'assam-govt-jobs', color: '#0d9488', icon: Landmark },
  { name: 'Central Govt', slug: 'central-govt-jobs', color: '#1d4ed8', icon: Building2 },
  { name: 'Defence', slug: 'defence-jobs', color: '#b45309', icon: Shield },
  { name: 'Bank Jobs', slug: 'bank-jobs', color: '#c026d3', icon: Bank },
  { name: 'Private Jobs', slug: 'private-jobs', color: '#be185d', icon: Briefcase },
  { name: 'Syllabus', slug: 'syllabus', color: '#6d28d9', icon: BookMarked },
  { name: 'Answer Key', slug: 'answer-key', color: '#059669', icon: FileCheck },
];

const pageLinks = [
  { name: 'About Us', href: '/page/about-us', icon: Info },
  { name: 'Contact Us', href: '/page/contact-us', icon: Mail },
  { name: 'Privacy Policy', href: '/page/privacy-policy', icon: ShieldCheck },
  { name: 'Disclaimer', href: '/page/disclaimer', icon: FileText },
  { name: 'Terms & Conditions', href: '/page/terms-and-conditions', icon: Scale },
  { name: 'DMCA', href: '/page/dmca', icon: ShieldCheck },
  { name: 'Advertise With Us', href: '/page/advertise-with-us', icon: Megaphone },
  { name: 'Sitemap', href: '/page/sitemap', icon: Globe },
];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({});
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  // Auto-scroll to active category on mobile
  useEffect(() => {
    if (scrollRef.current) {
      const activePill = scrollRef.current.querySelector('[data-active="true"]');
      if (activePill) {
        activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [pathname]);

  const externalLinks = [
    { name: 'App Download', href: settings.android_app_link || '#', icon: Download },
    { name: 'Telegram', href: settings.telegram_link || '#', icon: MessageCircle },
    { name: 'WhatsApp Channel', href: settings.whatsapp_link || '#', icon: MessageCircle },
  ];

  const getCategoryUrl = (slug: string) => `/category/${slug}`;

  return (
    <>
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        {/* Top Row: Logo + Actions */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-13 md:h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Assam Jobs Alert"
                    className="h-8 md:h-9 w-auto object-contain"
                  />
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm md:text-base leading-tight text-green-700 dark:text-green-500">
                        Assam Jobs Alert
                      </span>
                      <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">
                        Govt Jobs & Education Portal
                      </span>
                    </div>
                  </>
                )}
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
                <ThemeToggle />

                {/* Mobile menu */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex flex-col h-full">
                      {/* Mobile header */}
                      <div className="p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
                        <div className="flex items-center gap-2">
                          {settings.logo_url ? (
                            <img
                              src={settings.logo_url}
                              alt="Assam Jobs Alert"
                              className="h-8 w-auto object-contain brightness-0 invert"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm">Assam Jobs Alert</p>
                            <p className="text-[10px] text-green-100">Quick Links & More</p>
                          </div>
                        </div>
                      </div>

                      {/* Home link */}
                      <div className="p-2">
                        <Link
                          href="/"
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent font-medium text-sm ${
                            pathname === '/' ? 'bg-green-50 text-green-700 dark:bg-green-900/30' : ''
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          Home
                        </Link>
                      </div>

                      {/* All Categories */}
                      <div className="px-2 pt-1 pb-2">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categories</p>
                        <div className="grid grid-cols-2 gap-1">
                          {categoryPills.map((cat) => {
                            const isActive = pathname === getCategoryUrl(cat.slug);
                            return (
                              <Link
                                key={cat.slug}
                                href={getCategoryUrl(cat.slug)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isActive
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 font-medium'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                                onClick={() => setMobileOpen(false)}
                              >
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pages Section */}
                      <div className="px-2 pt-2 border-t">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pages</p>
                        <div className="space-y-0.5">
                          {pageLinks.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent"
                                onClick={() => setMobileOpen(false)}
                              >
                                <ItemIcon className="h-4 w-4" />
                                {item.name}
                              </Link>
                            );
                            })}
                        </div>
                      </div>

                      {/* External Links */}
                      <div className="px-2 pt-2 mt-auto border-t">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connect</p>
                        <div className="space-y-0.5 pb-4">
                          {externalLinks.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent"
                                onClick={() => setMobileOpen(false)}
                              >
                                <ItemIcon className="h-4 w-4" />
                                {item.name}
                                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Navigation Bar */}
        <div className="border-b border-border/30 bg-background/60">
          <div className="max-w-7xl mx-auto">
            <div
              ref={scrollRef}
              className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Home pill */}
              <Link
                href="/"
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                  pathname === '/'
                    ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-200 dark:shadow-green-900/30'
                    : 'bg-background border-border/60 text-muted-foreground hover:border-green-300 hover:text-green-700 dark:hover:border-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>

              {/* Divider */}
              <div className="shrink-0 w-px h-5 bg-border/50 mx-0.5" />

              {/* Category Pills */}
              {categoryPills.map((cat) => {
                const isActive = pathname === getCategoryUrl(cat.slug);
                return (
                  <Link
                    key={cat.slug}
                    href={getCategoryUrl(cat.slug)}
                    data-active={isActive ? 'true' : undefined}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
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
                      className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                        isActive ? 'bg-white/80' : ''
                      }`}
                      style={!isActive ? { backgroundColor: cat.color } : undefined}
                    />
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
