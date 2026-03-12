import axios, { AxiosError } from 'axios';
import { Project, ProjectResult, Metrics } from '@/types/project';
import { generateProjectCode } from './codeGenerator';

const extractText = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidates = [
      obj.aiResponse,
      obj.response,
      obj.content,
      obj.message,
      obj.plan,
      obj.summary,
      obj.output,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }
  }
  return '';
};

const buildDeveloperOutput = (
  baseText: string,
  templates: ReturnType<typeof generateProjectCode>
): string => {
  if (!templates.length) {
    return baseText || 'No developer output available.';
  }

  const codeSection = templates
    .map(
      (template) =>
        `### ${template.filename}\n\n${template.description}\n\n\`\`\`${template.language}\n${template.code}\n\`\`\``
    )
    .join('\n\n');

  const header = baseText || 'Implementation notes and starter code.';
  return `${header}\n\n## Generated Starter Code\n\n${codeSection}`;
};

const isLikelyStructuredQaJson = (value: string): boolean => {
  const normalized = value.trim();
  if (!normalized) return false;

  const jsonBlockMatch = normalized.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = (jsonBlockMatch?.[1] || normalized).trim();

  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;
    return (
      'is_valid' in parsed &&
      'issues_found' in parsed &&
      'missing_elements' in parsed &&
      'improvement_suggestions' in parsed &&
      'risk_level' in parsed
    );
  } catch {
    return false;
  }
};

const buildQaOutput = (
  projectName: string,
  projectDescription: string,
  developerOutput: string
): string => {
  const issuesFound: string[] = [];
  const missingElements: string[] = [];
  const improvementSuggestions: string[] = [];

  const description = (projectDescription || '').toLowerCase();
  const output = (developerOutput || '').toLowerCase();

  const targetsCalculator = /calculator/.test(description);
  const requestsHtmlCssOnly = /html\s*(and|&)\s*css/.test(description);

  const hasHtml = /```html|<html|<button|<input/.test(output);
  const hasCss = /```css|\{[^}]*\}|\.container|display\s*:\s*(grid|flex)/.test(output);
  const hasJs = /```javascript|```js|<script|function\s|addEventListener|onclick/.test(output);
  const hasOperators = /(\+|\-|\*|\/|operator|equals|=)/.test(output);
  const hasClear = /\bclear\b|\bac\b|\breset\b/.test(output);
  const hasErrorHandling = /try\s*\{|catch\s*\(|invalid|error|nan|isnan/.test(output);
  const hasResponsive = /@media|max-width|min-width|clamp\(|vw|rem/.test(output);
  const hasAccessibility = /aria-|label\s+for|role=|tabindex|:focus|focus-visible/.test(output);
  const hasFormattedBlocks = /```[a-z]*\n[\s\S]+```/.test(developerOutput || '');

  if (targetsCalculator && (!hasHtml || !hasCss)) {
    issuesFound.push('Core calculator stack coverage is incomplete for HTML/CSS deliverable.');
    missingElements.push('Complete HTML and CSS implementation for calculator UI.');
  }

  if (requestsHtmlCssOnly && hasJs) {
    issuesFound.push('Scope mismatch: response includes JavaScript while prompt requests HTML and CSS only.');
    improvementSuggestions.push('Align output strictly to requested technologies unless user explicitly asks for behavior logic.');
  }

  if (!hasOperators || !hasClear) {
    issuesFound.push('Feature coverage appears incomplete for basic calculator interactions.');
    if (!hasOperators) {
      missingElements.push('Operator controls and equals behavior.');
    }
    if (!hasClear) {
      missingElements.push('Reset or clear action for calculator state.');
    }
  }

  if (!hasFormattedBlocks) {
    issuesFound.push('Code formatting quality is weak; snippets may be hard to run directly.');
    missingElements.push('Proper fenced code blocks with readable indentation.');
  }

  if (!hasErrorHandling) {
    missingElements.push('Invalid input and error-state handling strategy.');
    improvementSuggestions.push('Document behavior for empty input, malformed state, and reset transitions.');
  }

  if (!hasResponsive) {
    missingElements.push('Responsive behavior for mobile and desktop breakpoints.');
    improvementSuggestions.push('Add responsive CSS rules for smaller viewports.');
  }

  if (!hasAccessibility) {
    missingElements.push('Accessibility basics (labels, keyboard access, visible focus states).');
    improvementSuggestions.push('Include semantic labels and focus-visible styles for keyboard users.');
  }

  if (!issuesFound.length && !missingElements.length) {
    improvementSuggestions.push('Add a short testing checklist to verify expected calculator operations.');
  }

  const totalGaps = issuesFound.length + missingElements.length;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalGaps >= 6) riskLevel = 'high';
  else if (totalGaps >= 3) riskLevel = 'medium';

  const qaReport = {
    is_valid: totalGaps === 0,
    issues_found: issuesFound,
    missing_elements: missingElements,
    improvement_suggestions: improvementSuggestions,
    risk_level: riskLevel,
  };

  return JSON.stringify(qaReport, null, 2);
};

const buildEvaluationOutput = (
  projectManagerOutput: string,
  developerOutput: string,
  qaOutput: string
): string => {
  const hasPlan = /project|scope|timeline|deliverable/i.test(projectManagerOutput);
  const hasCode = /```|function|class|const|html|css|javascript/i.test(developerOutput);
  const hasQa = /qa|test|question|verification|check/i.test(qaOutput);
  const score = [hasPlan, hasCode, hasQa].filter(Boolean).length;
  const normalizedScore = Math.round((score / 3) * 10);

  return `## Overall Evaluation\n\n- Planning Quality: ${hasPlan ? 'Good' : 'Missing key planning details'}\n- Development Quality: ${hasCode ? 'Includes actionable code' : 'Code guidance is limited'}\n- QA Quality: ${hasQa ? 'Contains validation prompts' : 'QA validation is weak'}\n\n## Final Score\n\n- Score: ${normalizedScore}/10\n- Summary: ${normalizedScore >= 7 ? 'Output is usable and mostly complete.' : 'Output needs additional refinement before implementation.'}`;
};

const buildTimeoutFallbackResult = (project: Project): ProjectResult => {
  const fallbackMessage =
    'AI generation exceeded the request timeout. Returning a local starter response based on the provided prompt while the backend model remains unavailable or slow.';

  return apiService.normalizeProjectResult({
    projectName: project.projectName,
    projectIdea: project.projectIdea,
    aiResponse: fallbackMessage,
  });
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for Ollama inference
});

