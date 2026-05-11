'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchModal } from '@/components/search-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Menu,
  ChevronDown,
  Briefcase,
  Award,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  Building2,
  Trophy,
  Landmark,
  Shield,
  Bell,
} from 'lucide-react';

const navItems = [
  { label: 'Latest Jobs', href: '/category/latest-jobs', icon: Briefcase },
  { label: 'Results', href: '/category/results', icon: Award },
  { label: 'Admit Cards', href: '/category/admit-cards', icon: IdCard },
  { label: 'Admissions', href: '/category/admissions', icon: GraduationCap },
  { label: 'Scholarships', href: '/category/scholarships', icon: BookOpen },
];

const moreItems = [
  { label: 'Answer Keys', href: '/category/answer-keys', icon: FileCheck },
  { label: 'Syllabus', href: '/category/syllabus', icon: BookMarked },
  { label: 'Govt Jobs', href: '/category/government-jobs', icon: Landmark },
  { label: 'Defence Jobs', href: '/category/defence-jobs', icon: Shield },
  { label: 'Bank Jobs', href: '/category/bank-jobs', icon: Building2 },
  { label: 'Notifications', href: '/category/notifications', icon: Bell },
];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5 text-white" />
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

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    More <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreItems.map((item, i) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
                <SheetContent side="right" className="w-72">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col gap-1 mt-4">
                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent font-medium" onClick={() => setMobileOpen(false)}>
                      Home
                    </Link>
                    {[...navItems, ...moreItems].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent ${
                          pathname === item.href ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium' : ''
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
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
