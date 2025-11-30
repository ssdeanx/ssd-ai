import { PromptDefinition, PromptResult } from '../../types/prompt';

export const codeReviewDefinition: PromptDefinition = {
  name: 'code-review',
  description: 'Comprehensive code analysis using multiple specialized tools for thorough review',
  arguments: [
    {
      name: 'language',
      description: 'Programming language of the code',
      required: true
    },
    {
      name: 'code',
      description: 'The code to review',
      required: true
    },
    {
      name: 'project_path',
      description: 'Path to the project directory for context',
      required: false
    }
  ]
};

export function getCodeReviewPrompt(language: string, code: string, projectPath?: string): PromptResult {
  const projectContext = projectPath ? `Project context: ${projectPath}` : 'No project context provided';

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please perform a comprehensive code review of the following ${language} code using all available analysis tools:

${projectContext}

\`\`\`${language}
${code}
\`\`\`

Use these specialized tools in sequence for thorough analysis:

1. **Code Quality Validation** (validate_code_quality):
   - Check for best practices, naming conventions, and code standards
   - Identify potential bugs, security issues, and maintainability problems

2. **Complexity Analysis** (analyze_complexity):
   - Measure cyclomatic complexity, cognitive complexity, and maintainability index
   - Identify overly complex functions that need refactoring

3. **Coupling and Cohesion Analysis** (check_coupling_cohesion):
   - Evaluate how well modules are organized and dependencies managed
   - Assess separation of concerns and modularity

4. **Semantic Code Analysis** (find_symbol, find_references):
   - Analyze symbol definitions and usage patterns
   - Check for unused variables, functions, or imports

5. **Thinking Framework Application** (apply_reasoning_framework):
   - Use structured reasoning to evaluate design decisions
   - Consider alternative approaches and trade-offs

6. **Code Improvement Suggestions** (suggest_improvements):
   - Generate specific, actionable recommendations
   - Prioritize improvements by impact and effort

7. **Documentation and Comments Review**:
   - Check if code is self-documenting
   - Suggest where additional comments or documentation would help

Provide a structured review report with:
- Executive summary of code quality
- Detailed findings from each analysis tool
- Priority-ranked improvement recommendations
- Estimated effort for each suggestion
- Overall maintainability score`
        }
      }
    ]
  };
}
