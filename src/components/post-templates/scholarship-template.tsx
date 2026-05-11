'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, BookOpen, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { getLinkStyle, type Section, type ImportantDate, type ImportantLink } from './job-template';

interface ScholarshipTemplateProps {
  content: string | null;
  importantDates: ImportantDate[];
  importantLinks: ImportantLink[];
}

export function ScholarshipTemplate({ content, importantDates, importantLinks }: ScholarshipTemplateProps) {
  let sections: Section[] = [];
  try {
    if (content) {
      const parsed = JSON.parse(content);
      sections = parsed.sections || [];
    }
  } catch {
    sections = [];
  }

  const applyLink = importantLinks.find((l) => l.linkType === 'apply');
  const otherLinks = importantLinks.filter((l) => l.linkType !== 'apply');

  // Separate sections for special display
  const eligibilitySection = sections.find((s) => s.title.toLowerCase().includes('eligib'));
  const benefitsSection = sections.find((s) => s.title.toLowerCase().includes('benefit'));
  const otherSections = sections.filter(
    (s) => s !== eligibilitySection && s !== benefitsSection
  );

  return (
    <div className="space-y-4">
      {/* Apply CTA */}
      {applyLink && (
        <Card className="border-pink-200 dark:border-pink-900 bg-pink-50/50 dark:bg-pink-900/10">
          <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
            <BookOpen className="h-8 w-8 text-pink-600" />
            <h3 className="font-semibold text-lg">Apply for Scholarship</h3>
            <p className="text-sm text-muted-foreground">Don&apos;t miss this opportunity</p>
            <a href={applyLink.url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                <ExternalLink className="mr-2 h-4 w-4" />
                {applyLink.label}
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Eligibility */}
      {eligibilitySection && (
        <Card className="border-sky-200 dark:border-sky-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              {eligibilitySection.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {eligibilitySection.content}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {benefitsSection && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {benefitsSection.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {benefitsSection.content}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other sections */}
      {otherSections.map((section, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {section.content}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Important Dates */}
      {importantDates.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importantDates.map((date) => (
                  <TableRow key={date.label}>
                    <TableCell className="font-medium text-sm">{date.label}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="secondary" className="font-normal bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        {new Date(date.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Other Links */}
      {otherLinks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Other Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherLinks.map((link) => (
                <a key={link.linkType} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Button className={`w-full justify-start ${getLinkStyle(link.linkType)}`}>
                    {link.label}
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </Button>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
