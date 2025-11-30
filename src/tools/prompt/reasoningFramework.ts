import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const reasoningFrameworkDefinition: PromptDefinition = {
  name: 'reasoning-framework',
  description: 'Advanced reasoning and decision-making using structured reasoning frameworks for complex problem analysis and systematic thinking',
  arguments: [
    {
      name: 'reasoning_task',
      description: 'The specific reasoning or decision-making task to perform',
      required: true
    },
    {
      name: 'problem_context',
      description: 'Context and background information for the reasoning task',
      required: true
    },
    {
      name: 'reasoning_approach',
      description: 'Preferred reasoning approach (analytical, systematic, creative, critical)',
      required: false
    },
    {
      name: 'complexity_level',
      description: 'Complexity level of the reasoning task (simple, moderate, complex)',
      required: false
    },
    {
      name: 'decision_criteria',
      description: 'Key criteria or factors to consider in the reasoning process',
      required: false
    }
  ]
};

export function getReasoningFrameworkPrompt(
  reasoningTask: string,
  problemContext: string,
  reasoningApproach: string = 'systematic',
  complexityLevel: string = 'moderate',
  decisionCriteria: string = 'comprehensive analysis'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please apply structured reasoning frameworks to analyze and solve the following reasoning task:

**Reasoning Task:** ${reasoningTask}
**Problem Context:** ${problemContext}
**Reasoning Approach:** ${reasoningApproach}
**Complexity Level:** ${complexityLevel}
**Decision Criteria:** ${decisionCriteria}

Use the specialized reasoning framework tool for systematic analysis and decision-making:

## Structured Reasoning Process:

### 1. **Problem Definition & Scope** (apply_reasoning_framework)
- Clearly define the reasoning task and objectives
- Establish scope and boundaries of the analysis
- Identify key stakeholders and perspectives
- Determine success criteria for the reasoning outcome

### 2. **Contextual Analysis**
- Analyze the broader context and environmental factors
- Identify relevant constraints and requirements
- Assess available information and knowledge gaps
- Consider historical precedents and patterns

### 3. **Framework Application**
- Apply appropriate reasoning frameworks based on task complexity
- Use analytical frameworks for data-driven decisions
- Employ systematic frameworks for complex problem-solving
- Apply creative frameworks for innovative solutions

### 4. **Evidence Evaluation**
- Gather and evaluate relevant evidence and data
- Assess credibility and reliability of information sources
- Identify assumptions and validate their reasonableness
- Consider alternative interpretations and viewpoints

### 5. **Logical Analysis**
- Apply logical reasoning and deductive/inductive thinking
- Identify cause-and-effect relationships
- Test hypotheses and scenarios
- Validate conclusions against evidence

### 6. **Risk Assessment**
- Identify potential risks and uncertainties
- Evaluate probability and impact of different outcomes
- Consider mitigation strategies and contingency plans
- Assess decision confidence levels

### 7. **Solution Development**
- Generate potential solutions and alternatives
- Evaluate options against decision criteria
- Consider implementation feasibility and resource requirements
- Develop recommendation rationale

## Required Reasoning Output:

**Problem Analysis:**
- Clear problem definition and scope clarification
- Contextual factors and constraints identification
- Stakeholder analysis and perspective consideration
- Success criteria establishment

**Evidence Assessment:**
- Key evidence and data evaluation
- Source credibility and reliability analysis
- Assumption identification and validation
- Alternative viewpoint consideration

**Logical Framework:**
- Applied reasoning framework description
- Step-by-step logical analysis
- Hypothesis testing and validation
- Conclusion development and justification

**Risk Evaluation:**
- Identified risks and uncertainties
- Probability and impact assessment
- Mitigation strategy development
- Confidence level determination

**Solution Recommendations:**
- Generated solution options and alternatives
- Evaluation against decision criteria
- Implementation feasibility assessment
- Final recommendation with rationale

**Implementation Guidance:**
- Action steps and timeline recommendations
- Resource and support requirements
- Monitoring and adjustment mechanisms
- Success measurement approaches

Provide comprehensive structured reasoning that ensures thorough analysis, logical consistency, and well-supported decision-making for the specified task.`
        }
      }
    ]
  };
}
