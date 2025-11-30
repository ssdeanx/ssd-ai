import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const sequentialThinkingDefinition: PromptDefinition = {
  name: 'sequential-thinking',
  description: 'Structured sequential thinking and problem-solving using specialized thinking tools for systematic analysis, planning, and decision-making',
  arguments: [
    {
      name: 'thinking_task',
      description: 'The specific thinking or problem-solving task to perform',
      required: true
    },
    {
      name: 'domain_context',
      description: 'Domain or context for the thinking task (technical, business, creative, analytical)',
      required: false
    },
    {
      name: 'complexity_level',
      description: 'Complexity level of the task (simple, moderate, complex, very-complex)',
      required: false
    },
    {
      name: 'output_format',
      description: 'Desired output format (analysis, plan, decision-framework, step-by-step)',
      required: false
    },
    {
      name: 'constraints',
      description: 'Any constraints or requirements for the thinking process',
      required: false
    }
  ]
};

export function getSequentialThinkingPrompt(
  thinkingTask: string,
  domainContext: string = 'general',
  complexityLevel: string = 'moderate',
  outputFormat: string = 'comprehensive',
  constraints: string = 'No specific constraints'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please perform structured sequential thinking for the following task using all available thinking tools:

**Thinking Task:** ${thinkingTask}
**Domain Context:** ${domainContext}
**Complexity Level:** ${complexityLevel}
**Output Format:** ${outputFormat}
**Constraints:** ${constraints}

Use these specialized sequential thinking tools for systematic analysis:

## Sequential Thinking Process:

### 1. **Initial Problem Analysis** (analyze_problem)
- Break down the core problem or task into fundamental components
- Identify key variables, constraints, and objectives
- Establish the problem domain and context
- Determine success criteria and evaluation metrics

### 2. **Structured Thinking Chain** (create_thinking_chain)
- Create a logical sequence of thinking steps
- Establish cause-and-effect relationships
- Build progressive reasoning chains
- Identify critical path and dependencies

### 3. **Step-by-Step Analysis** (step_by_step_analysis)
- Perform detailed granular analysis of each component
- Evaluate options and alternatives at each step
- Consider implications and consequences
- Validate assumptions and premises

### 4. **Problem Decomposition** (break_down_problem)
- Break complex problems into manageable sub-problems
- Identify hierarchical relationships and dependencies
- Create modular analysis components
- Establish problem-solving priorities

### 5. **Verbalized Reasoning** (think_aloud_process)
- Articulate the complete reasoning process
- Explain decision-making rationale
- Document assumptions and uncertainties
- Provide transparent problem-solving narrative

### 6. **Structured Planning** (format_as_plan)
- Convert analysis into actionable plans
- Create prioritized task sequences
- Include time estimates and resource requirements
- Establish monitoring and adjustment mechanisms

## Required Sequential Thinking Output:

**Problem Analysis:**
- Core problem decomposition and component identification
- Key variables and constraints analysis
- Success criteria definition
- Domain context validation

**Thinking Chain Development:**
- Logical reasoning sequence construction
- Cause-and-effect relationship mapping
- Critical path identification
- Dependency analysis

**Step-by-Step Breakdown:**
- Detailed component analysis
- Option evaluation and comparison
- Implication assessment
- Assumption validation

**Problem Decomposition:**
- Hierarchical problem structure
- Sub-problem identification and relationships
- Modular analysis framework
- Priority and sequencing rationale

**Reasoning Documentation:**
- Complete thinking process articulation
- Decision rationale explanation
- Assumption documentation
- Uncertainty analysis

**Actionable Plan:**
- Structured implementation plan
- Prioritized task sequencing
- Resource and time estimation
- Monitoring and adjustment framework

Provide comprehensive sequential thinking that ensures thorough analysis, clear reasoning, and actionable outcomes for the specified task within the given constraints.`
        }
      }
    ]
  };
}
