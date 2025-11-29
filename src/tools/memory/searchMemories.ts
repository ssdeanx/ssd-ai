// Memory management tool - completely independent

import { MemoryManager } from '../../lib/MemoryManager.js';
import { ToolResult, ToolDefinition } from '../../types/tool.js';

export const searchMemoriesDefinition: ToolDefinition = {
  name: 'search_memories',
  description: 'find|search|look for|query memories - Search memories by content',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      category: { type: 'string', description: 'Category to search in' }
    },
    required: ['query']
  },
  annotations: {
    title: 'Search Memories',
    audience: ['user', 'assistant']
  }
};

export async function searchMemoriesHandler(args: { query: string; category?: string }): Promise<ToolResult> {
  const { query, category } = args;

  try {
    const mm = MemoryManager.getInstance();
    let results = mm.search(query);

    // Filter by category if specified
    if (category) {
      results = results.filter(m => m.category === category);
    }

    const resultList = results.map(m =>
      `• ${m.key} (${m.category}): ${m.value.substring(0, 100)}${m.value.length > 100 ? '...' : ''}`
    ).join('\n');

    const categoryInfo = category ? ` in category "${category}"` : '';
    return {
      content: [{
        type: 'text',
        text: `✓ Found ${results.length} matches for "${query}"${categoryInfo}:\n${resultList || 'None'}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    };
  }
}