#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  CompleteRequestSchema,
  CompleteResult,
  ErrorCode,
  GetPromptRequestSchema,
  GetPromptResult,
  ListPromptsRequestSchema,
  ListPromptsResult,
  ListResourcesRequestSchema,
  ListResourcesResult,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ReadResourceResult,
  SetLevelRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { HttpServerTransport } from './transports/http.js';

// Import all tool definitions and handlers
import { getCurrentTime, getCurrentTimeDefinition } from './tools/time/getCurrentTime.js';

// Import resource definitions and handlers
import { capabilitiesDefinition, getCapabilitiesContent } from './tools/resources/capabilities.js';
import { getToolDocumentationContent, toolDocumentationDefinition } from './tools/resources/readme.js';

// Import prompt definitions and handlers
import { browserDevelopmentDefinition, getBrowserDevelopmentPrompt } from './tools/prompt/browserDevelopment.js';
import { codeConventionsDefinition, getCodeConventionsPrompt } from './tools/prompt/codeConventions.js';
import { codeReviewDefinition, getCodeReviewPrompt } from './tools/prompt/codeReview.js';
import { debugAssistantDefinition, getDebugAssistantPrompt } from './tools/prompt/debugAssistant.js';
import { documentationDefinition, getDocumentationPrompt } from './tools/prompt/documentation.js';
import { getMemoryManagementPrompt, memoryManagementDefinition } from './tools/prompt/memoryManagement.js';
import { getProjectPlanningPrompt, projectPlanningDefinition } from './tools/prompt/projectPlanning.js';
import { getPromptEnhancementPrompt, promptEnhancementDefinition } from './tools/prompt/promptEnhancement.js';
import { getReasoningFrameworkPrompt, reasoningFrameworkDefinition } from './tools/prompt/reasoningFramework.js';
import { getSemanticAnalysisPrompt, semanticAnalysisDefinition } from './tools/prompt/semanticAnalysis.js';
import { getSequentialThinkingPrompt, sequentialThinkingDefinition } from './tools/prompt/sequentialThinking.js';
import { getSpecGenerationPrompt, specGenerationDefinition } from './tools/prompt/specGeneration.js';
import { getTestingPrompt, testingDefinition } from './tools/prompt/testing.js';
import { getTimeUtilitiesPrompt, timeUtilitiesDefinition } from './tools/prompt/timeUtilities.js';
import { getUiPreviewPrompt, uiPreviewDefinition } from './tools/prompt/uiPreview.js';

