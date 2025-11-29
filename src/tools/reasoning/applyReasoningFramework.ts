// Apply 9-step reasoning framework to complex problems

import { ToolResult, ToolDefinition } from '../../types/tool.js';

export const applyReasoningFrameworkDefinition: ToolDefinition = {
  name: 'apply_reasoning_framework',
  description: 'reasoning framework|systematic analysis|logical thinking|structured reasoning|methodical approach - Apply 9-step reasoning framework to analyze complex problems systematically',
  inputSchema: {
    type: 'object',
    properties: {
      problem: {
        type: 'string',
        description: 'The problem or task to analyze using the reasoning framework'
      },
      context: {
        type: 'string',
        description: 'Additional context about the problem (project constraints, tech stack, etc.)'
      },
      focus_steps: {
        type: 'array',
        items: { type: 'number' },
        description: 'Specific framework steps to focus on (1-9). If not provided, all steps will be applied.'
      }
    },
    required: ['problem']
  },
  annotations: {
    title: 'Apply Reasoning Framework',
    audience: ['user', 'assistant']
  }
};

interface ReasoningStep {
  step: number;
  title: string;
  description: string;
  questions: string[];
  output: string;
}

export async function applyReasoningFramework(args: {
  problem: string;
  context?: string;
  focus_steps?: number[];
}): Promise<ToolResult> {
  const { problem, context, focus_steps } = args;

  const allSteps: ReasoningStep[] = [
    {
      step: 1,
      title: 'Logical Dependencies and Constraints',
      description: 'Analyze policies, task order, prerequisites, and user constraints by priority',
      questions: [
        'What policies or mandatory rules apply?',
        'Does the task order need to be rearranged? (Check prerequisites)',
        'What prerequisites or information are needed?',
        'Are there explicit user constraints?',
        'How do these affect the approach?',
        'What is the priority order among these constraints?'
      ],
      output: analyzeConstraints(problem, context)
    },
    {
      step: 2,
      title: 'Risk Assessment',
      description: 'Evaluate consequences of actions and potential future issues',
      questions: [
        'Could this action cause problems in the future?',
        'Is this an exploration or implementation task? (Determines risk level)',
        'What are the compatibility, security, and performance risks?',
        'Is rollback possible?',
        'How can risks be mitigated?',
        'What is the overall risk level? (Low, Medium, High)'
      ],
      output: assessRisks(problem, context)
    },
    {
      step: 3,
      title: 'Inductive Reasoning and Hypothesis Exploration',
      description: 'Generate and prioritize hypotheses about root causes',
      questions: [
        'What is the root cause beyond the immediate cause?',
        'How will each hypothesis be verified?',
        'Have low-probability causes been considered?',
        'What is the priority order for verifying hypotheses?'
      ],
      output: generateHypotheses(problem, context)
    },
    {
      step: 4,
      title: 'Result Evaluation and Adaptability',
      description: 'Adjust plans based on observations',
      questions: [
        'Do previous observations require plan changes?',
        'If a hypothesis was disproven, has a new one been generated?',
        'If a dead end was reached, is backtracking needed?',
        'Is the overall plan still valid or does it need re-evaluation?',
        'How complex is the problem and what adaptation strategy is appropriate?',
        'Are there multiple parts to the problem requiring partial pivots?',
        'What context considerations affect adaptability?'
      ],
      output: evaluateAdaptability(problem, context)
    },
    {
      step: 5,
      title: 'Information Availability',
      description: 'Identify and utilize all information sources',
      questions: [
        'What tools are available? (MCP, file system, Git, etc.)',
        'What policy/rule documents should be referenced? (CLAUDE.md, constitution.md)',
        'Has relevant information been found from previous conversations or memory?',
        'What information should be asked from the user?',
        'Are there any additional context details needed?',
        'Have all relevant information sources been reviewed?'
      ],
      output: identifyInformationSources(problem, context)
    },
    {
      step: 6,
      title: 'Precision and Evidence',
      description: 'Provide accurate evidence for claims',
      questions: [
        'When referencing policies, are they cited accurately?',
        'When referencing code, is filename:line specified?',
        'Are numbers and metrics accurate?',
        'Is evidence provided for all claims?',
        'Are specific precision metrics included where relevant?',
        'Is context cited when relevant?'
      ],
      output: ensurePrecision(problem, context)
    },
    {
      step: 7,
      title: 'Completeness',
      description: 'Integrate all requirements, options, and preferences',
      questions: [
        'Have conflicting requirements been resolved by priority?',
        'Was an early conclusion avoided? (Consider multiple options)',
        'Have all relevant information sources been reviewed?',
        'Has user confirmation been sought for uncertain parts?',
        'Are all aspects of the problem addressed?',
        'Have specific completeness checks been performed where relevant?',
        'Are context requirements fully integrated?'
      ],
      output: ensureCompleteness(problem, context)
    },
    {
      step: 8,
      title: 'Persistence and Patience',
      description: 'Do not give up until all reasoning is exhausted',
      questions: [
        'Have transient errors been retried?',
        'Has a clear limit (retry limit, timeout) been reached?',
        'Has the strategy been changed without repeating the same failure?',
        'Is escalation necessary after all alternatives have been explored?',
        'What is the estimated effort required?',
        'Are there urgency or blocking considerations?',
        'What level of persistence is appropriate?',
        'How can persistence be demonstrated effectively?'
      ],
      output: demonstratePersistence(problem, context)
    },
    {
      step: 9,
      title: 'Response Inhibition',
      description: 'Act only after reasoning is complete',
      questions: [
        'Has all the above reasoning been completed?',
        'Has the reasoning process been documented?',
        'Is only one major action being performed at a time?',
        'Is the final output clear and well-structured?',
        'Has the response been reviewed for completeness and accuracy?',
        'Is the output easy to understand?',
        'Are there any ambiguities that need clarification?',
        'Is the format appropriate for the user?',
        'Have all instructions been followed precisely?',
        'Is unnecessary information avoided?'
      ],
      output: planExecution(problem, context)
    }
  ];

  // Filter steps if focus_steps is provided
  const stepsToApply = focus_steps && focus_steps.length > 0
    ? allSteps.filter(s => focus_steps.includes(s.step))
    : allSteps;

  const result = {
    problem,
    context: context || 'No additional context provided',
    steps_applied: stepsToApply.length,
    framework_steps: stepsToApply,
    summary: generateSummary(problem, stepsToApply)
  };

  const output = formatOutput(result);

  return {
    content: [{ type: 'text', text: output }]
  };
}

