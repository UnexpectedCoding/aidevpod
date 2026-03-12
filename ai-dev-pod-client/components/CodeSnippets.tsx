'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CodeTemplate } from '@/lib/codeGenerator';

interface CodeSnippetsProps {
  templates: CodeTemplate[];
  projectName: string;
}

const languageColors: Record<string, string> = {
  typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  html: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  css: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  sql: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
};

export function CodeSnippets({ templates, projectName }: CodeSnippetsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">
          Starter Code for {projectName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ready-to-use code templates to bootstrap your project
        </p>
      </div>

      <div className="space-y-4">
        {templates.map((template, index) => {
          const colorClass = languageColors[template.language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
          const templateId = `${template.language}-${index}`;

          return (
            <div key={templateId} className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${colorClass}`}>
                      {template.language.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {template.filename}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 ml-4"
                  onClick={() => handleCopyCode(template.code, templateId)}
                >
                  {copiedId === templateId ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-background">
                <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                  <code>{template.code}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg border border-dashed border-muted-foreground/50 bg-muted/20">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> These are starting templates. Customize them according to your specific project requirements and coding style.
        </p>
      </div>
    </Card>
  );
}
