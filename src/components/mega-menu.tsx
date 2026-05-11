'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Award, IdCard, GraduationCap, BookOpen, FileCheck,
  BookMarked, Landmark, Shield, Building2, Bell, Banknote,
  Calendar, Trophy, Users, ChevronRight, MapPin, TrendingUp,
} from 'lucide-react';

const menuGroups = [
  {
    label: 'Jobs',
    icon: Briefcase,
    color: '#16a34a',
    items: [
      { name: 'Latest Jobs', slug: 'latest-jobs', icon: Briefcase, desc: 'All new job notifications' },
      { name: 'Assam Govt Jobs', slug: 'assam-govt-jobs', icon: Landmark, desc: 'State government jobs' },
      { name: 'Central Govt Jobs', slug: 'central-govt-jobs', icon: Building2, desc: 'Central government jobs' },
      { name: 'Defence Jobs', slug: 'defence-jobs', icon: Shield, desc: 'Army, Navy, Air Force' },
      { name: 'Bank Jobs', slug: 'bank-jobs', icon: Banknote, desc: 'Banking sector jobs' },
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
      { name: 'Answer Keys', slug: 'answer-keys', icon: FileCheck, desc: 'Exam answer keys' },
      { name: 'Syllabus', slug: 'syllabus', icon: BookMarked, desc: 'Exam syllabus & pattern' },
    ],
  },
  {
    label: 'More',
    icon: Bell,
    color: '#ea580c',
    items: [
      { name: 'Notifications', slug: 'notifications', icon: Bell, desc: 'Important notifications' },
      { name: 'Important Dates', slug: 'important-dates', icon: Calendar, desc: 'Key dates & deadlines' },
      { name: 'Exam Preparation', slug: 'exam-preparation', icon: TrendingUp, desc: 'Study materials & tips' },
    ],
  },
];

export function MegaMenu() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <div className="relative">
      {menuGroups.map((group) => {
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
    </div>
  );
}
