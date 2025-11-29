// Prompt analysis tool - completely independent

import { ToolResult, ToolDefinition } from '../../types/tool.js';

export const analyzePromptDefinition: ToolDefinition = {
  name: 'analyze_prompt',
  description: 'analyze prompt|rate this|score|how good|prompt quality|evaluate prompt|assess - Analyze prompt quality and provide improvement suggestions',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'Prompt to analyze' },
      criteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific criteria to evaluate (default: all)'
      }
    },
    required: ['prompt']
  },
  annotations: {
    title: 'Analyze Prompt',
    audience: ['user', 'assistant']
  }
};

export async function analyzePrompt(args: { prompt: string; criteria?: string[] }): Promise<ToolResult> {
  const { prompt, criteria = ['clarity', 'specificity', 'context', 'structure'] } = args;
  
  // Initialize scores with explicit types
  const scores: Record<string, number> = {};
  const feedback: Record<string, string[]> = {};
  
  // Analyze clarity (0-10)
  if (criteria.includes('clarity')) {
    let clarityScore = 5.0;
    const clarityFeedback: string[] = [];
    
    if (prompt.length < 20) {
      clarityScore -= 2.0;
      clarityFeedback.push('Prompt is too short');
    }
    
    if (prompt.includes('?') || /\b(please|request|help|want|need)\b/i.test(prompt)) {
      clarityScore += 2.0;
      clarityFeedback.push('Clear request format ✓');
    }
    
    if (prompt.split(',').length > 5 || prompt.split('.').length > 10) {
      clarityScore -= 1.0;
      clarityFeedback.push('Sentence structure is too complex');
    }
    
    scores.clarity = Math.max(0, Math.min(10, clarityScore));
    feedback.clarity = clarityFeedback;
  }
  
  // Analyze specificity (0-10)
  if (criteria.includes('specificity')) {
    let specificityScore = 5.0;
    const specificityFeedback: string[] = [];
    
    const specificKeywords = ['specific', 'exactly', 'example', 'for instance', 'such as'];
    const hasSpecificWords = specificKeywords.some(word => prompt.toLowerCase().includes(word));
    if (hasSpecificWords) {
      specificityScore += 2.0;
      specificityFeedback.push('Uses specific expressions ✓');
    }
    
    const techTerms = /\b(JavaScript|Python|React|Node\.js|API|database|TypeScript|SQL)\b/i;
    if (techTerms.test(prompt)) {
      specificityScore += 2.0;
      specificityFeedback.push('Includes technical terms ✓');
    }
    
    if (!prompt.match(/\d+/) && prompt.length > 50) {
      specificityScore -= 1.0;
      specificityFeedback.push('Lacks numbers or specific data');
    }
    
    scores.specificity = Math.max(0, Math.min(10, specificityScore));
    feedback.specificity = specificityFeedback;
  }
  
  // Analyze context (0-10)
  if (criteria.includes('context')) {
    let contextScore = 5.0;
    const contextFeedback: string[] = [];
    
    const contextKeywords = ['background', 'purpose', 'reason', 'situation', 'current', 'problem', 'goal'];
    const contextCount = contextKeywords.filter(word => prompt.toLowerCase().includes(word)).length;
    contextScore += contextCount * 1.5;
    
    if (contextCount > 0) {
      contextFeedback.push(`Includes background info (${contextCount} keywords) ✓`);
    } else {
      contextFeedback.push('Lacks background information');
    }
    
    if (prompt.split('\n').length > 2) {
      contextScore += 1.0;
      contextFeedback.push('Structured explanation ✓');
    }
    
    scores.context = Math.max(0, Math.min(10, contextScore));
    feedback.context = contextFeedback;
  }
  
  // Analyze structure (0-10)
  if (criteria.includes('structure')) {
    let structureScore = 5.0;
    const structureFeedback: string[] = [];
    
    if (prompt.includes('\n')) {
      structureScore += 2.0;
      structureFeedback.push('Uses line breaks ✓');
    }
    
    if (/[1-9]\.|[-•]/.test(prompt)) {
      structureScore += 2.0;
      structureFeedback.push('Uses list format ✓');
    }
    
    if (prompt.includes('**') || prompt.includes('##')) {
      structureScore += 1.0;
      structureFeedback.push('Uses markdown format ✓');
    }
    
    scores.structure = Math.max(0, Math.min(10, structureScore));
    feedback.structure = structureFeedback;
  }
  
  // Calculate total score
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (scores.clarity < 6) {
    recommendations.push('💡 Express your question or request more clearly');
  }
  if (scores.specificity < 6) {
    recommendations.push('💡 Add specific examples or technical specifications');
  }
  if (scores.context < 6) {
    recommendations.push('💡 Explain the background and purpose of the task');
  }
  if (scores.structure < 6) {
    recommendations.push('💡 Structure with numbers or bullet points');
  }
  
  // Identify strengths and weaknesses
  const strengths = Object.entries(scores)
    .filter(([_, score]) => score >= 7)
    .map(([category, score]) => `✨ ${category}: Excellent (${score.toFixed(1)}/10)`);
    
  const weaknesses = Object.entries(scores)
    .filter(([_, score]) => score < 5)
    .map(([category, score]) => `⚠️ ${category}: Needs improvement (${score.toFixed(1)}/10)`);
  
  const analysis = {
    action: 'analyze_prompt',
    prompt,
    totalScore: parseFloat(totalScore.toFixed(1)),
    scores: Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, parseFloat(v.toFixed(1))])
    ),
    feedback,
    strengths,
    weaknesses,
    recommendations,
    grade: totalScore >= 8 ? 'A' : totalScore >= 6 ? 'B' : totalScore >= 4 ? 'C' : 'D',
    status: 'success'
  };
  
  return {
    content: [{ type: 'text', text: `Score: ${analysis.totalScore}/10 (Grade: ${analysis.grade})\n\nScores:\n${Object.entries(analysis.scores).map(([k, v]) => `- ${k}: ${v}/10`).join('\n')}\n\nStrengths:\n${analysis.strengths.length > 0 ? analysis.strengths.join('\n') : 'None identified'}\n\nWeaknesses:\n${analysis.weaknesses.length > 0 ? analysis.weaknesses.join('\n') : 'None identified'}\n\nRecommendations:\n${analysis.recommendations.map(r => `- ${r}`).join('\n')}` }]
  };
}