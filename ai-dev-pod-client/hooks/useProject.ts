import { useState, useCallback } from 'react';
import { Project, ProjectResult, ProjectState, Metrics } from '@/types/project';
import apiService from '@/lib/api.service';

const initialState: ProjectState = {
  projectName: '',
  projectIdea: '',
  result: null,
  metrics: null,
  loading: false,
  error: null,
  downloadUrl: null,
};

export function useProject() {
  const [state, setState] = useState<ProjectState>(initialState);

  const getElapsedSeconds = (startedAt: number) => {
    return Number(((Date.now() - startedAt) / 1000).toFixed(2));
  };

  const countAvailableAgents = (result: ProjectResult) => {
    const outputs = [
      result.projectManager,
      result.developer,
      result.qa,
      result.evaluation,
    ];

    return outputs.filter((output) => {
      if (typeof output === 'string') {
        return output.trim().length > 0;
      }
      if (output && typeof output === 'object') {
        return Object.keys(output).length > 0;
      }
      return false;
    }).length;
  };

  const setProjectName = useCallback((projectName: string) => {
    setState((prev) => ({ ...prev, projectName }));
  }, []);

  const setProjectIdea = useCallback((projectIdea: string) => {
    setState((prev) => ({ ...prev, projectIdea }));
  }, []);

  const createProject = useCallback(async (project: Project) => {
    const startedAt = Date.now();

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      metrics: {
        responseTime: 0,
        agentsCalled: 0,
        filesGenerated: 0,
        status: 'generating',
      },
    }));

    const realtimeTimer = setInterval(() => {
      setState((prev) => {
        const currentMetrics: Metrics = prev.metrics || {
          responseTime: 0,
          agentsCalled: 0,
          filesGenerated: 0,
          status: 'generating',
        };

        return {
          ...prev,
          metrics: {
            ...currentMetrics,
            responseTime: getElapsedSeconds(startedAt),
            status: prev.loading ? 'generating' : currentMetrics.status,
          },
        };
      });
    }, 250);

    const metricsPoller = setInterval(async () => {
      if (!project.projectName) {
        return;
      }

      try {
        const apiMetrics = await apiService.getMetrics(project.projectName);
        setState((prev) => ({
          ...prev,
          metrics: {
            responseTime: getElapsedSeconds(startedAt),
            agentsCalled: apiMetrics.agentsCalled,
            filesGenerated: apiMetrics.filesGenerated,
            status: prev.loading ? 'generating' : apiMetrics.status,
          },
        }));
      } catch {
        // Ignore polling errors; final metrics are still set from generation result.
      }
    }, 1500);

    try {
      const result = await apiService.createProject(project);

      const finalMetrics: Metrics = {
        responseTime: getElapsedSeconds(startedAt),
        agentsCalled: countAvailableAgents(result),
        filesGenerated: result.codeTemplates?.length || 0,
        status: 'completed',
      };

      setState((prev) => ({
        ...prev,
        result,
        metrics: finalMetrics,
        loading: false,
        projectName: project.projectName,
        projectIdea: project.projectIdea,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setState((prev) => ({
        ...prev,
        metrics: {
          responseTime: getElapsedSeconds(startedAt),
          agentsCalled: prev.metrics?.agentsCalled || 0,
          filesGenerated: prev.metrics?.filesGenerated || 0,
          status: 'failed',
        },
        loading: false,
        error: errorMessage,
      }));
      throw error;
    } finally {
      clearInterval(realtimeTimer);
      clearInterval(metricsPoller);
    }
  }, []);

  const getProject = useCallback(async (projectName: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await apiService.getProject(projectName);
      setState((prev) => ({
        ...prev,
        result,
        loading: false,
        projectName,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const downloadProject = useCallback(async (projectName: string) => {
    try {
      const blob = await apiService.downloadProject(projectName);
      const url = URL.createObjectURL(blob);
      setState((prev) => ({
        ...prev,
        downloadUrl: url,
      }));
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download project';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const getMetrics = useCallback(async (projectName: string) => {
    try {
      const metrics = await apiService.getMetrics(projectName);
      setState((prev) => ({
        ...prev,
        metrics,
      }));
      return metrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setProjectName,
    setProjectIdea,
    createProject,
    getProject,
    downloadProject,
    getMetrics,
    reset,
  };
}