// Helper methods
function analyzeConstraints(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const hasDbTask = problemLower.includes('database') || problemLower.includes('db') || problemLower.includes('sql');
  const hasApiTask = problemLower.includes('api') || problemLower.includes('endpoint') || problemLower.includes('backend');
  const hasFrontendTask = problemLower.includes('ui') || problemLower.includes('frontend') || problemLower.includes('component');
  
  const taskOrder = [];
  if (hasDbTask) taskOrder.push('Database');
  if (hasApiTask) taskOrder.push('Backend/API');
  if (hasFrontendTask) taskOrder.push('Frontend/UI');
  
  const contextInfo = context
    ? `Project context provided: "${context.slice(0, 100)}${context.length > 100 ? '...' : ''}"`
    : 'No context provided - check AGENTS.md, constitution.md';

  return `**Constraint Analysis**:
- Problem: "${problem.slice(0, 80)}${problem.length > 80 ? '...' : ''}"
- Policies/Rules: ${contextInfo}
- Task Order: ${taskOrder.length > 0 ? taskOrder.join(' → ') : 'Single task - no ordering needed'}
- Prerequisites: Verify required info/tools for this task
- User Constraints: Apply explicit requests first`;
}

function assessRisks(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const isExploration = problemLower.includes('find') ||
                        problemLower.includes('analyze') ||
                        problemLower.includes('check') ||
                        problemLower.includes('search') ||
                        problemLower.includes('investigate');

  const hasDbOps = problemLower.includes('database') || problemLower.includes('sql') || problemLower.includes('query');
  const hasAuthOps = problemLower.includes('auth') || problemLower.includes('login') || problemLower.includes('password');
  const hasFileOps = problemLower.includes('file') || problemLower.includes('upload') || problemLower.includes('delete');

  const securityRisks = [];
  if (hasDbOps) securityRisks.push('SQL Injection');
  if (hasAuthOps) securityRisks.push('Authentication bypass, credential exposure');
  if (hasFileOps) securityRisks.push('Path traversal, unauthorized access');
  if (securityRisks.length === 0) securityRisks.push('General XSS, CSRF checks');
  
  const contextRisk = context?.toLowerCase().includes('production') ? 'HIGH - Production environment' :
                      context?.toLowerCase().includes('critical') ? 'HIGH - Critical system' : 'Standard';

  return `**Risk Assessment**:
- Problem: "${problem.slice(0, 60)}${problem.length > 60 ? '...' : ''}"
- Task Type: ${isExploration ? 'Exploration task (low risk)' : 'Implementation task (high risk)'}
- Environment Risk: ${contextRisk}
- Rollback Possibility: ${isExploration ? 'High' : 'Needs verification'}
- Compatibility Risk: Review potential conflicts with existing code
- Security Risk: ${securityRisks.join(', ')}
- Performance Risk: Review N+1 queries, memory leaks, unnecessary re-renders`;
}

