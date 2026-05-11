'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Calendar, Link2, FileText, Globe } from 'lucide-react';

interface ImportantDate {
  label: string;
  date: string;
}

interface ImportantLink {
  label: string;
  url: string;
  linkType: string;
}

interface Section {
  title: string;
  content: string;
}

interface JobTemplateProps {
  content: string | null;
  importantDates: ImportantDate[];
  importantLinks: ImportantLink[];
}

function getLinkIcon(linkType: string) {
  switch (linkType) {
    case 'apply': return <ExternalLink className="h-4 w-4" />;
    case 'notification': return <FileText className="h-4 w-4" />;
    case 'website': return <Globe className="h-4 w-4" />;
    default: return <Link2 className="h-4 w-4" />;
  }
}

function getLinkStyle(linkType: string): string {
  switch (linkType) {
    case 'apply': return 'bg-green-600 hover:bg-green-700 text-white';
    case 'notification': return 'bg-sky-600 hover:bg-sky-700 text-white';
    case 'website': return 'bg-gray-600 hover:bg-gray-700 text-white';
    case 'download': return 'bg-purple-600 hover:bg-purple-700 text-white';
    case 'result': return 'bg-green-600 hover:bg-green-700 text-white';
    case 'gazette': return 'bg-orange-600 hover:bg-orange-700 text-white';
    default: return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
}

export function JobTemplate({ content, importantDates, importantLinks }: JobTemplateProps) {
  let sections: Section[] = [];
  try {
    if (content) {
      const parsed = JSON.parse(content);
      sections = parsed.sections || [];
    }
  } catch {
    sections = [];
  }

  return (
    <div className="space-y-4">
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

      {/* Important Links */}
      {importantLinks.length > 0 && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4 text-green-600" />
              Important Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {importantLinks.map((link) => (
                <a
                  key={link.linkType}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className={`w-full justify-start ${getLinkStyle(link.linkType)}`}>
                    {getLinkIcon(link.linkType)}
                    <span className="ml-2">{link.label}</span>
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

// Re-export helper functions for other templates
export { getLinkIcon, getLinkStyle };
export type { Section, ImportantDate, ImportantLink };