// Error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  async createProject(project: Project) {
    try {
      const response = await apiClient.post('/projects', {
        name: project.projectName,
        description: project.projectIdea,
        prompt: `Create a complete project plan for: ${project.projectIdea}`,
      });

      // Normalize backend payloads so UI consumers always receive ProjectResult keys.
      return this.normalizeProjectResult(response.data);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.code === 'ECONNABORTED' || /timeout/i.test(error.message))
      ) {
        return buildTimeoutFallbackResult(project);
      }

      throw this.handleError(error);
    }
  },

  async getProject(projectName: string) {
    try {
      const response = await apiClient.get<ProjectResult>(`/projects/${projectName}`, {
        timeout: 180000, // 3 minutes for potentially slow AI generation
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async downloadProject(projectName: string) {
    try {
      const response = await apiClient.get<Blob>(`/projects/download/${projectName}`, {
        responseType: 'blob',
        timeout: 120000, // 2 minutes for download
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getMetrics(projectName: string) {
    try {
      const response = await apiClient.get<Metrics>(`/projects/${projectName}/metrics`, {
        timeout: 30000, // 30 seconds for metrics
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  },

  normalizeProjectResult(payload: any): ProjectResult {
    const projectName = payload?.projectName || payload?.name || payload?.data?.name || 'Project';
    const projectIdea =
      payload?.projectIdea ||
      payload?.description ||
      payload?.data?.description ||
      '';
    const templates = generateProjectCode(projectName, projectIdea);

    if (payload?.projectManager || payload?.developer || payload?.qa || payload?.evaluation) {
      const projectManagerOutput =
        extractText(payload.projectManager) ||
        extractText(payload?.data?.projectManager) ||
        extractText(payload.aiResponse) ||
        'No project manager output available.';

      const developerBaseOutput =
        extractText(payload.developer) ||
        extractText(payload?.data?.developer) ||
        extractText(payload.aiResponse) ||
        projectManagerOutput;

      const rawQaOutput =
        extractText(payload.qa) ||
        extractText(payload?.data?.qa) ||
        '';

      const qaOutput = isLikelyStructuredQaJson(rawQaOutput)
        ? rawQaOutput
        : buildQaOutput(projectName, projectIdea, developerBaseOutput);

      const evaluationOutput =
        extractText(payload.evaluation) ||
        extractText(payload?.data?.evaluation) ||
        buildEvaluationOutput(projectManagerOutput, developerBaseOutput, qaOutput);

      return {
        projectManager: projectManagerOutput,
        developer: buildDeveloperOutput(developerBaseOutput, templates),
        qa: qaOutput,
        evaluation: evaluationOutput,
        codeTemplates: templates,
      };
    }

    const aiResponse =
      extractText(payload?.data?.aiResponse) ||
      extractText(payload?.aiResponse) ||
      extractText(payload) ||
      'No response available.';

    const developerOutput = buildDeveloperOutput(aiResponse, templates);
    const qaOutput = buildQaOutput(projectName, projectIdea, developerOutput);

    return {
      projectManager: aiResponse,
      developer: developerOutput,
      qa: qaOutput,
      evaluation: buildEvaluationOutput(aiResponse, developerOutput, qaOutput),
      codeTemplates: templates,
    };
  },
};

export default apiService;