function generateHypotheses(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const isError = problemLower.includes('error') || problemLower.includes('bug') || problemLower.includes('fail');
  const isFeature = problemLower.includes('implement') || problemLower.includes('create') || problemLower.includes('add');
  const isPerformance = problemLower.includes('slow') || problemLower.includes('performance') || problemLower.includes('optimize');
  
  let hypothesis1, hypothesis2, hypothesis3;
  
  if (isError) {
    hypothesis1 = { cause: 'Code logic error in the immediate area', verification: 'Debug and trace execution flow' };
    hypothesis2 = { cause: 'Data/state inconsistency from external source', verification: 'Check input data and state' };
    hypothesis3 = { cause: 'Environment or dependency version mismatch', verification: 'Compare environments' };
  } else if (isPerformance) {
    hypothesis1 = { cause: 'Inefficient algorithm or query (N+1, missing index)', verification: 'Profile and analyze queries' };
    hypothesis2 = { cause: 'Unnecessary re-renders or computations', verification: 'Use profiling tools' };
    hypothesis3 = { cause: 'Network latency or external service bottleneck', verification: 'Check network traces' };
  } else if (isFeature) {
    hypothesis1 = { cause: 'Requirements need clarification', verification: 'Review specs with stakeholders' };
    hypothesis2 = { cause: 'Integration with existing system needed', verification: 'Analyze current architecture' };
    hypothesis3 = { cause: 'Edge cases not fully considered', verification: 'Create comprehensive test cases' };
  } else {
    hypothesis1 = { cause: `Direct cause related to: ${problem.slice(0, 50)}`, verification: 'Investigate primary area' };
    hypothesis2 = { cause: 'Indirect factors or dependencies', verification: 'Check related systems' };
    hypothesis3 = { cause: 'Edge cases or rare conditions', verification: 'Review edge scenarios' };
  }
  
  const contextNote = context ? `\n- Context consideration: "${context.slice(0, 80)}${context.length > 80 ? '...' : ''}"` : '';

  return `**Hypothesis Generation**:${contextNote}
1. **Hypothesis 1** (Probability: High)
   - Cause: ${hypothesis1.cause}
   - Verification: ${hypothesis1.verification}
2. **Hypothesis 2** (Probability: Medium)
   - Cause: ${hypothesis2.cause}
   - Verification: ${hypothesis2.verification}
3. **Hypothesis 3** (Probability: Low)
   - Cause: ${hypothesis3.cause}
   - Verification: ${hypothesis3.verification}

**Priority**: Verify in order of probability, but don't completely rule out low-probability causes`;
}

function evaluateAdaptability(problem: string, context?: string): string {
  const problemLength = problem.length;
  const complexity = problemLength > 200 ? 'High' : problemLength > 100 ? 'Medium' : 'Low';
  const hasMultipleParts = problem.includes(' and ') || problem.includes(',') || problem.includes(';');
  
  const adaptationStrategy = hasMultipleParts 
    ? 'Multi-part problem - evaluate each part independently, allow partial pivots'
    : 'Single-focus problem - full pivot if approach fails';
  
  const contextConsideration = context 
    ? `Context-aware adaptation: Consider "${context.slice(0, 60)}${context.length > 60 ? '...' : ''}" when pivoting`
    : 'No specific context constraints on adaptation';

  return `**Adaptability Evaluation**:
- Problem Complexity: ${complexity} (${problemLength} chars)
- Adaptation Strategy: ${adaptationStrategy}
- ${contextConsideration}
- Reflect Observations: Check if plan needs modification based on new information
- Update Hypotheses: Discard disproven hypotheses, generate new ones
- Backtracking: Return to previous step and explore different paths when hitting dead ends
- Re-evaluate Plan: Periodically review if the overall approach is still valid`;
}

