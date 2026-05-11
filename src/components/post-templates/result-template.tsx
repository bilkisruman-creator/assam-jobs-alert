'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, Globe, FileText } from 'lucide-react';
import { getLinkStyle, type Section, type ImportantLink } from './job-template';

interface ResultTemplateProps {
  content: string | null;
  importantLinks: ImportantLink[];
}

export function ResultTemplate({ content, importantLinks }: ResultTemplateProps) {
  let sections: Section[] = [];
  try {
    if (content) {
      const parsed = JSON.parse(content);
      sections = parsed.sections || [];
    }
  } catch {
    sections = [];
  }

  const resultLink = importantLinks.find((l) => l.linkType === 'result');
  const otherLinks = importantLinks.filter((l) => l.linkType !== 'result');

  return (
    <div className="space-y-4">
      {/* Result CTA */}
      {resultLink && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <h3 className="font-semibold text-lg">Result Declared!</h3>
            <p className="text-sm text-muted-foreground">Click the button below to check your result</p>
            <a href={resultLink.url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {resultLink.label}
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

      {/* Other Important Links */}
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
                    {link.linkType === 'website' ? <Globe className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
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
