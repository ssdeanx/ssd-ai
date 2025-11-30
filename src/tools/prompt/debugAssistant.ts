import { PromptDefinition, PromptResult } from '../../types/prompt';

export const debugAssistantDefinition: PromptDefinition = {
  name: 'debug-assistant',
  description: 'Comprehensive debugging assistant using browser tools, memory analysis, and systematic debugging approaches',
  arguments: [
    {
      name: 'error_message',
      description: 'The error message or issue description',
      required: true
    },
    {
      name: 'code_context',
      description: 'Relevant code context or stack trace',
      required: false
    },
    {
      name: 'environment',
      description: 'Runtime environment (browser, node, etc.)',
      required: false
    },
    {
      name: 'reproduction_steps',
      description: 'Steps to reproduce the issue',
      required: false
    }
  ]
};

export function getDebugAssistantPrompt(
  errorMessage: string,
  codeContext: string = 'No additional context provided',
  environment: string = 'unknown',
  reproductionSteps: string = 'No reproduction steps provided'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I'm encountering this error/issue: "${errorMessage}"

Environment: ${environment}
Code Context/Stack Trace:
${codeContext}

Reproduction Steps:
${reproductionSteps}

Please help me debug this issue using a systematic approach with all available debugging tools:

## Systematic Debugging Process:

### 1. **Error Analysis & Categorization** (analyze_problem, step_by_step_analysis)
- Parse the error message for clues about the problem type
- Categorize the error (syntax, runtime, logic, environment, etc.)
- Identify the error location and context

### 2. **Browser/Network Debugging** (if applicable)
Use browser development tools when environment includes web:
- **Console Monitoring** (monitor_console_logs): Capture console output, errors, and warnings
- **Network Inspection** (inspect_network_requests): Check for failed requests, timeouts, or incorrect responses
- Analyze network timing and response data

### 3. **Code Analysis & Tracing**
- **Semantic Analysis** (find_symbol, find_references): Trace variable/function usage
- **Memory Analysis** (recall_memory, search_memories): Check if related issues occurred before
- **Complexity Check** (analyze_complexity): Identify if complexity is causing issues

### 4. **State & Context Investigation**
- **Session Context** (restore_session_context): Check recent state changes
- **Memory Search** (search_memories): Look for similar issues or patterns
- **Auto-save Analysis** (auto_save_context): Review recent context checkpoints

### 5. **Root Cause Analysis** (break_down_problem, think_aloud_process)
- Break down the problem into smaller components
- Use systematic reasoning to identify likely causes
- Consider edge cases and race conditions

### 6. **Solution Development** (format_as_plan, apply_reasoning_framework)
- Develop step-by-step fix approach
- Consider multiple solution options
- Evaluate trade-offs and risks

### 7. **Testing & Validation**
- Create test cases to verify the fix
- Plan regression testing
- Document the solution for future reference

## Required Analysis Output:

**Error Classification:**
- Type: [Syntax/Runtime/Logic/Environment/Other]
- Severity: [Critical/High/Medium/Low]
- Component: [Specific module/function affected]

**Root Cause Hypothesis:**
1. Most likely cause with evidence
2. Alternative explanations
3. Confidence level in analysis

**Debugging Steps Performed:**
- Tools used and their findings
- Key discoveries or eliminations
- Dead ends explored

**Recommended Solution:**
- Step-by-step fix instructions
- Code changes required
- Testing approach

**Prevention Measures:**
- How to avoid this issue in the future
- Additional monitoring or logging suggestions
- Code improvements to prevent similar issues

**Confidence Level:** [High/Medium/Low] - Explain reasoning`
        }
      }
    ]
  };
}
