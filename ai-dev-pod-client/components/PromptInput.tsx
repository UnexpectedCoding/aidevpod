'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Download, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PromptInputProps {
  onSubmit: (projectName: string, projectIdea: string) => Promise<void>;
  isLoading?: boolean;
  downloadUrl?: string | null;
  projectName?: string;
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  downloadUrl,
  projectName,
}: PromptInputProps) {
  const [name, setName] = useState('');
  const [idea, setIdea] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !idea.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      toast.loading('Starting project generation...');
      await onSubmit(name, idea);
      toast.success('Project generated successfully!');
      setName('');
      setIdea('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate project';
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${projectName || 'project'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  return (
    <Card className="col-span-full p-6 md:col-span-2">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Generate New Project</h2>
        <p className="text-sm text-muted-foreground">
          Describe your project idea and let our AI agents generate a complete application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="e.g., Task Management App"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-idea">Project Idea</Label>
          <Textarea
            id="project-idea"
            placeholder="Describe your project idea, features, and requirements..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={isLoading}
            rows={6}
            className="resize-none bg-background/50"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Project
              </>
            )}
          </Button>

          {downloadUrl && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Project
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
