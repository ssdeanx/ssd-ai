import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const memoryManagementDefinition: PromptDefinition = {
  name: 'memory-management',
  description: 'Intelligent memory management and knowledge organization using specialized memory tools for project context and learning',
  arguments: [
    {
      name: 'task_context',
      description: 'Current task or project context that needs memory management',
      required: true
    },
    {
      name: 'memory_operation',
      description: 'Type of memory operation needed (store, retrieve, organize, analyze)',
      required: false
    },
    {
      name: 'importance_level',
      description: 'Importance level of the information (critical, high, medium, low)',
      required: false
    },
    {
      name: 'related_topics',
      description: 'Related topics or categories for better organization',
      required: false
    }
  ]
};

export function getMemoryManagementPrompt(
  taskContext: string,
  memoryOperation: string = 'comprehensive',
  importanceLevel: string = 'medium',
  relatedTopics: string = 'general'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please help manage project knowledge and memory for the following context using all available memory management tools:

**Task Context:** ${taskContext}
**Memory Operation:** ${memoryOperation}
**Importance Level:** ${importanceLevel}
**Related Topics:** ${relatedTopics}

Use these specialized memory management tools for comprehensive knowledge organization:

## Memory Management Process:

### 1. **Context Assessment & Prioritization** (prioritize_memory)
- Evaluate the importance and urgency of the current context
- Determine what information needs to be preserved long-term
- Assess the context type (progress, decisions, code-snippets, debugging, planning)

### 2. **Intelligent Context Saving** (auto_save_context)
- Automatically save and compress current context
- Tag information with appropriate categories and metadata
- Create checkpoints for different project phases
- Preserve decision rationale and alternative considerations

### 3. **Memory Organization** (save_memory, update_memory)
- Structure information into logical categories
- Create relationships between related memories
- Update existing memories with new insights
- Maintain memory hierarchy and dependencies

### 4. **Knowledge Retrieval & Synthesis** (recall_memory, search_memories)
- Retrieve relevant historical context and decisions
- Search for similar problems and their solutions
- Synthesize information from multiple memory sources
- Identify patterns and recurring issues

### 5. **Session Context Management** (start_session, restore_session_context)
- Initialize new work sessions with relevant context
- Restore previous session state when resuming work
- Maintain continuity across development sessions
- Track progress and learning over time

### 6. **Memory Analysis & Insights** (list_memories, search_memories)
- Analyze memory usage patterns and effectiveness
- Identify knowledge gaps and learning opportunities
- Generate insights from accumulated project experience
- Suggest improvements to memory management practices

### 7. **Knowledge Preservation** (prioritize_memory, auto_save_context)
- Ensure critical decisions and solutions are preserved
- Maintain project history and evolution
- Create knowledge base for future reference
- Enable team knowledge sharing and onboarding

## Required Memory Management Output:

**Memory Assessment:**
- Current context importance and retention priority
- Memory categories and tagging strategy
- Related existing memories identified

**Knowledge Organization:**
- Memory structure and relationships established
- Key insights and decisions captured
- Search tags and metadata applied

**Retrieval Strategy:**
- Relevant historical context retrieved
- Patterns and solutions identified
- Knowledge gaps highlighted

**Session Management:**
- Session context initialized/restored
- Progress tracking established
- Future retrieval points planned

**Knowledge Preservation:**
- Critical information archived
- Long-term retention strategy
- Team knowledge sharing recommendations

**Memory Health Report:**
- Memory utilization statistics
- Effectiveness of current organization
- Recommendations for improvement

Provide a comprehensive memory management plan that ensures no important knowledge is lost and future work can build upon accumulated experience.`
        }
      }
    ]
  };
}
