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
  ChevronDown, Landmark, Shield, Building2, Banknote, Users,
  Trophy, IdCard, BookOpen, FileCheck, BookMarked, Bell,
  Calendar, TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Jobs', href: '/category/latest-jobs', icon: Briefcase },
  { label: 'Results', href: '/category/results', icon: Trophy },
  { label: 'Search', href: '/search', icon: Search },
];

const mobileGroups = [
  {
    label: 'Jobs', color: '#16a34a',
    items: [
      { label: 'Latest Jobs', href: '/category/latest-jobs', icon: Briefcase },
      { label: 'Assam Govt', href: '/category/assam-govt-jobs', icon: Landmark },
      { label: 'Central Govt', href: '/category/central-govt-jobs', icon: Building2 },
      { label: 'Defence', href: '/category/defence-jobs', icon: Shield },
      { label: 'Bank Jobs', href: '/category/bank-jobs', icon: Banknote },
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
      { label: 'Answer Keys', href: '/category/answer-keys', icon: FileCheck },
      { label: 'Syllabus', href: '/category/syllabus', icon: BookMarked },
    ],
  },
  {
    label: 'More', color: '#ea580c',
    items: [
      { label: 'Notifications', href: '/category/notifications', icon: Bell },
      { label: 'Important Dates', href: '/category/important-dates', icon: Calendar },
      { label: 'Exam Prep', href: '/category/exam-preparation', icon: TrendingUp },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Jobs');

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
          <SheetContent side="bottom" className="h-auto rounded-t-xl max-h-[70vh] overflow-y-auto">
            <SheetTitle className="sr-only">More Categories</SheetTitle>
            <div className="py-2">
              {mobileGroups.map((group) => (
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
