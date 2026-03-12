'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Metrics } from '@/types/project';
import {
  Clock,
  Zap,
  FileCode,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MetricsPanelProps {
  metrics?: Metrics | null;
  isLoading?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  isLoading?: boolean;
}

function MetricCard({ icon, label, value, unit, isLoading }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      )}
    </Card>
  );
}

export function MetricsPanel({ metrics, isLoading }: MetricsPanelProps) {
  const defaultMetrics: Metrics = {
    responseTime: 0,
    agentsCalled: 0,
    filesGenerated: 0,
    status: 'pending',
  };

  const data = metrics || defaultMetrics;
  const showSkeleton = isLoading && !metrics;

  const statusConfig = {
    pending: { icon: <AlertCircle className="h-5 w-5" />, label: 'Pending', color: 'text-yellow-500' },
    generating: { icon: <Zap className="h-5 w-5 animate-pulse" />, label: 'Generating', color: 'text-blue-500' },
    completed: { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Completed', color: 'text-green-500' },
    failed: { icon: <AlertCircle className="h-5 w-5" />, label: 'Failed', color: 'text-red-500' },
  };

  const currentStatus = statusConfig[data.status];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground">Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Real-time generation statistics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Response Time"
          value={data.responseTime.toFixed(2)}
          unit="seconds"
          isLoading={showSkeleton}
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Agents Called"
          value={data.agentsCalled}
          isLoading={showSkeleton}
        />
        <MetricCard
          icon={<FileCode className="h-5 w-5" />}
          label="Files Generated"
          value={data.filesGenerated}
          isLoading={showSkeleton}
        />
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <div className={`rounded-lg bg-primary/10 p-2 ${currentStatus.color}`}>
              {currentStatus.icon}
            </div>
          </div>
          {showSkeleton ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className="text-2xl font-bold text-foreground capitalize">
              {currentStatus.label}
            </span>
          )}
        </Card>
      </div>
    </div>
  );
}