// Semantic code analysis tools (Serena-inspired)
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { inspectNetworkRequests, inspectNetworkRequestsDefinition } from './tools/browser/inspectNetworkRequests.js';
import { monitorConsoleLogs, monitorConsoleLogsDefinition } from './tools/browser/monitorConsoleLogs.js';
import { analyzeComplexity, analyzeComplexityDefinition } from './tools/convention/analyzeComplexity.js';
import { applyQualityRules, applyQualityRulesDefinition } from './tools/convention/applyQualityRules.js';
import { checkCouplingCohesion, checkCouplingCohesionDefinition } from './tools/convention/checkCouplingCohesion.js';
import { getCodingGuide, getCodingGuideDefinition } from './tools/convention/getCodingGuide.js';
import { suggestImprovements, suggestImprovementsDefinition } from './tools/convention/suggestImprovements.js';
import { validateCodeQuality, validateCodeQualityDefinition } from './tools/convention/validateCodeQuality.js';
import { autoSaveContext, autoSaveContextDefinition } from './tools/memory/autoSaveContext.js';
import { deleteMemory, deleteMemoryDefinition } from './tools/memory/deleteMemory.js';
import { listMemories, listMemoriesDefinition } from './tools/memory/listMemories.js';
import { prioritizeMemory, prioritizeMemoryDefinition } from './tools/memory/prioritizeMemory.js';
import { recallMemory, recallMemoryDefinition } from './tools/memory/recallMemory.js';
import { restoreSessionContext, restoreSessionContextDefinition } from './tools/memory/restoreSessionContext.js';
import { saveMemory, saveMemoryDefinition } from './tools/memory/saveMemory.js';
import { searchMemoriesDefinition, searchMemoriesHandler } from './tools/memory/searchMemories.js';
import { startSession, startSessionDefinition } from './tools/memory/startSession.js';
import { updateMemory, updateMemoryDefinition } from './tools/memory/updateMemory.js';
import { analyzeRequirements, analyzeRequirementsDefinition } from './tools/planning/analyzeRequirements.js';
import { createUserStories, createUserStoriesDefinition } from './tools/planning/createUserStories.js';
import { featureRoadmap, featureRoadmapDefinition } from './tools/planning/featureRoadmap.js';
import { generatePrd, generatePrdDefinition } from './tools/planning/generatePrd.js';
import { analyzePrompt, analyzePromptDefinition } from './tools/prompt/analyzePrompt.js';
import { enhancePrompt, enhancePromptDefinition } from './tools/prompt/enhancePrompt.js';
import { enhancePromptGemini, enhancePromptGeminiDefinition } from './tools/prompt/enhancePromptGemini.js';
import { applyReasoningFramework, applyReasoningFrameworkDefinition } from './tools/reasoning/applyReasoningFramework.js';
import { findReferences, findReferencesDefinition } from './tools/semantic/findReferences.js';
import { findSymbol, findSymbolDefinition } from './tools/semantic/findSymbol.js';
import { analyzeProblem, analyzeProblemDefinition } from './tools/thinking/analyzeProblem.js';
import { breakDownProblem, breakDownProblemDefinition } from './tools/thinking/breakDownProblem.js';
import { createThinkingChain, createThinkingChainDefinition } from './tools/thinking/createThinkingChain.js';
import { formatAsPlan, formatAsPlanDefinition } from './tools/thinking/formatAsPlan.js';
import { stepByStepAnalysis, stepByStepAnalysisDefinition } from './tools/thinking/stepByStepAnalysis.js';
import { thinkAloudProcess, thinkAloudProcessDefinition } from './tools/thinking/thinkAloudProcess.js';
import { previewUiAscii, previewUiAsciiDefinition } from './tools/ui/previewUiAscii.js';

// Import pagination utilities
import { paginateItems } from './types/pagination.js';

// Import task manager

// Tool definition interface with optional task support
interface ToolDefinition {
  name?: string;
  description?: string;
  execution?: {
    taskSupport?: 'required' | 'optional' | 'forbidden';
  };
  // allow any additional properties from tool definition objects
  [key: string]: any;
}

// Collect all tool definitions
const tools: ToolDefinition[] = [
  // Time Utility Tools
  getCurrentTimeDefinition,

  // Semantic Code Analysis Tools (Serena-inspired)
  findSymbolDefinition,
  findReferencesDefinition,

  // Sequential Thinking Tools
  createThinkingChainDefinition,
  analyzeProblemDefinition,
  stepByStepAnalysisDefinition,
  breakDownProblemDefinition,
  thinkAloudProcessDefinition,
  formatAsPlanDefinition,

  // Browser Development Tools
  monitorConsoleLogsDefinition,
  inspectNetworkRequestsDefinition,

  // Memory Management Tools
  saveMemoryDefinition,
  recallMemoryDefinition,
  listMemoriesDefinition,
  deleteMemoryDefinition,
  searchMemoriesDefinition,
  updateMemoryDefinition,
  autoSaveContextDefinition,
  restoreSessionContextDefinition,
  prioritizeMemoryDefinition,
  startSessionDefinition,

  // Convention Tools
  getCodingGuideDefinition,
  applyQualityRulesDefinition,
  validateCodeQualityDefinition,
  analyzeComplexityDefinition,
  checkCouplingCohesionDefinition,
  suggestImprovementsDefinition,

  // Planning Tools
  generatePrdDefinition,
  createUserStoriesDefinition,
  analyzeRequirementsDefinition,
  featureRoadmapDefinition,

  // Prompt Enhancement Tools
  enhancePromptDefinition,
  analyzePromptDefinition,
  enhancePromptGeminiDefinition,

  // Reasoning Tools
  applyReasoningFrameworkDefinition,

  // UI Preview Tools
  previewUiAsciiDefinition
];

// Task support temporarily disabled

