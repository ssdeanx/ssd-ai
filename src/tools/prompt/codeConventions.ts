import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const codeConventionsDefinition: PromptDefinition = {
  name: 'code-conventions',
  description: 'Comprehensive code quality analysis and improvement using convention tools for standards validation, complexity analysis, and enhancement suggestions',
  arguments: [
    {
      name: 'code_quality_task',
      description: 'Specific code quality task (validation, analysis, improvement, standards-check)',
      required: true
    },
    {
      name: 'code_to_analyze',
      description: 'The code to analyze for quality and conventions',
      required: true
    },
    {
      name: 'programming_language',
      description: 'Programming language of the code',
      required: true
    },
    {
      name: 'quality_focus',
      description: 'Specific quality aspects to focus on (complexity, coupling, standards, improvements)',
      required: false
    },
    {
      name: 'standards_level',
      description: 'Quality standards level (basic, intermediate, advanced, enterprise)',
      required: false
    }
  ]
};

export function getCodeConventionsPrompt(
  codeQualityTask: string,
  codeToAnalyze: string,
  programmingLanguage: string,
  qualityFocus: string = 'comprehensive',
  standardsLevel: string = 'intermediate'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please perform comprehensive code quality analysis and improvement using all available code convention tools:

**Code Quality Task:** ${codeQualityTask}
**Programming Language:** ${programmingLanguage}
**Quality Focus:** ${qualityFocus}
**Standards Level:** ${standardsLevel}

**Code to Analyze:**
\`\`\`${programmingLanguage}
${codeToAnalyze}
\`\`\`

Use these specialized code convention tools for thorough quality assessment:

## Code Quality Analysis Process:

### 1. **Coding Standards Validation** (validate_code_quality)
- Check adherence to language-specific coding standards
- Validate naming conventions and code formatting
- Assess documentation quality and completeness
- Verify compliance with best practices

### 2. **Complexity Analysis** (analyze_complexity)
- Measure cyclomatic complexity of functions and methods
- Calculate cognitive complexity and maintainability metrics
- Identify overly complex code that needs refactoring
- Assess code readability and comprehension difficulty

### 3. **Coupling and Cohesion Assessment** (check_coupling_cohesion)
- Analyze module coupling patterns and dependencies
- Evaluate functional cohesion within modules
- Identify tight coupling that reduces maintainability
- Assess separation of concerns and modularity

### 4. **Quality Rules Application** (apply_quality_rules)
- Apply comprehensive quality rule sets
- Identify code smells and anti-patterns
- Check for security vulnerabilities in code
- Validate performance and efficiency patterns

### 5. **Improvement Suggestions** (suggest_improvements)
- Generate specific, actionable improvement recommendations
- Prioritize improvements by impact and effort
- Provide refactoring suggestions with code examples
- Recommend design pattern applications

### 6. **Coding Guide Reference** (get_coding_guide)
- Reference language-specific coding guidelines
- Compare code against established standards
- Identify areas for standards improvement
- Provide learning resources for quality enhancement

## Required Code Quality Output:

**Standards Compliance Report:**
- Adherence to coding standards and conventions
- Formatting and style consistency assessment
- Documentation quality evaluation
- Best practices compliance check

**Complexity Analysis:**
- Cyclomatic and cognitive complexity metrics
- Function complexity breakdown
- Readability and maintainability scores
- Refactoring recommendations for complex code

**Coupling/Cohesion Assessment:**
- Coupling type identification and severity
- Cohesion level evaluation
- Module dependency analysis
- Modularity improvement suggestions

**Quality Rules Results:**
- Applied rule violations and severity levels
- Code smell identification and categorization
- Security vulnerability assessment
- Performance issue detection

**Improvement Recommendations:**
- Prioritized list of specific improvements
- Code examples for suggested changes
- Effort estimation for each recommendation
- Expected benefits and risk assessment

**Standards Reference:**
- Relevant coding guidelines and standards
- Learning resources for improvement areas
- Industry best practices alignment
- Quality benchmark comparisons

Provide comprehensive code quality analysis that enables systematic improvement of code standards, maintainability, and overall software quality.`
        }
      }
    ]
  };
}
