'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Award,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  Building2,
  Trophy,
  CreditCard,
  Landmark,
  Shield,
  Banknote,
  Bell,
  Brain,
  Users,
  Building,
  CheckCircle,
  Calendar,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Award,
  IdCard,
  GraduationCap,
  BookOpen,
  FileCheck,
  BookMarked,
  Building2,
  Trophy,
  CreditCard,
  Landmark,
  Shield,
  Banknote,
  Bell,
  Brain,
  Users,
  Building,
  CheckCircle,
  Calendar,
};

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  postCount: number;
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <>
      {/* Mobile: Horizontal scrollable pills */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => {
            const IconComponent = (cat.icon && iconMap[cat.icon]) || Briefcase;
            const color = cat.color || '#16a34a';

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border/50 bg-card hover:bg-accent transition-colors shrink-0 whitespace-nowrap group"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + '15' }}
                >
                  <IconComponent className="h-3 w-3" style={{ color }} />
                </div>
                <span className="text-xs font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded-full">
                  {cat.postCount}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: Compact 2-row grid */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-2">
          {categories.map((cat) => {
            const IconComponent = (cat.icon && iconMap[cat.icon]) || Briefcase;
            const color = cat.color || '#16a34a';

            return (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/50 hover:border-green-200 dark:hover:border-green-800 hover:shadow-sm transition-all hover:-translate-y-0.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: color + '15' }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {cat.postCount} posts
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
