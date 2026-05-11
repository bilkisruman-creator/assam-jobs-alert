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
import { ExternalLink, Download, Calendar, CreditCard } from 'lucide-react';
import { getLinkStyle, type Section, type ImportantDate, type ImportantLink } from './job-template';

interface AdmitCardTemplateProps {
  content: string | null;
  importantDates: ImportantDate[];
  importantLinks: ImportantLink[];
}

export function AdmitCardTemplate({ content, importantDates, importantLinks }: AdmitCardTemplateProps) {
  let sections: Section[] = [];
  try {
    if (content) {
      const parsed = JSON.parse(content);
      sections = parsed.sections || [];
    }
  } catch {
    sections = [];
  }

  const downloadLink = importantLinks.find((l) => l.linkType === 'download');
  const otherLinks = importantLinks.filter((l) => l.linkType !== 'download');

  return (
    <div className="space-y-4">
      {/* Download CTA */}
      {downloadLink && (
        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10">
          <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
            <CreditCard className="h-8 w-8 text-purple-600" />
            <h3 className="font-semibold text-lg">Admit Card Available</h3>
            <p className="text-sm text-muted-foreground">Download your admit card before the exam date</p>
            <a href={downloadLink.url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                <Download className="mr-2 h-4 w-4" />
                {downloadLink.label}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Content Sections */}
      {sections.map((section, i) => (
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
