import { ResourceDefinition } from '../../types/resource';

export const toolDocumentationDefinition: ResourceDefinition = {
  uri: 'hi-ai://tool-documentation',
  name: 'Hi-AI Tool Documentation',
  description: 'Comprehensive documentation for all available development tools and their usage',
  mimeType: 'text/markdown'
};

export function getToolDocumentationContent(): string {
  return `# Hi-AI Development Tools Documentation

This document provides comprehensive documentation for all 36+ specialized tools available in the Hi-AI MCP server, organized by category with usage examples and best practices.

## Table of Contents

1. [Time Utility Tools](#time-utility-tools)
2. [Semantic Code Analysis Tools](#semantic-code-analysis-tools)
3. [Sequential Thinking Tools](#sequential-thinking-tools)
4. [Browser Development Tools](#browser-development-tools)
5. [Memory Management Tools](#memory-management-tools)
6. [Code Convention Tools](#code-convention-tools)
7. [Project Planning Tools](#project-planning-tools)
8. [Prompt Enhancement Tools](#prompt-enhancement-tools)
9. [Reasoning Framework Tools](#reasoning-framework-tools)
10. [UI Preview Tools](#ui-preview-tools)

## Time Utility Tools

### get_current_time
**Purpose:** Get current time in various formats and timezones

**Parameters:**
- \`format\` (optional): Output format - 'iso', 'local', 'utc', 'timestamp', 'human'
- \`timezone\` (optional): IANA timezone identifier

**Example Usage:**
\`\`\`json
{
  "format": "human",
  "timezone": "America/New_York"
}
\`\`\`

**Best Practices:**
- Use 'iso' for API timestamps
- Use 'human' for user-facing displays
- Always specify timezone for consistency

## Semantic Code Analysis Tools

### find_symbol
**Purpose:** Locate symbol definitions in codebases

**Parameters:**
- \`symbolName\` (required): Name of the symbol to find
- \`projectPath\` (required): Root directory of the project
- \`symbolType\` (optional): Type filter - 'all', 'function', 'class', 'interface', 'variable', 'type'

**Example Usage:**
\`\`\`json
{
  "symbolName": "UserService",
  "projectPath": "/path/to/project",
  "symbolType": "class"
}
\`\`\`

### find_references
**Purpose:** Find all references to a symbol

**Parameters:**
- \`symbolName\` (required): Symbol name
- \`projectPath\` (required): Project root path
- \`filePath\` (optional): Specific file to search in
- \`line\` (optional): Line number for context

**Best Practices:**
- Use with find_symbol for complete symbol analysis
- Combine with code review workflows
- Useful for refactoring impact analysis

## Sequential Thinking Tools

### create_thinking_chain
**Purpose:** Generate structured thinking sequences

**Parameters:**
- \`topic\` (required): Topic to think about
- \`steps\` (optional): Number of thinking steps (default: 5)

### analyze_problem
**Purpose:** Break down complex problems systematically

**Parameters:**
- \`problem\` (required): Problem description
- \`domain\` (optional): Problem domain context

### step_by_step_analysis
**Purpose:** Perform detailed step-by-step analysis

**Parameters:**
- \`task\` (required): Task to analyze
- \`context\` (optional): Additional context
- \`detailLevel\` (optional): 'basic', 'detailed', 'comprehensive'

### break_down_problem
**Purpose:** Decompose complex problems into sub-problems

**Parameters:**
- \`problem\` (required): Complex problem
- \`maxDepth\` (optional): Maximum breakdown depth
- \`approach\` (optional): 'sequential', 'hierarchical', 'dependency-based'

### think_aloud_process
**Purpose:** Generate verbalized reasoning process

**Parameters:**
- \`scenario\` (required): Scenario to think through
- \`perspective\` (optional): 'analytical', 'creative', 'systematic', 'critical'
- \`verbosity\` (optional): 'concise', 'moderate', 'verbose'

### format_as_plan
**Purpose:** Convert content into structured plans

**Parameters:**
- \`content\` (required): Content to format
- \`priority\` (optional): Default priority level
- \`includeTimeEstimates\` (optional): Include time estimates
- \`includeCheckboxes\` (optional): Include completion checkboxes

## Browser Development Tools

### monitor_console_logs
**Purpose:** Monitor browser console output

**Parameters:**
- \`url\` (required): URL to monitor
- \`logLevel\` (optional): 'all', 'error', 'warn', 'info', 'debug'
- \`duration\` (optional): Monitoring duration in seconds

### inspect_network_requests
**Purpose:** Analyze network requests and responses

**Parameters:**
- \`url\` (required): URL to inspect
- \`filterType\` (optional): 'all', 'xhr', 'fetch', 'websocket', 'failed'
- \`includeHeaders\` (optional): Include request/response headers

**Best Practices:**
- Use for debugging API integrations
- Monitor for performance bottlenecks
- Check for security vulnerabilities in requests

## Memory Management Tools

### save_memory
**Purpose:** Store information in long-term memory

**Parameters:**
- \`key\` (required): Unique identifier
- \`value\` (required): Information to store
- \`category\` (optional): 'project', 'personal', 'code', 'notes'

### recall_memory
**Purpose:** Retrieve stored information

**Parameters:**
- \`key\` (required): Memory key to retrieve
- \`category\` (optional): Category filter

### list_memories
**Purpose:** List all stored memories

**Parameters:**
- \`category\` (optional): Filter by category
- \`limit\` (optional): Maximum results

### search_memories
**Purpose:** Search memories by content

**Parameters:**
- \`query\` (required): Search query
- \`category\` (optional): Category filter

### update_memory
**Purpose:** Modify existing memory

**Parameters:**
- \`key\` (required): Memory key
- \`value\` (required): New value
- \`append\` (optional): Append to existing value

### auto_save_context
**Purpose:** Automatically save and compress context

**Parameters:**
- \`urgency\` (required): 'low', 'medium', 'high', 'critical'
- \`contextType\` (required): Context type
- \`sessionId\` (optional): Session identifier

### restore_session_context
**Purpose:** Restore previous session state

**Parameters:**
- \`sessionId\` (required): Session to restore
- \`restoreLevel\` (optional): 'essential', 'detailed', 'complete'

### prioritize_memory
**Purpose:** Prioritize memories by importance

**Parameters:**
- \`currentTask\` (required): Current task description
- \`criticalDecisions\` (optional): Critical decisions array
- \`codeChanges\` (optional): Important code changes

### start_session
**Purpose:** Initialize a new work session

**Parameters:**
- \`sessionName\` (optional): Session identifier
- \`initialContext\` (optional): Starting context

## Code Convention Tools

### get_coding_guide
**Purpose:** Retrieve coding standards and guidelines

**Parameters:**
- \`language\` (optional): Programming language
- \`category\` (optional): Guide category

### apply_quality_rules
**Purpose:** Apply coding quality rules

**Parameters:**
- \`code\` (required): Code to analyze
- \`language\` (required): Programming language
- \`rules\` (optional): Specific rules to apply

### validate_code_quality
**Purpose:** Comprehensive code quality validation

**Parameters:**
- \`code\` (required): Code to validate
- \`language\` (required): Programming language
- \`standards\` (optional): Quality standards to check

### analyze_complexity
**Purpose:** Measure code complexity metrics

**Parameters:**
- \`code\` (required): Code to analyze
- \`language\` (required): Programming language
- \`metrics\` (optional): Specific metrics to calculate

### check_coupling_cohesion
**Purpose:** Analyze module coupling and cohesion

**Parameters:**
- \`code\` (required): Code to analyze
- \`language\` (required): Programming language
- \`analysisType\` (optional): 'coupling', 'cohesion', 'both'

### suggest_improvements
**Purpose:** Generate code improvement suggestions

**Parameters:**
- \`code\` (required): Code to analyze
- \`language\` (required): Programming language
- \`focusAreas\` (optional): Areas to focus on

## Project Planning Tools

### generate_prd
**Purpose:** Create Product Requirements Document

**Parameters:**
- \`productIdea\` (required): Product concept
- \`targetAudience\` (optional): Target users
- \`constraints\` (optional): Project constraints

### create_user_stories
**Purpose:** Generate user stories from requirements

**Parameters:**
- \`requirements\` (required): Product requirements
- \`format\` (optional): Story format
- \`includeAcceptance\` (optional): Include acceptance criteria

### analyze_requirements
**Purpose:** Analyze and refine requirements

**Parameters:**
- \`requirements\` (required): Requirements to analyze
- \`analysisType\` (optional): Analysis approach
- \`stakeholders\` (optional): Stakeholder perspectives

### feature_roadmap
**Purpose:** Create feature development roadmap

**Parameters:**
- \`features\` (required): Feature list
- \`timeline\` (optional): Timeline constraints
- \`priorities\` (optional): Feature priorities

## Prompt Enhancement Tools

### enhance_prompt
**Purpose:** Improve prompt effectiveness

**Parameters:**
- \`prompt\` (required): Original prompt
- \`context\` (optional): Usage context
- \`improvementType\` (optional): Type of enhancement

### analyze_prompt
**Purpose:** Analyze prompt quality and effectiveness

**Parameters:**
- \`prompt\` (required): Prompt to analyze
- \`criteria\` (optional): Analysis criteria
- \`benchmark\` (optional): Comparison prompts

### enhance_prompt_gemini
**Purpose:** Enhance prompts using Gemini strategies

**Parameters:**
- \`prompt\` (required): Prompt to enhance
- \`strategy\` (optional): Enhancement strategy
- \`domain\` (optional): Application domain

## Reasoning Framework Tools

### apply_reasoning_framework
**Purpose:** Apply structured reasoning frameworks

**Parameters:**
- \`problem\` (required): Problem to analyze
- \`framework\` (optional): Reasoning framework to use
- \`depth\` (optional): Analysis depth

## UI Preview Tools

### preview_ui_ascii
**Purpose:** Generate ASCII art UI previews

**Parameters:**
- \`description\` (required): UI description
- \`style\` (optional): Preview style
- \`detailLevel\` (optional): Detail level

## Best Practices for Tool Usage

### 1. **Tool Sequencing**
- Use analysis tools before making changes
- Combine semantic analysis with quality checks
- Apply thinking frameworks for complex decisions

### 2. **Memory Management**
- Save important decisions and solutions
- Use session management for continuous work
- Search memory before reinventing solutions

### 3. **Code Quality Workflow**
1. validate_code_quality
2. analyze_complexity
3. check_coupling_cohesion
4. suggest_improvements

### 4. **Debugging Workflow**
1. analyze_problem
2. monitor_console_logs (if web)
3. inspect_network_requests (if applicable)
4. search_memories for similar issues

### 5. **Planning Workflow**
1. analyze_requirements
2. generate_prd
3. create_user_stories
4. feature_roadmap

## Integration Examples

### Code Review Process
\`\`\`json
{
  "sequence": [
    "validate_code_quality",
    "analyze_complexity",
    "find_symbol",
    "find_references",
    "suggest_improvements"
  ]
}
\`\`\`

### New Feature Development
\`\`\`json
{
  "sequence": [
    "analyze_requirements",
    "create_user_stories",
    "apply_reasoning_framework",
    "format_as_plan",
    "save_memory"
  ]
}
\`\`\`

This documentation is automatically maintained and reflects the current tool capabilities. For the latest updates, always check the tool definitions directly.`;
}