function identifyInformationSources(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  
  const relevantTools = [];
  if (problemLower.includes('code') || problemLower.includes('implement')) relevantTools.push('code analysis tools');
  if (problemLower.includes('test')) relevantTools.push('testing tools');
  if (problemLower.includes('debug') || problemLower.includes('error')) relevantTools.push('debugging tools');
  if (problemLower.includes('api') || problemLower.includes('http')) relevantTools.push('API testing tools');
  if (problemLower.includes('database') || problemLower.includes('sql')) relevantTools.push('database tools');
  
  const suggestedTools = relevantTools.length > 0
    ? `Suggested for this problem: ${relevantTools.join(', ')}`
    : 'General tools applicable';
  
  const contextSources = context 
    ? `- Context provided: "${context.slice(0, 80)}${context.length > 80 ? '...' : ''}"`
    : '- No context provided - may need to ask user';

  return `**Information Sources**:
- Problem focus: "${problem.slice(0, 60)}${problem.length > 60 ? '...' : ''}"
${contextSources}
1. **Tools**:
   - MCP tools (hi-ai 38 tools)
   - ${suggestedTools}
   - File system (Read, Write, Edit, Glob, Grep)
   - Git, package managers
2. **Policies/Rules**:
   - AGENTS.md (tech stack, architecture)
   - .vibe/constitution.md (project rules)
   - skills/ folder (quality criteria, coding standards)
3. **Memory**:
   - recall_memory (previous session info)
   - restore_session_context (context restoration)
4. **User Confirmation**:
   - Business logic details
   - Design preferences
   - Priority decisions`;
}

function ensurePrecision(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  
  const precisionAreas = [];
  if (problemLower.includes('performance') || problemLower.includes('speed')) {
    precisionAreas.push('Benchmark with exact timing (ms, ops/sec)');
  }
  if (problemLower.includes('memory') || problemLower.includes('size')) {
    precisionAreas.push('Measure exact memory usage (MB, KB)');
  }
  if (problemLower.includes('test') || problemLower.includes('coverage')) {
    precisionAreas.push('Report exact coverage percentage');
  }
  if (problemLower.includes('error') || problemLower.includes('bug')) {
    precisionAreas.push('Include exact error messages and stack traces');
  }
  
  const specificPrecision = precisionAreas.length > 0
    ? `\n- Problem-specific metrics: ${precisionAreas.join('; ')}`
    : '';
  
  const contextPrecision = context
    ? `\n- Context reference: Cite "${context.slice(0, 50)}${context.length > 50 ? '...' : ''}" when relevant`
    : '';

  return `**Ensuring Precision**:
- Problem: "${problem.slice(0, 60)}${problem.length > 60 ? '...' : ''}"${contextPrecision}${specificPrecision}
- Policy Citation: Specify in format "According to CLAUDE.md:12..."
- Code Reference: Include filename:line in format "User model at users.py:45"
- Number Accuracy: Express complexity, coverage, performance metrics as exact values
- Provide Evidence: Clearly state source and evidence for all claims`;
}

function ensureCompleteness(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const words = problem.split(/\s+/);
  const hasMultipleRequirements = words.length > 20 || problem.includes(' and ') || problem.includes(',');

  const completenessChecks = [];
  if (problemLower.includes('create') || problemLower.includes('implement')) {
    completenessChecks.push('All CRUD operations considered?');
  }
  if (problemLower.includes('api') || problemLower.includes('endpoint')) {
    completenessChecks.push('Error handling, validation, auth covered?');
  }
  if (problemLower.includes('ui') || problemLower.includes('frontend')) {
    completenessChecks.push('Loading, error, empty states handled?');
  }
  if (problemLower.includes('test')) {
    completenessChecks.push('Happy path, edge cases, error cases covered?');
  }
  
  const specificChecks = completenessChecks.length > 0
    ? `\n- Specific checks: ${completenessChecks.join(' ')}`
    : '';
  
  const contextCompleteness = context
    ? `\n- Context requirements: Verify all aspects of "${context.slice(0, 60)}${context.length > 60 ? '...' : ''}" addressed`
    : '';

  return `**Ensuring Completeness**:
- Problem scope: ${hasMultipleRequirements ? 'Complex (multiple requirements detected)' : 'Focused (single requirement)'}${contextCompleteness}${specificChecks}
- Conflict Resolution: Policy → Task Order → Prerequisites → User Preferences
- Option Exploration: Review multiple alternatives without early fixation on a single solution
- Information Review: Thoroughly review all relevant information sources (#5)
- User Confirmation: Don't assume uncertain parts, ask for confirmation`;
}