function buildServer(config?: unknown): McpServer {
  const server: McpServer = new McpServer(
    {
      name: 'Hi-AI',
      version: '1.6.0',
    },
    {
      capabilities: {
        logging: {},
        prompts: {
          listChanged: true
        },
        resources: {
          listChanged: true
        },
        tools: {
          listChanged: true
        },
        completions: {},
      },
    }
  );

  // Define resources from imported definitions
  const resources = [
    toolDocumentationDefinition,
    capabilitiesDefinition
  ];

  // Define prompts from imported definitions
  const prompts = [
    codeReviewDefinition,
    debugAssistantDefinition,
    projectPlanningDefinition,
    memoryManagementDefinition,
    timeUtilitiesDefinition,
    semanticAnalysisDefinition,
    sequentialThinkingDefinition,
    browserDevelopmentDefinition,
    codeConventionsDefinition,
    promptEnhancementDefinition,
    reasoningFrameworkDefinition,
    specGenerationDefinition,
    documentationDefinition,
    testingDefinition,
    uiPreviewDefinition
  ];

  // Task notifications disabled - experimental feature temporarily removed

  // ========================================
  // TOOLS - with pagination support
  // ========================================
  interface ListToolsRequestParams {
    cursor?: string;
  }

  server.server.setRequestHandler(ListToolsRequestSchema, async (request: { params?: ListToolsRequestParams }): Promise<{ tools: ToolDefinition[]; nextCursor?: string }> => {
    const cursor = request.params?.cursor;
    const paginated = paginateItems(tools, cursor, 50);

    return {
      tools: paginated.items,
      nextCursor: paginated.nextCursor
    };
  });

  // ========================================
  // RESOURCES - with pagination support
  // ========================================
  interface ListResourcesRequestParams {
    cursor?: string;
  }

  server.server.setRequestHandler(ListResourcesRequestSchema, async (request: { params?: ListResourcesRequestParams }): Promise<ListResourcesResult & { nextCursor?: string }> => {
    const cursor = request.params?.cursor;
    const paginated = paginateItems(resources, cursor, 50);

    return {
      resources: paginated.items,
      nextCursor: paginated.nextCursor
    };
  });

  server.server.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<ReadResourceResult> => {
    const { uri } = request.params;

    try {
      if (uri === toolDocumentationDefinition.uri) {
        const content = getToolDocumentationContent();
        return {
          contents: [{
            uri,
            mimeType: toolDocumentationDefinition.mimeType,
            text: content
          }]
        };
      } else if (uri === capabilitiesDefinition.uri) {
        const content = getCapabilitiesContent(tools.length, resources.length, prompts.length);
        return {
          contents: [{
            uri,
            mimeType: capabilitiesDefinition.mimeType,
            text: content
          }]
        };
      } else {
        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Error reading resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // ========================================
  // PROMPTS - with pagination support
  // ========================================
  interface ListPromptsRequestParams {
    cursor?: string;
  }

  server.server.setRequestHandler(ListPromptsRequestSchema, async (request: { params?: ListPromptsRequestParams }): Promise<ListPromptsResult & { nextCursor?: string }> => {
    const cursor = request.params?.cursor;
    const paginated = paginateItems(prompts, cursor, 50);

    return {
      prompts: paginated.items,
      nextCursor: paginated.nextCursor
    };
  });

  // ========================================
  // COMPLETION - argument suggestions
  // ========================================
  server.server.setRequestHandler(CompleteRequestSchema, async (request): Promise<CompleteResult> => {
    const { ref, argument } = request.params;

    try {
      if (ref.type === 'ref/prompt') {
        const promptName = ref.name;
        if (promptName === codeReviewDefinition.name && argument.name === 'language') {
          return {
            completion: {
              values: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'csharp', 'php', 'ruby'],
              hasMore: false,
              total: 10
            }
          };
        } else if (promptName === debugAssistantDefinition.name && argument.name === 'environment') {
          return {
            completion: {
              values: ['browser', 'node.js', 'electron', 'react-native', 'server', 'desktop'],
              hasMore: false,
              total: 6
            }
          };
        } else if (promptName === projectPlanningDefinition.name && argument.name === 'target_audience') {
          return {
            completion: {
              values: ['developers', 'business-users', 'consumers', 'enterprise', 'students', 'general-public'],
              hasMore: false,
              total: 6
            }
          };
        } else if (promptName === memoryManagementDefinition.name && argument.name === 'importance_level') {
          return {
            completion: {
              values: ['critical', 'high', 'medium', 'low'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === timeUtilitiesDefinition.name && argument.name === 'task_type') {
          return {
            completion: {
              values: ['scheduling', 'conversion', 'calculation', 'planning'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === semanticAnalysisDefinition.name && argument.name === 'analysis_type') {
          return {
            completion: {
              values: ['navigation', 'refactoring', 'impact-analysis', 'code-understanding'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === sequentialThinkingDefinition.name && argument.name === 'thinking_task') {
          return {
            completion: {
              values: ['problem-solving', 'decision-making', 'analysis', 'planning'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === browserDevelopmentDefinition.name && argument.name === 'debugging_task') {
          return {
            completion: {
              values: ['console-analysis', 'network-inspection', 'performance-monitoring', 'error-tracking'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === codeConventionsDefinition.name && argument.name === 'code_quality_task') {
          return {
            completion: {
              values: ['validation', 'analysis', 'improvement', 'standards-check'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === promptEnhancementDefinition.name && argument.name === 'enhancement_task') {
          return {
            completion: {
              values: ['optimization', 'analysis', 'gemini-enhancement', 'effectiveness-review'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === reasoningFrameworkDefinition.name && argument.name === 'reasoning_task') {
          return {
            completion: {
              values: ['problem-analysis', 'decision-making', 'evaluation', 'strategy-development'],
              hasMore: false,
              total: 4
            }
          };
        } else if (promptName === specGenerationDefinition.name && argument.name === 'spec_type') {
          return {
            completion: {
              values: ['api', 'feature', 'system', 'ui', 'data', 'security', 'architecture', 'integration'],
              hasMore: false,
              total: 8
            }
          };
        } else if (promptName === specGenerationDefinition.name && argument.name === 'stakeholders') {
          return {
            completion: {
              values: ['development-team', 'product-owner', 'end-users', 'business-analysts', 'qa-engineers', 'devops-team', 'security-team'],
              hasMore: false,
              total: 7
            }
          };
        } else if (promptName === documentationDefinition.name && argument.name === 'doc_type') {
          return {
            completion: {
              values: ['api', 'readme', 'user-guide', 'technical', 'deployment', 'troubleshooting', 'architecture', 'integration'],
              hasMore: false,
              total: 8
            }
          };
        } else if (promptName === documentationDefinition.name && argument.name === 'audience') {
          return {
            completion: {
              values: ['developers', 'users', 'administrators', 'stakeholders', 'testers', 'devops', 'security-team'],
              hasMore: false,
              total: 7
            }
          };
        } else if (promptName === documentationDefinition.name && argument.name === 'format') {
          return {
            completion: {
              values: ['markdown', 'html', 'pdf', 'structured', 'wiki', 'api-docs', 'interactive'],
              hasMore: false,
              total: 7
            }
          };
        } else if (promptName === testingDefinition.name && argument.name === 'test_type') {
          return {
            completion: {
              values: ['unit', 'integration', 'e2e', 'performance', 'security', 'api', 'ui', 'mobile', 'accessibility', 'compatibility'],
              hasMore: false,
              total: 10
            }
          };
        } else if (promptName === testingDefinition.name && argument.name === 'quality_requirements') {
          return {
            completion: {
              values: ['high-reliability', 'gdpr-compliant', 'wcag-accessible', 'performance-critical', 'security-first', 'user-centric'],
              hasMore: false,
              total: 6
            }
          };
        }
      }
      // Default empty completion
      return {
        completion: {
          values: [],
          hasMore: false,
          total: 0
        }
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Error completing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // ========================================
  // LOGGING
  // ========================================
  let currentLogLevel: string = 'info';

  server.server.setRequestHandler(SetLevelRequestSchema, async (request): Promise<{}> => {
    const { level } = request.params;
    currentLogLevel = level;
    // Optionally send a notification
    await server.server.notification({
      method: 'notifications/message',
      params: {
        level: 'info',
        logger: 'hi-ai',
        data: `Log level set to ${level}`
      }
    });
    return {};
  });

  // ========================================
  // PROMPTS - get prompt handler
  // ========================================
  server.server.setRequestHandler(GetPromptRequestSchema, async (request): Promise<GetPromptResult> => {
    const { name, arguments: args = {} } = request.params;

    try {
      if (name === codeReviewDefinition.name) {
        const language = args.language as string;
        const code = args.code as string;
        const projectPath = args.project_path as string;
        return getCodeReviewPrompt(language, code, projectPath);
      } else if (name === debugAssistantDefinition.name) {
        const errorMessage = args.error_message as string;
        const codeContext = args.code_context as string;
        const environment = args.environment as string;
        const reproductionSteps = args.reproduction_steps as string;
        return getDebugAssistantPrompt(errorMessage, codeContext, environment, reproductionSteps);
      } else if (name === projectPlanningDefinition.name) {
        const projectIdea = args.project_idea as string;
        const targetAudience = args.target_audience as string;
        const constraints = args.constraints as string;
        const existingContext = args.existing_context as string;
        return getProjectPlanningPrompt(projectIdea, targetAudience, constraints, existingContext);
      } else if (name === memoryManagementDefinition.name) {
        const taskContext = args.task_context as string;
        const memoryOperation = args.memory_operation as string;
        const importanceLevel = args.importance_level as string;
        const relatedTopics = args.related_topics as string;
        return getMemoryManagementPrompt(taskContext, memoryOperation, importanceLevel, relatedTopics);
      } else if (name === timeUtilitiesDefinition.name) {
        const taskType = args.task_type as string;
        const context = args.context as string;
        const timezones = args.timezones as string;
        const constraints = args.constraints as string;
        return getTimeUtilitiesPrompt(taskType, context, timezones, constraints);
      } else if (name === semanticAnalysisDefinition.name) {
        const analysisType = args.analysis_type as string;
        const targetSymbol = args.target_symbol as string;
        const projectPath = args.project_path as string;
        const analysisScope = args.analysis_scope as string;
        const specificRequirements = args.specific_requirements as string;
        return getSemanticAnalysisPrompt(analysisType, targetSymbol, projectPath, analysisScope, specificRequirements);
      } else if (name === sequentialThinkingDefinition.name) {
        const thinkingTask = args.thinking_task as string;
        const domainContext = args.domain_context as string;
        const complexityLevel = args.complexity_level as string;
        const outputFormat = args.output_format as string;
        const constraints = args.constraints as string;
        return getSequentialThinkingPrompt(thinkingTask, domainContext, complexityLevel, outputFormat, constraints);
      } else if (name === browserDevelopmentDefinition.name) {
        const debuggingTask = args.debugging_task as string;
        const targetUrl = args.target_url as string;
        const issueDescription = args.issue_description as string;
        const monitoringDuration = args.monitoring_duration as string;
        const focusAreas = args.focus_areas as string;
        return getBrowserDevelopmentPrompt(debuggingTask, targetUrl, issueDescription, monitoringDuration, focusAreas);
      } else if (name === codeConventionsDefinition.name) {
        const codeQualityTask = args.code_quality_task as string;
        const codeToAnalyze = args.code_to_analyze as string;
        const programmingLanguage = args.programming_language as string;
        const qualityFocus = args.quality_focus as string;
        const standardsLevel = args.standards_level as string;
        return getCodeConventionsPrompt(codeQualityTask, codeToAnalyze, programmingLanguage, qualityFocus, standardsLevel);
      } else if (name === promptEnhancementDefinition.name) {
        const enhancementTask = args.enhancement_task as string;
        const originalPrompt = args.original_prompt as string;
        const targetUseCase = args.target_use_case as string;
        const enhancementFocus = args.enhancement_focus as string;
        const aiModelContext = args.ai_model_context as string;
        return getPromptEnhancementPrompt(enhancementTask, originalPrompt, targetUseCase, enhancementFocus, aiModelContext);
      } else if (name === reasoningFrameworkDefinition.name) {
        const reasoningTask = args.reasoning_task as string;
        const problemContext = args.problem_context as string;
        const reasoningApproach = args.reasoning_approach as string;
        const complexityLevel = args.complexity_level as string;
        const decisionCriteria = args.decision_criteria as string;
        return getReasoningFrameworkPrompt(reasoningTask, problemContext, reasoningApproach, complexityLevel, decisionCriteria);
      } else if (name === specGenerationDefinition.name) {
        const specType = args.spec_type as string;
        const specSubject = args.spec_subject as string;
        const context = args.context as string;
        const stakeholders = args.stakeholders as string;
        const constraints = args.constraints as string;
        return getSpecGenerationPrompt(specType, specSubject, context, stakeholders, constraints);
      } else if (name === documentationDefinition.name) {
        const docType = args.doc_type as string;
        const docSubject = args.doc_subject as string;
        const audience = args.audience as string;
        const context = args.context as string;
        const format = args.format as string;
        return getDocumentationPrompt(docType, docSubject, audience, context, format);
      } else if (name === testingDefinition.name) {
        const testType = args.test_type as string;
        const systemUnderTest = args.system_under_test as string;
        const testingContext = args.testing_context as string;
        const qualityRequirements = args.quality_requirements as string;
        const constraints = args.constraints as string;
        return getTestingPrompt(testType, systemUnderTest, testingContext, qualityRequirements, constraints);
      } else if (name === uiPreviewDefinition.name) {
        const uiDescription = args.ui_description as string;
        const designContext = args.design_context as string;
        const previewStyle = args.preview_style as string;
        const keyElements = args.key_elements as string;
        const layoutFocus = args.layout_focus as string;
        return getUiPreviewPrompt(uiDescription, designContext, previewStyle, keyElements, layoutFocus);
      } else {
        throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      }
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(ErrorCode.InternalError, `Error getting prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // ========================================
  // TOOLS - call tool handler
  // ========================================

  // Tool execution function
  async function executeToolCall(name: string, args: unknown): Promise<CallToolResult> {
    switch (name) {
      // Time Utility Tools
      case 'get_current_time':
        return await getCurrentTime(args as any) as CallToolResult;

      // Semantic Code Analysis Tools
      case 'find_symbol':
        return await findSymbol(args as any) as CallToolResult;
      case 'find_references':
        return await findReferences(args as any) as CallToolResult;

      // Sequential Thinking Tools
      case 'create_thinking_chain':
        return await createThinkingChain(args as any) as CallToolResult;
      case 'analyze_problem':
        return await analyzeProblem(args as any) as CallToolResult;
      case 'step_by_step_analysis':
        return await stepByStepAnalysis(args as any) as CallToolResult;
      case 'break_down_problem':
        return await breakDownProblem(args as any) as CallToolResult;
      case 'think_aloud_process':
        return await thinkAloudProcess(args as any) as CallToolResult;
      case 'format_as_plan':
        return await formatAsPlan(args as any) as CallToolResult;

      // Browser Development Tools
      case 'monitor_console_logs':
        return await monitorConsoleLogs(args as any) as CallToolResult;
      case 'inspect_network_requests':
        return await inspectNetworkRequests(args as any) as CallToolResult;

      // Memory Management Tools
      case 'save_memory':
        return await saveMemory(args as any) as CallToolResult;
      case 'recall_memory':
        return await recallMemory(args as any) as CallToolResult;
      case 'list_memories':
        return await listMemories(args as any) as CallToolResult;
      case 'delete_memory':
        return await deleteMemory(args as any) as CallToolResult;
      case 'search_memories':
        return await searchMemoriesHandler(args as any) as CallToolResult;
      case 'update_memory':
        return await updateMemory(args as any) as CallToolResult;
      case 'auto_save_context':
        return await autoSaveContext(args as any) as CallToolResult;
      case 'restore_session_context':
        return await restoreSessionContext(args as any) as CallToolResult;
      case 'prioritize_memory':
        return await prioritizeMemory(args as any) as CallToolResult;
      case 'start_session':
        return await startSession(args as any) as CallToolResult;

      // Convention Tools
      case 'get_coding_guide':
        return await getCodingGuide(args as any) as CallToolResult;
      case 'apply_quality_rules':
        return await applyQualityRules(args as any) as CallToolResult;
      case 'validate_code_quality':
        return await validateCodeQuality(args as any) as CallToolResult;
      case 'analyze_complexity':
        return await analyzeComplexity(args as any) as CallToolResult;
      case 'check_coupling_cohesion':
        return await checkCouplingCohesion(args as any) as CallToolResult;
      case 'suggest_improvements':
        return await suggestImprovements(args as any) as CallToolResult;

      // Planning Tools
      case 'generate_prd':
        return await generatePrd(args as any) as CallToolResult;
      case 'create_user_stories':
        return await createUserStories(args as any) as CallToolResult;
      case 'analyze_requirements':
        return await analyzeRequirements(args as any) as CallToolResult;
      case 'feature_roadmap':
        return await featureRoadmap(args as any) as CallToolResult;

      // Prompt Enhancement Tools
      case 'enhance_prompt':
        return await enhancePrompt(args as any) as CallToolResult;
      case 'analyze_prompt':
        return await analyzePrompt(args as any) as CallToolResult;
      case 'enhance_prompt_gemini':
        return await enhancePromptGemini(args as any) as CallToolResult;

      // Reasoning Tools
      case 'apply_reasoning_framework':
        return await applyReasoningFramework(args as any) as CallToolResult;

      // UI Preview Tools
      case 'preview_ui_ascii':
        return await previewUiAscii(args as any) as CallToolResult;

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  }

  server.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;

    try {
      return await executeToolCall(name, args);
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Tasks handlers disabled - experimental feature temporarily removed

  return server;
}

// Default export for Smithery platform


function parseCliArgs(argv: string[]): { transport?: string; port?: number; hostname?: string } {
  const args: Record<string, string> = {};
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) return;
    const [key, value] = arg.slice(2).split('=', 2);
    args[key] = value ?? 'true';
  });
  return {
    transport: args['transport'],
    port: args['port'] ? parseInt(args['port'], 10) : undefined,
    hostname: args['hostname']
  };
}

async function main(): Promise<void> {
  // This project enforces a no-environment-variables policy for runtime configuration.
  // Use CLI flags when running locally, or rely on Smithery's session `config` when deployed.
  // Examples:
  //   node dist/index.js --transport=stdio
  //   node dist/index.js --transport=http --port=3000 --hostname=localhost

  const cli = parseCliArgs(process.argv.slice(2));
  // Prefer HTTP when running inside a container (Smithery sets PORT=8081)
  const transportType = cli.transport || (process.env.PORT ? 'http' : 'stdio');
  const port = cli.port ?? (process.env.PORT ? parseInt(process.env.PORT, 10) : 8081);
  const hostname = cli.hostname ?? (process.env.HOSTNAME || '0.0.0.0');

  // Startup info for debugging environment and transport selection
  console.log(`Starting MCP server with transport=${transportType}, port=${port}, hostname=${hostname}`);

  const server: McpServer = buildServer();

  if (transportType === 'stdio') {
    const transport = new StdioServerTransport();

    // Log auth state for clarity
    console.log('Authentication: disabled — server does not require auth');

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.close();
      process.exit(0);
    });

    // Handle EPIPE errors that occur with sidecar proxy
    process.on('uncaughtException', (error) => {
      if (error.message && error.message.includes('EPIPE')) {
        // Gracefully handle EPIPE errors
        console.error('Connection closed by client');
        return;
      }
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    await server.connect(transport);
  } else {
    // HTTP transport with custom transport
    const transport = new HttpServerTransport({
      port,
      hostname,
      allowedOrigins: ['http://localhost:*', 'https://localhost:*'],
      allowedHosts: ['127.0.0.1', 'localhost']
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      console.log('Shutting down MCP server...');
      transport.close();
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down MCP server...');
      transport.close();
      await server.close();
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    await transport.start();

    // Log runtime info to help discovery/debugging
    console.log(`Authentication: disabled — server does not require auth`);
    console.log(`Discovery endpoints: /.well-known/mcp-config, /.well-known/mcp-server-card`);
    console.log(`Memory storage: MEMORIES_DIR=${process.env.MEMORIES_DIR || 'not-set'}, MEMORY_DB_PATH=${process.env.MEMORY_DB_PATH || 'not-set'}`);

    await server.connect(transport as any);
  }
}

// Export config schema for Smithery UI and default exported createServer function
export const configSchema = z.object({
  sessionId: z.string().optional(),
  enableAutoSave: z.boolean().optional().default(true).describe('Automatically save session context'),
  defaultPriority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium').describe('Default priority for tasks')
});

export default function createServer({ config }: { config?: z.infer<typeof configSchema> }) {
  // Smithery expects the default export to return the MCP server object (not connected to a transport).
  // The Smithery CLI will import this function and handle running the HTTP transport.
  const server = buildServer(config as any);
  return server.server;
}

// Only run main when not being imported by Smithery
if (process.argv[1]?.includes('hi-ai') || process.argv[1]?.endsWith('index.js')) {
  main().catch((error) => {
    console.error('Server initialization failed:', error);
    process.exit(1);
  });
}
