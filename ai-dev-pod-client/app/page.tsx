'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { PromptInput } from '@/components/PromptInput';
import { OutputTabs } from '@/components/OutputTabs';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FileUpload } from '@/components/FileUpload';
import { useProject } from '@/hooks/useProject';

export default function Dashboard() {
  const {
    projectName,
    projectIdea,
    result,
    metrics,
    loading,
    error,
    downloadUrl,
    setProjectName,
    setProjectIdea,
    createProject,
    downloadProject,
  } = useProject();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleGenerateProject = async (name: string, idea: string) => {
    setProjectName(name);
    setProjectIdea(idea);
    
    try {
      await createProject({ projectName: name, projectIdea: idea });
      // Optionally fetch download link
      await downloadProject(name);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="space-y-6">
            <PromptInput
              onSubmit={handleGenerateProject}
              isLoading={loading}
              downloadUrl={downloadUrl}
              projectName={projectName}
            />
            <OutputTabs result={result} isLoading={loading} />
            <MetricsPanel metrics={metrics} isLoading={loading} />
          </div>
        );
      case 'metrics':
        return (
          <div className="space-y-6">
            <MetricsPanel metrics={metrics} isLoading={loading} />
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-center text-muted-foreground">
                Project history feature coming soon
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-center text-muted-foreground">
                Settings coming soon
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <PromptInput
              onSubmit={handleGenerateProject}
              isLoading={loading}
              downloadUrl={downloadUrl}
              projectName={projectName}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <FileUpload onFilesSelected={handleFilesSelected} />
              <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
                <h3 className="mb-4 text-xl font-bold text-foreground">
                  Recent Projects
                </h3>
                <p className="text-sm text-muted-foreground">
                  No projects yet. Generate your first project to get started!
                </p>
              </div>
            </div>
            <OutputTabs result={result} isLoading={loading} />
            <MetricsPanel metrics={metrics} isLoading={loading} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
