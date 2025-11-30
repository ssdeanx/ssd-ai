import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const projectPlanningDefinition: PromptDefinition = {
  name: 'project-planning',
  description: 'Comprehensive project planning using specialized planning tools for PRD generation, requirements analysis, and roadmap creation',
  arguments: [
    {
      name: 'project_idea',
      description: 'Brief description of the project idea or concept',
      required: true
    },
    {
      name: 'target_audience',
      description: 'Target users or audience for the project',
      required: false
    },
    {
      name: 'constraints',
      description: 'Technical, budget, or timeline constraints',
      required: false
    },
    {
      name: 'existing_context',
      description: 'Any existing code, documentation, or project context',
      required: false
    }
  ]
};

export function getProjectPlanningPrompt(
  projectIdea: string,
  targetAudience: string = 'General users',
  constraints: string = 'No specific constraints',
  existingContext: string = 'No existing context provided'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please create a comprehensive project plan for the following project idea using all available planning tools:

**Project Idea:** ${projectIdea}
**Target Audience:** ${targetAudience}
**Constraints:** ${constraints}
**Existing Context:** ${existingContext}

Use these specialized planning tools in sequence for thorough project planning:

## Planning Process:

### 1. **Requirements Analysis** (analyze_requirements)
- Break down the project idea into functional and non-functional requirements
  - Identify key stakeholders and their needs
    - Analyze technical feasibility and dependencies
      - Consider scalability, security, and performance requirements

### 2. **PRD Generation** (generate_prd)
- Create a comprehensive Product Requirements Document
  - Define product vision, goals, and success metrics
    - Specify detailed feature requirements with acceptance criteria
      - Include user stories, use cases, and technical specifications

### 3. **User Story Creation** (create_user_stories)
- Break down requirements into detailed, actionable user stories
  - Define acceptance criteria for each story
    - Estimate complexity and effort for prioritization
      - Ensure stories follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)

### 4. **Feature Roadmap** (feature_roadmap)
- Create a phased development roadmap with milestones
  - Prioritize features based on value, effort, and dependencies
    - Define release cycles and sprint planning
      - Include risk assessment and mitigation strategies

### 5. **Technical Architecture Planning** (apply_reasoning_framework)
- Design system architecture and technology stack
  - Consider design patterns and architectural decisions
    - Plan for testing, deployment, and monitoring
      - Evaluate trade-offs and technical debt considerations

### 6. **Risk Assessment & Mitigation** (break_down_problem, think_aloud_process)
- Identify potential risks and challenges
  - Develop contingency plans and mitigation strategies
    - Consider edge cases and failure scenarios
      - Plan for quality assurance and validation

### 7. **Resource & Timeline Planning** (format_as_plan)
- Estimate development effort and timeline
  - Identify required team skills and resources
    - Create detailed project timeline with dependencies
      - Plan for iterative development and feedback cycles

## Required Deliverables:

**Executive Summary:**
- Project overview and business case
- High-level objectives and success criteria
- Key assumptions and constraints

**Requirements Specification:**
- Functional requirements with detailed descriptions
- Non-functional requirements (performance, security, etc.)
- Technical requirements and dependencies

**Product Roadmap:**
- Feature prioritization and release planning
- Development phases and milestones
- Risk assessment and mitigation plans

**Implementation Plan:**
- Technology stack and architecture decisions
- Development methodology and processes
- Quality assurance and testing strategy

**Success Metrics:**
- Key performance indicators (KPIs)
- Success criteria and validation methods
- Monitoring and measurement approach

**Resource Requirements:**
- Team composition and skill requirements
- Development timeline and budget estimates
- Infrastructure and tooling needs

Provide a complete project plan document that can be used to initiate development immediately.`
        }
      }
    ]
  };
}