function demonstratePersistence(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const problemLength = problem.length;

  const estimatedEffort = problemLength > 200 ? 'High (complex problem)' : 
                          problemLength > 100 ? 'Medium' : 'Low (straightforward)';

  const isBlocking = problemLower.includes('block') || problemLower.includes('stuck') || problemLower.includes('cannot');
  const isUrgent = context?.toLowerCase().includes('urgent') || context?.toLowerCase().includes('asap');

  const persistenceLevel = isBlocking ? 'Maximum - explore all alternatives before escalating' :
                          isUrgent ? 'Balanced - efficient retries with time awareness' :
                          'Standard - methodical approach with reasonable retries';

  return `**Persistence Strategy**:
- Problem: "${problem.slice(0, 60)}${problem.length > 60 ? '...' : ''}"
- Estimated Effort: ${estimatedEffort}
- Persistence Level: ${persistenceLevel}
- Transient Errors: Retry with exponential backoff (e.g., 1s, 2s, 4s...)
- Recognize Limits: Stop when clear retry limit or timeout is reached
- Change Strategy: Don't repeat same failure → try different approach
- Thorough Analysis: Complete all reasoning steps even if it takes time
- Escalation: Only after exhausting all alternatives`;
}

function planExecution(problem: string, context?: string): string {
  const problemLower = problem.toLowerCase();
  const words = problem.split(/\s+/);

  const actionVerbs = ['create', 'implement', 'fix', 'update', 'delete', 'refactor', 'optimize', 'add', 'remove'];
  const detectedActions = actionVerbs.filter(v => problemLower.includes(v));

  const primaryAction = detectedActions.length > 0
    ? detectedActions[0].charAt(0).toUpperCase() + detectedActions[0].slice(1)
    : 'Execute';

  const estimatedSteps = Math.max(3, Math.min(10, Math.ceil(words.length / 10)));

  const contextAwareness = context 
    ? `\n- Context: Keep "${context.slice(0, 50)}${context.length > 50 ? '...' : ''}" in mind during execution`
    : '';

  return `**Execution Plan**:
- Primary Action: ${primaryAction}
- Estimated Steps: ${estimatedSteps}${contextAwareness}
1. **Document Reasoning**: Briefly explain reasoning process for complex decisions
2. **Step-by-Step Execution**: Perform only one major action at a time
3. **Verify Results**: Confirm results of each action before proceeding to next step
4. **Prepare Rollback**: Be ready to restore to previous state if issues occur`;
}

function generateSummary(problem: string, steps: ReasoningStep[]): string {
  return `Applied 9-step reasoning framework to "${problem}".
Systematically analyzed ${steps.length} steps, comprehensively reviewing logical dependencies, risks, hypotheses, and information sources.`;
}

function formatOutput(result: any): string {
  let output = `# Reasoning Framework Analysis\n\n`;
  output += `**Problem**: ${result.problem}\n`;
  output += `**Context**: ${result.context}\n`;
  output += `**Steps Applied**: ${result.steps_applied}/9\n\n`;
  output += `---\n\n`;

  for (const step of result.framework_steps) {
    output += `## ${step.step}. ${step.title}\n\n`;
    output += `${step.description}\n\n`;
    output += `**Key Questions**:\n`;
    step.questions.forEach((q: string) => {
      output += `- ${q}\n`;
    });
    output += `\n${step.output}\n\n`;
    output += `---\n\n`;
  }

  output += `## Summary\n\n${result.summary}`;

  return output;
}
