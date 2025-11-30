import { ResourceDefinition } from '../../types/resource';

export const capabilitiesDefinition: ResourceDefinition = {
  uri: 'hi-ai://capabilities',
  name: 'Server Capabilities',
  description: 'Detailed server capabilities with tool categorization and feature breakdown',
  mimeType: 'application/json'
};

export function getCapabilitiesContent(toolsCount: number, resourcesCount: number, promptsCount: number): string {
  const capabilities = {
    version: '1.6.0',
    totals: {
      tools: toolsCount,
      resources: resourcesCount,
      prompts: promptsCount
    },
    tool_categories: {
      'Time Utility Tools': {
        count: 1,
        tools: ['get_current_time'],
        description: 'Time and date utilities for development workflows'
      },
      'Semantic Code Analysis Tools': {
        count: 2,
        tools: ['find_symbol', 'find_references'],
        description: 'Advanced code analysis and symbol navigation',
        taskSupport: 'optional'
      },
      'Sequential Thinking Tools': {
        count: 6,
        tools: ['create_thinking_chain', 'analyze_problem', 'step_by_step_analysis', 'break_down_problem', 'think_aloud_process', 'format_as_plan'],
        description: 'Structured reasoning and problem-solving frameworks'
      },
      'Browser Development Tools': {
        count: 2,
        tools: ['monitor_console_logs', 'inspect_network_requests'],
        description: 'Web development debugging and monitoring'
      },
      'Memory Management Tools': {
        count: 10,
        tools: ['save_memory', 'recall_memory', 'list_memories', 'delete_memory', 'search_memories', 'update_memory', 'auto_save_context', 'restore_session_context', 'prioritize_memory', 'start_session'],
        description: 'Intelligent knowledge and context management'
      },
      'Code Convention Tools': {
        count: 6,
        tools: ['get_coding_guide', 'apply_quality_rules', 'validate_code_quality', 'analyze_complexity', 'check_coupling_cohesion', 'suggest_improvements'],
        description: 'Code quality validation and improvement suggestions',
        taskSupport: 'optional'
      },
      'Project Planning Tools': {
        count: 4,
        tools: ['generate_prd', 'create_user_stories', 'analyze_requirements', 'feature_roadmap'],
        description: 'Comprehensive project planning and requirements management',
        taskSupport: 'optional'
      },
      'Prompt Enhancement Tools': {
        count: 3,
        tools: ['enhance_prompt', 'analyze_prompt', 'enhance_prompt_gemini'],
        description: 'AI prompt optimization and analysis',
        taskSupport: 'optional'
      },
      'Reasoning Framework Tools': {
        count: 1,
        tools: ['apply_reasoning_framework'],
        description: 'Advanced reasoning and decision-making frameworks',
        taskSupport: 'optional'
      },
      'UI Preview Tools': {
        count: 1,
        tools: ['preview_ui_ascii'],
        description: 'User interface design and preview generation'
      }
    },
    resources: [
      {
        name: 'Hi-AI README',
        uri: 'hi-ai://readme',
        description: 'Project overview and getting started guide'
      },
      {
        name: 'Hi-AI Tool Documentation',
        uri: 'hi-ai://tool-documentation',
        description: 'Comprehensive documentation for all available tools'
      },
      {
        name: 'Server Capabilities',
        uri: 'hi-ai://capabilities',
        description: 'Detailed server capabilities and feature breakdown'
      }
    ],
    prompts: [
      {
        name: 'code-review',
        description: 'Comprehensive code analysis using multiple specialized tools'
      },
      {
        name: 'debug-assistant',
        description: 'Systematic debugging with browser tools and memory analysis'
      },
      {
        name: 'project-planning',
        description: 'Complete project planning with PRD generation and roadmapping'
      },
      {
        name: 'memory-management',
        description: 'Intelligent knowledge organization and session management'
      },
      {
        name: 'time-utilities',
        description: 'Time management and scheduling with timezone conversions'
      },
      {
        name: 'semantic-analysis',
        description: 'Advanced semantic code analysis and symbol navigation'
      },
      {
        name: 'sequential-thinking',
        description: 'Structured problem-solving and systematic analysis'
      },
      {
        name: 'browser-development',
        description: 'Web development debugging and client-side monitoring'
      },
      {
        name: 'code-conventions',
        description: 'Code quality validation and improvement suggestions'
      },
      {
        name: 'prompt-enhancement',
        description: 'AI prompt optimization and effectiveness analysis'
      },
      {
        name: 'reasoning-framework',
        description: 'Advanced reasoning and decision-making frameworks'
      },
      {
        name: 'spec-generation',
        description: 'Multi-persona specification generation for comprehensive docs'
      },
      {
        name: 'ui-preview',
        description: 'User interface design and ASCII art preview generation'
      },
      {
        name: 'documentation-generation',
        description: 'Multi-persona documentation generation for comprehensive technical writing'
      },
      {
        name: 'testing-strategy',
        description: 'Comprehensive testing strategy development for quality assurance planning'
      }
    ],
    features: [
      'semantic-code-analysis',
      'memory-management',
      'code-quality-validation',
      'project-planning',
      'prompt-enhancement',
      'ui-preview',
      'reasoning-frameworks',
      'browser-debugging',
      'session-management',
      'completion-support',
      'logging-capabilities',
      'pagination-support',
      'tasks-support'
    ],
    transport: {
      supported: ['stdio', 'http'],
      notes: 'Stdio transport provides secure local communication. HTTP transport available for network access.'
    },
    capabilities: {
      tools: {
        enabled: true,
        listChanged: true,
        pagination: true
      },
      resources: {
        enabled: true,
        listChanged: true,
        pagination: true
      },
      prompts: {
        enabled: true,
        listChanged: true,
        pagination: true
      },
      logging: {
        enabled: true,
        levels: ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency']
      },
      completions: {
        enabled: true,
        supportedReferences: ['ref/prompt', 'ref/resource']
      },
      tasks: {
        enabled: true,
        experimental: true,
        specVersion: '2025-11-25',
        description: 'Durable state machines for long-running operations',
        operations: {
          'tasks/get': 'Get task status by ID',
          'tasks/result': 'Get task result (blocks until terminal status)',
          'tasks/list': 'List all tasks with pagination',
          'tasks/cancel': 'Cancel a running task'
        },
        statuses: ['working', 'input_required', 'completed', 'failed', 'cancelled'],
        terminalStatuses: ['completed', 'failed', 'cancelled'],
        taskEnabledTools: [
          'find_symbol',
          'find_references',
          'analyze_complexity',
          'check_coupling_cohesion',
          'validate_code_quality',
          'suggest_improvements',
          'analyze_requirements',
          'feature_roadmap',
          'generate_prd',
          'apply_reasoning_framework',
          'enhance_prompt_gemini'
        ],
        defaults: {
          ttl: 300000,
          maxTtl: 3600000,
          pollInterval: 5000
        }
      },
      pagination: {
        enabled: true,
        description: 'Cursor-based pagination for list operations',
        supportedOperations: ['tools/list', 'resources/list', 'prompts/list', 'tasks/list'],
        defaults: {
          pageSize: 20,
          maxPageSize: 100
        }
      }
    }
  };
  return JSON.stringify(capabilities, null, 2);
}
