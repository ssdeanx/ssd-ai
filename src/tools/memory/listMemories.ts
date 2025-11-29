// Memory management tool - completely independent

import { MemoryManager } from '../../lib/MemoryManager.js';
import { ToolResult, ToolDefinition } from '../../types/tool.js';

export const listMemoriesDefinition: ToolDefinition = {
  name: 'list_memories',
  description: 'list|saved items|show saved|what memories - List saved memories',
  inputSchema: {
    type: 'object',
    properties: {
      category: { type: 'string', description: 'Filter by category' },
      limit: { type: 'number', description: 'Maximum number of results' }
    },
    required: []
  },
  annotations: {
    title: 'List Memories',
    audience: ['user', 'assistant']
  }
};

export async function listMemories(args: { category?: string; limit?: number }): Promise<ToolResult> {
  const { category: listCategory, limit = 10 } = args;

  try {
    const mm = MemoryManager.getInstance();
    const allMemories = mm.list(listCategory);
    const limitedMemories = allMemories.slice(0, limit);

    const memoryList = limitedMemories.map(m =>
      `• ${m.key} (${m.category}): ${m.value.substring(0, 50)}${m.value.length > 50 ? '...' : ''}`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `✓ Found ${allMemories.length} memories${listCategory ? ` in '${listCategory}'` : ''}:\n${memoryList || 'None'}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    };
  }
}