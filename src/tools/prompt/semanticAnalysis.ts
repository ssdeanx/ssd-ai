import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const semanticAnalysisDefinition: PromptDefinition = {
  name: 'semantic-analysis',
  description: 'Advanced semantic code analysis using symbol navigation and reference tracking tools for comprehensive code understanding and refactoring',
  arguments: [
    {
      name: 'analysis_type',
      description: 'Type of semantic analysis needed (navigation, refactoring, impact-analysis, code-understanding)',
      required: true
    },
    {
      name: 'target_symbol',
      description: 'Primary symbol or code element to analyze',
      required: true
    },
    {
      name: 'project_path',
      description: 'Path to the project directory for analysis',
      required: true
    },
    {
      name: 'analysis_scope',
      description: 'Scope of analysis (single-file, module, project-wide)',
      required: false
    },
    {
      name: 'specific_requirements',
      description: 'Any specific requirements or constraints for the analysis',
      required: false
    }
  ]
};

export function getSemanticAnalysisPrompt(
  analysisType: string,
  targetSymbol: string,
  projectPath: string,
  analysisScope: string = 'project-wide',
  specificRequirements: string = 'No specific requirements'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please perform comprehensive semantic code analysis using all available semantic analysis tools:

**Analysis Type:** ${analysisType}
**Target Symbol:** ${targetSymbol}
**Project Path:** ${projectPath}
**Analysis Scope:** ${analysisScope}
**Specific Requirements:** ${specificRequirements}

Use these specialized semantic analysis tools for thorough code understanding:

## Semantic Analysis Process:

### 1. **Symbol Definition Discovery** (find_symbol)
- Locate all definitions of the target symbol across the codebase
- Identify symbol types (function, class, interface, variable, type)
- Map symbol locations and contexts
- Determine symbol scope and visibility

### 2. **Reference Tracking & Analysis** (find_references)
- Find all references to the target symbol throughout the codebase
- Analyze usage patterns and contexts
- Identify read vs write operations
- Track symbol dependencies and relationships

### 3. **Impact Assessment**
- Evaluate the impact of potential changes to the symbol
- Identify dependent code that would be affected
- Assess refactoring risks and complexity
- Determine testing requirements for changes

### 4. **Code Structure Analysis**
- Understand symbol relationships and hierarchies
- Analyze inheritance and composition patterns
- Identify coupling and cohesion characteristics
- Map data flow and control flow patterns

### 5. **Refactoring Opportunities**
- Identify potential improvements and optimizations
- Suggest safer refactoring approaches
- Propose code organization enhancements
- Recommend documentation improvements

### 6. **Documentation & Reporting**
- Create comprehensive symbol documentation
- Generate usage examples and patterns
- Document dependencies and relationships
- Provide maintenance and evolution guidance

## Required Semantic Analysis Output:

**Symbol Definition Report:**
- All symbol definitions with locations and contexts
- Symbol type classifications and properties
- Scope and visibility analysis
- Definition quality assessment

**Reference Analysis Report:**
- Complete reference map with usage contexts
- Usage pattern analysis and statistics
- Dependency relationship mapping
- Reference quality and consistency assessment

**Impact Assessment:**
- Change impact analysis and risk evaluation
- Affected code identification and quantification
- Testing and validation requirements
- Migration strategy recommendations

**Refactoring Recommendations:**
- Specific improvement suggestions with rationale
- Risk-benefit analysis for each recommendation
- Implementation priority and sequencing
- Expected benefits and trade-offs

**Documentation & Maintenance:**
- Comprehensive symbol documentation
- Usage guidelines and best practices
- Maintenance recommendations
- Future evolution guidance

Provide detailed semantic analysis that enables confident code understanding, safe refactoring, and effective maintenance of the target symbol and its ecosystem.`
        }
      }
    ]
  };
}
