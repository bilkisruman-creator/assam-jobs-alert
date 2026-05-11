'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {categories.map((cat) => {
        const IconComponent = (cat.icon && iconMap[cat.icon]) || Briefcase;
        const color = cat.color || '#16a34a';

        return (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50 overflow-hidden">
              <div className="h-1" style={{ backgroundColor: color }} />
              <CardContent className="p-3 text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors"
                  style={{ backgroundColor: color + '15' }}
                >
                  <IconComponent className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.postCount} posts
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
