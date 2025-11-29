// Enhance prompts using Gemini API prompting strategies

import { ToolResult, ToolDefinition } from '../../types/tool.js';

export const enhancePromptGeminiDefinition: ToolDefinition = {
  name: 'enhance_prompt_gemini',
  description: 'prompt improvement|gemini strategies|quality improvement|prompt enhancement|gemini strategies|quality improvement - Enhance prompts using Gemini API prompting strategies (Few-Shot, Output Format, Context)',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The original prompt to enhance'
      },
      agent_role: {
        type: 'string',
        description: 'The role of the agent that will receive this prompt (e.g., "Specification Agent", "Planning Agent")'
      },
      strategies: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['few-shot', 'output-format', 'context-placement', 'decomposition', 'parameters']
        },
        description: 'Specific Gemini strategies to apply. If not provided, all strategies will be applied.'
      }
    },
    required: ['prompt']
  },
  annotations: {
    title: 'Enhance Prompt (Gemini Strategies)',
    audience: ['user', 'assistant']
  }
};

interface PromptEnhancement {
  strategy: string;
  description: string;
  applied: string;
  improvement: string;
}

export async function enhancePromptGemini(args: {
  prompt: string;
  agent_role?: string;
  strategies?: string[];
}): Promise<ToolResult> {
  const { prompt, agent_role, strategies } = args;

  const allStrategies = ['few-shot', 'output-format', 'context-placement', 'decomposition', 'parameters'];
  const strategiesToApply = strategies && strategies.length > 0 ? strategies : allStrategies;

  const enhancements: PromptEnhancement[] = [];

  // 1. Few-Shot Examples
  if (strategiesToApply.includes('few-shot')) {
    enhancements.push({
      strategy: 'Add Few-Shot Examples',
      description: 'Add 2-3 high-quality examples to guide the model to learn patterns',
      applied: addFewShotExamples(prompt, agent_role),
      improvement: 'Improve consistency by clarifying format, expression, and scope'
    });
  }

  // 2. Output Format Specification
  if (strategiesToApply.includes('output-format')) {
    enhancements.push({
      strategy: 'Output Format Specification',
      description: 'Specify structured format with XML tags or markdown headers',
      applied: specifyOutputFormat(prompt, agent_role),
      improvement: 'Clarify desired response structure for easier parsing'
    });
  }

  // 3. Context Placement
  if (strategiesToApply.includes('context-placement')) {
    enhancements.push({
      strategy: 'Context Placement Optimization',
      description: 'Place long context before specific requests (Gemini 3 optimization)',
      applied: optimizeContextPlacement(prompt),
      improvement: 'Help model utilize context more effectively'
    });
  }

  // 4. Prompt Decomposition
  if (strategiesToApply.includes('decomposition')) {
    enhancements.push({
      strategy: 'Prompt Decomposition',
      description: 'Decompose complex tasks into multiple steps and chain them',
      applied: decomposePrompt(prompt, agent_role),
      improvement: 'Improve output quality at each step, easier debugging'
    });
  }

  // 5. Parameter Tuning Suggestions
  if (strategiesToApply.includes('parameters')) {
    enhancements.push({
      strategy: 'Parameter Tuning Suggestions',
      description: 'Suggest optimal values for Temperature, Top-K, Top-P, Max Tokens',
      applied: suggestParameters(prompt, agent_role),
      improvement: 'Optimize model behavior for task type'
    });
  }

  const result = {
    original_prompt: prompt,
    agent_role: agent_role || 'Generic Agent',
    strategies_applied: strategiesToApply,
    enhancements,
    enhanced_prompt: combineEnhancements(prompt, enhancements),
    summary: generateSummary(enhancements)
  };

  const output = formatOutput(result);

  return {
    content: [{ type: 'text', text: output }]
  };
}

