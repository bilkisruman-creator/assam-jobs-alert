'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Award, Search, MoreHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  Landmark,
  Shield,
  Bell,
  Building2,
  Banknote,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Jobs', href: '/category/latest-jobs', icon: Briefcase },
  { label: 'Results', href: '/category/results', icon: Award },
  { label: 'Search', href: '/search', icon: Search },
];

const moreItems = [
  { label: 'Admit Cards', href: '/category/admit-cards', icon: IdCard },
  { label: 'Admissions', href: '/category/admissions', icon: GraduationCap },
  { label: 'Scholarships', href: '/category/scholarships', icon: BookOpen },
  { label: 'Answer Keys', href: '/category/answer-keys', icon: FileCheck },
  { label: 'Syllabus', href: '/category/syllabus', icon: BookMarked },
  { label: 'Govt Jobs', href: '/category/government-jobs', icon: Landmark },
  { label: 'Defence', href: '/category/defence-jobs', icon: Shield },
  { label: 'Bank Jobs', href: '/category/bank-jobs', icon: Banknote },
  { label: 'Notifications', href: '/category/notifications', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();

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
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl">
            <SheetTitle className="sr-only">More Categories</SheetTitle>
            <div className="grid grid-cols-3 gap-3 py-4">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-accent transition-colors ${
                    pathname.startsWith(item.href) ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
