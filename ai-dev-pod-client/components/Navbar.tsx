'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-2">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FlexAI</h1>
            <p className="text-xs text-muted-foreground">
              Multi-Agent AI Software Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Ollama Connected</span>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Status: Ready
          </Badge>
        </div>
      </div>
    </nav>
  );
}
