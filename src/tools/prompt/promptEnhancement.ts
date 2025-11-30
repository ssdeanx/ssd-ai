import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const promptEnhancementDefinition: PromptDefinition = {
  name: 'prompt-enhancement',
  description: 'Advanced prompt optimization and analysis using specialized prompt enhancement tools for improving AI interactions and effectiveness',
  arguments: [
    {
      name: 'enhancement_task',
      description: 'Type of prompt enhancement needed (optimization, analysis, gemini-enhancement, effectiveness-review)',
      required: true
    },
    {
      name: 'original_prompt',
      description: 'The original prompt to enhance or analyze',
      required: true
    },
    {
      name: 'target_use_case',
      description: 'Specific use case or context for the prompt (coding, writing, analysis, creative)',
      required: false
    },
    {
      name: 'enhancement_focus',
      description: 'Specific aspects to focus on (clarity, specificity, structure, effectiveness)',
      required: false
    },
    {
      name: 'ai_model_context',
      description: 'Target AI model or context (GPT, Claude, Gemini, general-purpose)',
      required: false
    }
  ]
};

export function getPromptEnhancementPrompt(
  enhancementTask: string,
  originalPrompt: string,
  targetUseCase: string = 'general',
  enhancementFocus: string = 'comprehensive',
  aiModelContext: string = 'general-purpose'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please enhance and optimize the following prompt using all available prompt enhancement tools:

**Enhancement Task:** ${enhancementTask}
**Target Use Case:** ${targetUseCase}
**Enhancement Focus:** ${enhancementFocus}
**AI Model Context:** ${aiModelContext}

**Original Prompt:**
${originalPrompt}

Use these specialized prompt enhancement tools for comprehensive optimization:

## Prompt Enhancement Process:

### 1. **Prompt Analysis** (analyze_prompt)
- Evaluate prompt clarity, specificity, and structure
- Identify strengths and weaknesses in current formulation
- Assess effectiveness for intended use case
- Analyze potential ambiguity or confusion points

### 2. **General Enhancement** (enhance_prompt)
- Improve prompt clarity and precision
- Add specific context and constraints
- Enhance structure and organization
- Optimize for better AI understanding and response quality

### 3. **Gemini-Specific Optimization** (enhance_prompt_gemini)
- Apply Gemini-specific prompting techniques
- Optimize for multimodal capabilities when relevant
- Enhance contextual understanding and reasoning
- Leverage Gemini's unique strengths and capabilities

### 4. **Use Case Optimization**
- Tailor prompt for specific domains (coding, writing, analysis, creative)
- Incorporate domain-specific best practices
- Optimize for desired output format and style
- Consider audience and communication goals

### 5. **Effectiveness Validation**
- Test enhanced prompt against original
- Measure improvement in clarity and specificity
- Validate alignment with use case requirements
- Assess potential for better AI responses

### 6. **Iterative Refinement**
- Generate multiple enhancement variations
- Compare effectiveness of different approaches
- Refine based on analysis and testing
- Provide final optimized prompt with rationale

## Required Enhancement Output:

**Original Prompt Analysis:**
- Strengths and weaknesses assessment
- Clarity and specificity evaluation
- Use case alignment analysis
- Potential improvement areas identified

**Enhanced Prompt Versions:**
- General enhancement with improved structure
- Gemini-optimized version with advanced techniques
- Use case-specific optimizations
- Multiple variations for comparison

**Enhancement Rationale:**
- Specific changes made and reasoning
- Expected improvements in AI responses
- Trade-offs and considerations
- Best practices applied

**Effectiveness Comparison:**
- Before/after comparison metrics
- Expected response quality improvements
- Use case alignment validation
- Performance predictions

**Implementation Recommendations:**
- How to use the enhanced prompt effectively
- Context and constraints for optimal results
- Testing and validation approaches
- Monitoring and refinement suggestions

Provide comprehensive prompt enhancement that maximizes effectiveness, clarity, and success rate for the specified use case and AI model context.`
        }
      }
    ]
  };
}
