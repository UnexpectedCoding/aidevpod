export interface Project {
  projectName: string;
  projectIdea: string;
}

export interface AgentResult {
  [key: string]: any;
}

export type AgentOutput = AgentResult | string;

export interface CodeTemplate {
  language: string;
  filename: string;
  code: string;
  description: string;
}

export interface ProjectResult {
  projectManager: AgentOutput;
  developer: AgentOutput;
  qa: AgentOutput;
  evaluation: AgentOutput;
  codeTemplates?: CodeTemplate[];
}

export interface Metrics {
  responseTime: number;
  agentsCalled: number;
  filesGenerated: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface ProjectState {
  projectName: string;
  projectIdea: string;
  result: ProjectResult | null;
  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
  downloadUrl: string | null;
}