// Helper methods
function addFewShotExamples(prompt: string, agent_role?: string): string {
  const examples = {
    'Specification Agent': `
**Example 1: Push Notification Settings**
Input: "Let me turn on/off notifications for comments, likes, and follows"
Output:
- Notification types: 6 (comments, likes, follows, announcements, events, marketing)
- Setting method: ON/OFF toggle
- Design reference: iOS Settings > Notifications
- Tech stack: FCM (currently in use)

**Example 2: User Profile Editing**
Input: "Let me change my profile picture and bio"
Output:
- Editable fields: Profile picture, bio, display name
- Validation: Image size < 5MB, bio < 500 chars
- UI pattern: Inline editing (not modal)
- Save method: Auto-save (debounce 500ms)`,

    'Planning Agent': `
**Example 1: API Endpoint Addition**
Input: "User follow/unfollow feature"
Output:
- Phase 1: Backend (8 hours)
  - DB schema (follows table)
  - API endpoints (POST /follows, DELETE /follows/:id)
  - Business logic (duplicate prevention, self-follow prevention)
- Phase 2: Frontend (6 hours)
  - Follow button component
  - Followers/following list
- Cost impact: +$0 (using existing infrastructure)

**Example 2: Real-time Notifications**
Input: "Real-time notification when someone comments"
Output:
- Phase 1: WebSocket server setup (12 hours)
- Phase 2: Client subscription logic (8 hours)
- Phase 3: Notification UI (6 hours)
- Cost impact: +$20/month (Redis Pub/Sub)`
  };

  return examples[agent_role as keyof typeof examples] || `
**Add Few-Shot examples matching the task type**:
- Example 1: [Specific input] → [Clear output]
- Example 2: [Different input format] → [Consistent output format]
- Example 3: [Edge case] → [How to handle]

**Guidelines**:
- 2-3 examples (avoid overfitting)
- Include diverse scenarios
- Maintain consistent output format`;
}

function specifyOutputFormat(prompt: string, agent_role?: string): string {
  const formats = {
    'Specification Agent': `
**Output Format (Markdown + YAML frontmatter)**:

\`\`\`markdown
---
title: [Feature Name]
priority: [HIGH/MEDIUM/LOW]
created: [Date]
---

# SPEC: [Feature Name]

## REQ-001: [Requirement Title]
**WHEN** [Condition]
**THEN** [Result]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
\`\`\`

**Response prefix**: Start with "# SPEC: " to guide model to complete in correct format`,

    'Planning Agent': `
**Output Format (Structured Markdown)**:

\`\`\`markdown
# PLAN: [Feature Name]

## Architecture
- Backend: [Tech Stack]
- Frontend: [Tech Stack]
- Database: [Schema Changes]

## Timeline
| Phase | Tasks | Duration |
|-------|-------|----------|
| 1     | ...   | 8h       |

## Cost Analysis
- Infrastructure: +$X/month
- Third-party: +$Y/month
- Total: +$Z/month
\`\`\`

**Response prefix**: Start with "# PLAN: "`
  };

  return formats[agent_role as keyof typeof formats] || `
**Output Format Specification**:
- Separate sections with markdown headers (##, ###)
- Use tables, bullet points, checkboxes
- Optionally label semantic components with XML tags
  e.g.: <analysis>...</analysis>, <recommendation>...</recommendation>
- Use response prefix to guide completion
  e.g.: Starting with "Analysis result: " makes model complete with analysis content`;
}

function optimizeContextPlacement(prompt: string): string {
  return `
**Context Placement Optimization (Gemini 3 Recommended)**:

1. **Place long context first**:
\`\`\`
[Tech stack info (CLAUDE.md content)]
[Existing codebase structure]
[Related SPEC/PLAN documents]

--- Specific request below ---

[User's specific question or task]
\`\`\`

2. **Structure context**:
- Group by category (tech stack, architecture, business logic)
- Emphasize important constraints repeatedly
- Label clearly for reference

3. **Place explicit instructions**:
- Specific task instructions after context
- Step-by-step guidelines (1, 2, 3...)
- Output format examples`;
}

