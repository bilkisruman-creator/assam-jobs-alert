'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchModal } from '@/components/search-modal';
import { MegaMenu } from '@/components/mega-menu';
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
  GraduationCap,
  Home,
  ChevronDown,
  Landmark,
  Building2,
  Users,
  Trophy,
  IdCard,
  BookOpen,
  FileCheck,
  BookMarked,
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
      { name: 'Latest Jobs', slug: 'latest-jobs', icon: Briefcase },
      { name: 'Assam Govt Jobs', slug: 'assam-govt-jobs', icon: Landmark },
      { name: 'Central Govt Jobs', slug: 'central-govt-jobs', icon: Building2 },
      { name: 'Private Jobs', slug: 'private-jobs', icon: Briefcase },
      { name: 'Walk-in Interviews', slug: 'walk-in-interviews', icon: Users },
    ],
  },
  {
    label: 'Education',
    icon: GraduationCap,
    color: '#0891b2',
    items: [
      { name: 'Results', slug: 'results', icon: Trophy },
      { name: 'Admit Cards', slug: 'admit-cards', icon: IdCard },
      { name: 'Admissions', slug: 'admissions', icon: GraduationCap },
      { name: 'Scholarships', slug: 'scholarships', icon: BookOpen },
      { name: 'Syllabus', slug: 'syllabus', icon: BookMarked },
      { name: 'Answer Key', slug: 'answer-key', icon: FileCheck },
    ],
  },
];

const pageLinks = [
  { name: 'About Us', href: '/page/about-us', icon: Info, external: false },
  { name: 'Contact Us', href: '/page/contact-us', icon: Mail, external: false },
  { name: 'Privacy Policy', href: '/page/privacy-policy', icon: ShieldCheck, external: false },
  { name: 'Disclaimer', href: '/page/disclaimer', icon: FileText, external: false },
  { name: 'Terms & Conditions', href: '/page/terms-and-conditions', icon: Scale, external: false },
  { name: 'DMCA', href: '/page/dmca', icon: ShieldCheck, external: false },
  { name: 'Advertise With Us', href: '/page/advertise-with-us', icon: Megaphone, external: false },
  { name: 'Sitemap', href: '/page/sitemap', icon: Globe, external: false },
];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Jobs');
  const [settings, setSettings] = useState<Settings>({});
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const externalLinks = [
    { name: 'App Download', href: settings.android_app_link || '#', icon: Download },
    { name: 'Telegram', href: settings.telegram_link || '#', icon: MessageCircle },
    { name: 'WhatsApp Channel', href: settings.whatsapp_link || '#', icon: MessageCircle },
  ];

  return (
    <>
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg leading-tight text-green-700 dark:text-green-500">
                  Assam Jobs Alert
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                  Govt Jobs & Education Portal
                </span>
              </div>
            </Link>

            {/* Desktop Nav with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === '/'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Home className="h-3.5 w-3.5 inline mr-1" />
                Home
              </Link>
              <MegaMenu />
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
              <ThemeToggle />

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
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
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Assam Jobs Alert</p>
                          <p className="text-[10px] text-green-100">Navigate to</p>
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

                    {/* Category groups + Pages */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
                      {categoryGroups.map((group) => {
                        const GroupIcon = group.icon;
                        const isExpanded = expandedGroup === group.label;

                        return (
                          <div key={group.label} className="mb-1">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm font-semibold"
                              onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                            >
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: group.color + '15' }}
                              >
                                <GroupIcon className="h-3.5 w-3.5" style={{ color: group.color }} />
                              </div>
                              {group.label}
                              <ChevronDown
                                className={`h-4 w-4 ml-auto transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {isExpanded && (
                              <div className="ml-3 pl-3 border-l-2 space-y-0.5 mt-0.5" style={{ borderColor: group.color + '30' }}>
                                {group.items.map((item) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <Link
                                      key={item.slug}
                                      href={`/category/${item.slug}`}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent ${
                                        pathname === `/category/${item.slug}`
                                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 font-medium'
                                          : 'text-muted-foreground'
                                      }`}
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      <ItemIcon className="h-4 w-4" />
                                      {item.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Pages Section */}
                      <div className="mt-2 pt-2 border-t">
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm font-semibold"
                          onClick={() => setExpandedGroup(expandedGroup === 'Pages' ? null : 'Pages')}
                        >
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <Info className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </div>
                          Pages
                          <ChevronDown
                            className={`h-4 w-4 ml-auto transition-transform ${
                              expandedGroup === 'Pages' ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedGroup === 'Pages' && (
                          <div className="ml-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-0.5 mt-0.5">
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

                            {/* External links divider */}
                            <div className="pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                              <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Connect</p>
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
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
