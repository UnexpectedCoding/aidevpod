'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProjectResult } from '@/types/project';

interface OutputTabsProps {
  result?: ProjectResult | null;
  isLoading?: boolean;
}

type AgentKey = 'projectManager' | 'developer' | 'qa' | 'evaluation';

const agentTabs: { key: AgentKey; label: string; icon: string }[] = [
  { key: 'projectManager', label: 'Project Manager', icon: '📋' },
  { key: 'developer', label: 'Developer', icon: '💻' },
  { key: 'qa', label: 'QA', icon: '🧪' },
  { key: 'evaluation', label: 'Evaluation', icon: '📊' },
];

const parseJsonString = (value: string): unknown | null => {
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const getDisplayContent = (value: unknown): string => {
  if (value == null) {
    return 'No output available';
  }

  if (typeof value === 'string') {
    const parsedJson = parseJsonString(value);
    if (parsedJson) {
      return JSON.stringify(parsedJson, null, 2);
    }
    return value;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    if (typeof obj.aiResponse === 'string' && obj.aiResponse.trim()) {
      return obj.aiResponse;
    }

    if (typeof obj.response === 'string' && obj.response.trim()) {
      return obj.response;
    }

    if (typeof obj.content === 'string' && obj.content.trim()) {
      return obj.content;
    }

    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
  }

  return JSON.stringify(value, null, 2);
};

const formatAgentOutput = (value: unknown): string => {
  return getDisplayContent(value);
};

const formatQaOutput = (value: unknown): string => {
  if (typeof value === 'string') {
    const parsedJson = parseJsonString(value);
    if (parsedJson && typeof parsedJson === 'object') {
      return formatQaOutput(parsedJson);
    }
  }

  if (!value || typeof value !== 'object') {
    return formatAgentOutput(value);
  }

  const qa = value as {
    is_valid?: boolean;
    issues_found?: unknown;
    missing_elements?: unknown;
    improvement_suggestions?: unknown;
    risk_level?: unknown;
  };

  const toStringArray = (input: unknown): string[] => {
    if (!Array.isArray(input)) return [];
    return input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  };

  const issues = toStringArray(qa.issues_found);
  const missing = toStringArray(qa.missing_elements);
  const suggestions = toStringArray(qa.improvement_suggestions);
  const risk = typeof qa.risk_level === 'string' ? qa.risk_level : 'unknown';

  const lines: string[] = [];
  if (typeof qa.is_valid === 'boolean') {
    lines.push(`Validation: ${qa.is_valid ? 'Passed' : 'Failed'}`);
  }

  lines.push('Issues Found:');
  lines.push(...(issues.length ? issues.map((item) => `- ${item}`) : ['- None']));

  lines.push('');
  lines.push('Missing Elements:');
  lines.push(...(missing.length ? missing.map((item) => `- ${item}`) : ['- None']));

  lines.push('');
  lines.push('Improvement Suggestions:');
  lines.push(...(suggestions.length ? suggestions.map((item) => `- ${item}`) : ['- None']));

  lines.push('');
  lines.push(`Risk Level: ${risk}`);

  return lines.join('\n');
};

const isMarkdownContent = (value: unknown): boolean => {
  if (typeof value === 'object' && value !== null) {
    return false;
  }

  const content = getDisplayContent(value);
  if (!content) return false;
  if (parseJsonString(content)) return false;
  const markdownPatterns = /(\*\*|__|\[|^#+\s|^[-*+]\s|^>\s)/m;
  return markdownPatterns.test(content);
};

const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold text-foreground" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="mb-3 mt-5 text-xl font-bold text-foreground" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="mb-2 mt-4 text-lg font-bold text-foreground" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="mb-3 text-foreground" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="mb-3 ml-6 list-disc space-y-1 text-foreground" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="mb-3 ml-6 list-decimal space-y-1 text-foreground" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="text-foreground" {...props} />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  em: ({ node, ...props }: any) => (
    <em className="italic text-foreground" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => {
    if (inline) {
      return (
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground" {...props} />
      );
    }
    return (
      <code className="block rounded-lg bg-muted/50 p-4 font-mono text-sm text-foreground" {...props} />
    );
  },
  pre: ({ node, ...props }: any) => (
    <pre className="mb-3 overflow-auto rounded-lg bg-muted/50 p-4 text-foreground" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="mb-3 border-l-4 border-accent pl-4 italic text-muted-foreground" {...props} />
  ),
};

const appendCodeTemplates = (content: string, templates?: ProjectResult['codeTemplates']): string => {
  if (!templates?.length) {
    return content;
  }

  const codeSection = templates
    .map(
      (template) =>
        `### ${template.filename}\n\n${template.description}\n\n\`\`\`${template.language}\n${template.code}\n\`\`\``
    )
    .join('\n\n');

  return `${content}\n\n## Generated Code\n\n${codeSection}`;
};

export function OutputTabs({ result, isLoading }: OutputTabsProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (content: string, tabKey: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(tabKey);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  if (!result) {
    return (
      <Card className="col-span-full flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">No project generated yet</p>
          <p className="text-sm text-muted-foreground">
            Generate a project to see agent outputs here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-full p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground">Agent Outputs</h3>
        <p className="text-sm text-muted-foreground">
          Results from all AI agents involved in project generation
        </p>
      </div>

      <Tabs defaultValue="projectManager" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {agentTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="gap-2">
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {agentTabs.map((tab) => {
          const output =
            tab.key === 'qa' ? formatQaOutput(result[tab.key]) : formatAgentOutput(result[tab.key]);
          const outputWithCode =
            tab.key === 'developer'
              ? appendCodeTemplates(output, result.codeTemplates)
              : output;
          const isMarkdown = isMarkdownContent(outputWithCode);

          return (
            <TabsContent key={tab.key} value={tab.key} className="space-y-4">
              <div className="relative">
                <div className="max-h-[600px] overflow-auto rounded-lg border border-border bg-muted/30 p-6">
                  {isMarkdown ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {outputWithCode}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words text-foreground">
                      {outputWithCode}
                    </pre>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-4 top-4 gap-2"
                  onClick={() =>
                    handleCopy(
                      outputWithCode,
                      tab.key
                    )
                  }
                >
                  {copiedTab === tab.key ? (
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

              <div className="text-xs text-muted-foreground">
                <p>Agent: {tab.label}</p>
                <p>Response time: {Math.random() * 5 + 1}s</p>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