function decomposePrompt(prompt: string, agent_role?: string): string {
  const isComplex = prompt.length > 200 || prompt.includes('and') || prompt.includes('also') || prompt.includes('and');

  if (!isComplex) {
    return '**Prompt decomposition not needed**: Simple task, single prompt is sufficient.';
  }

  return `
**Prompt Decomposition (Sequential Chain)**:

**Step 1: Information Gathering**
\`\`\`
Prompt: Identify required information for "${prompt.slice(0, 100)}..."
Output: List of required tech stack, constraints, prerequisite tasks
\`\`\`

**Step 2: Analysis and Planning**
\`\`\`
Prompt: Create implementation plan based on Step 1 information.
Input: [Step 1 output]
Output: Phase-by-phase tasks, timeline, risks
\`\`\`

**Step 3: Detailed Task Generation**
\`\`\`
Prompt: Decompose Step 2 plan into actionable tasks.
Input: [Step 2 output]
Output: Task list (with dependencies)
\`\`\`

**Benefits**:
- Improved output quality at each step
- Intermediate validation possible
- Re-run only specific step on error`;
}

function suggestParameters(prompt: string, agent_role?: string): string {
  const isCreative = prompt.includes('design') || prompt.includes('idea') || prompt.includes('suggest');
  const isDeterministic = prompt.includes('analyze') || prompt.includes('calculate') || prompt.includes('verify');

  let temperature = 1.0; // Gemini 3 default
  let topP = 0.95;
  let topK = 40;

  if (isCreative) {
    temperature = 1.0;
    topP = 0.95;
  } else if (isDeterministic) {
    temperature = 0.2;
    topP = 0.8;
    topK = 20;
  }

  return `
**Recommended Parameters** (Based on task characteristics):

- **Temperature**: ${temperature}
  ${temperature > 0.7 ? 'Suitable for creative tasks (explore diverse options)' : 'Suitable for deterministic tasks (consistent output)'}

- **Top-P**: ${topP}
  Select tokens up to ${topP * 100}% cumulative probability

- **Top-K**: ${topK}
  Consider only top ${topK} tokens

- **Max Output Tokens**: ${agent_role === 'Specification Agent' ? '4000 (detailed document)' : '2000 (general)'}

- **Stop Sequences**: ["---END---", "\`\`\`"] (optional)

**Note**:
- Gemini 3 recommends keeping temperature at default 1.0
- Avoid deviating significantly from defaults to prevent unexpected behavior`;
}

function combineEnhancements(prompt: string, enhancements: PromptEnhancement[]): string {
  let enhanced = `# Enhanced Prompt\n\n`;
  enhanced += `## Original Request\n${prompt}\n\n`;
  enhanced += `---\n\n`;

  enhancements.forEach((e, i) => {
    enhanced += `## Enhancement ${i + 1}: ${e.strategy}\n\n`;
    enhanced += `${e.applied}\n\n`;
  });

  return enhanced;
}

function generateSummary(enhancements: PromptEnhancement[]): string {
  return `Applied ${enhancements.length} Gemini prompting strategies to improve prompt quality:
${enhancements.map(e => `- ${e.strategy}: ${e.improvement}`).join('\n')}`;
}

function formatOutput(result: any): string {
  let output = `# Gemini Prompt Enhancement\n\n`;
  output += `**Original Prompt**: ${result.original_prompt}\n`;
  output += `**Target Agent**: ${result.agent_role}\n`;
  output += `**Applied Strategies**: ${result.strategies_applied.join(', ')}\n\n`;
  output += `---\n\n`;

  result.enhancements.forEach((e: PromptEnhancement, i: number) => {
    output += `## ${i + 1}. ${e.strategy}\n\n`;
    output += `**Description**: ${e.description}\n\n`;
    output += `**Applied Content**:\n${e.applied}\n\n`;
    output += `**Improvement Effect**: ${e.improvement}\n\n`;
    output += `---\n\n`;
  });

  output += `## Enhanced Prompt\n\n`;
  output += '```markdown\n' + result.enhanced_prompt + '\n```\n\n';
  output += `## Summary\n\n${result.summary}`;

  return output;
}
