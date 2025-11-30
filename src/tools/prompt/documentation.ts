import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const documentationDefinition: PromptDefinition = {
  name: 'documentation-generation',
  description: 'Comprehensive documentation generation using multiple specialized personas for thorough technical writing and user guidance',
  arguments: [
    {
      name: 'doc_type',
      description: 'Type of documentation to generate (api, readme, user-guide, technical, deployment, troubleshooting)',
      required: true
    },
    {
      name: 'doc_subject',
      description: 'The main subject or component to document',
      required: true
    },
    {
      name: 'audience',
      description: 'Target audience (developers, users, administrators, stakeholders)',
      required: false
    },
    {
      name: 'context',
      description: 'Background context, existing docs, or system information',
      required: false
    },
    {
      name: 'format',
      description: 'Output format preference (markdown, html, pdf, structured)',
      required: false
    }
  ]
};

export function getDocumentationPrompt(
  docType: string,
  docSubject: string,
  audience: string = 'developers',
  context: string = 'No specific context provided',
  format: string = 'markdown'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please generate comprehensive documentation for the following using multiple specialized personas for thorough technical writing:

**Documentation Type:** ${docType}
**Subject:** ${docSubject}
**Target Audience:** ${audience}
**Context:** ${context}
**Preferred Format:** ${format}

## Multi-Persona Documentation Generation Process:

Adopt different specialized personas to create documentation from multiple perspectives, ensuring completeness, accuracy, and usability for the target audience.

### **Persona 1: Technical Writer**
**Role:** Content structure and clarity
**Focus:** Information architecture, readability, consistency
**Deliverables:**
- Clear document structure and navigation
- Consistent terminology and formatting
- Reader-friendly language and tone
- Comprehensive table of contents
- Cross-references and linking

### **Persona 2: Subject Matter Expert**
**Role:** Technical accuracy and depth
**Focus:** Domain knowledge, technical details, accuracy
**Deliverables:**
- Technically accurate information
- Complete feature coverage
- Implementation details and constraints
- Edge cases and limitations
- Best practices and recommendations

### **Persona 3: User Experience Designer**
**Role:** User-centered documentation design
**Focus:** User needs, accessibility, usability
**Deliverables:**
- User journey mapping for documentation
- Intuitive information hierarchy
- Accessible content design (WCAG compliance)
- Progressive disclosure of information
- User feedback integration points

### **Persona 4: Quality Assurance Specialist**
**Role:** Documentation validation and testing
**Focus:** Completeness, accuracy, usability testing
**Deliverables:**
- Content validation checklists
- Example verification and testing
- User acceptance testing procedures
- Documentation maintenance guidelines
- Version control and update procedures

### **Persona 5: Developer Advocate**
**Role:** Developer experience and adoption
**Focus:** Developer needs, integration ease, community
**Deliverables:**
- Code examples and samples
- Quick start guides and tutorials
- Integration patterns and best practices
- Troubleshooting guides and FAQs
- Community resources and support

## Documentation Generation Workflow:

### Phase 1: Content Planning
**Technical Writer + Subject Matter Expert Perspective:**
- Define documentation scope and objectives
- Identify key topics and information hierarchy
- Create content outline and structure
- Establish documentation standards and style guide

### Phase 2: Content Development
**Subject Matter Expert + Developer Advocate Perspective:**
- Gather technical information and requirements
- Write detailed content with examples
- Create code samples and practical examples
- Develop troubleshooting and FAQ sections

### Phase 3: User Experience Design
**UX Designer Perspective:**
- Design information architecture and navigation
- Create user-friendly layouts and formatting
- Ensure accessibility and readability
- Design visual elements and diagrams

### Phase 4: Quality Assurance
**QA Specialist Perspective:**
- Validate technical accuracy and completeness
- Test examples and procedures
- Review for clarity and usability
- Establish maintenance and update procedures

### Phase 5: Final Review & Publishing
**All Personas Cross-Review:**
- Final technical and editorial review
- Validate audience appropriateness
- Ensure consistency and completeness
- Prepare for publishing and distribution

## Required Documentation Deliverables:

### **Core Content Structure**
- **Overview/Introduction**: Purpose, scope, and key concepts
- **Getting Started**: Quick start guide and prerequisites
- **Core Concepts**: Fundamental principles and terminology
- **Detailed Guides**: Step-by-step instructions and procedures
- **Reference Materials**: API references, configuration options, parameters
- **Troubleshooting**: Common issues, debugging, and solutions
- **Best Practices**: Recommendations and optimization tips

### **Navigation & Organization**
- **Table of Contents**: Hierarchical content structure
- **Search Functionality**: Keywords and indexing
- **Cross-References**: Related topics and linking
- **Version Information**: Document version and applicability
- **Change History**: Updates and modifications log

### **User Support Elements**
- **Examples & Samples**: Practical code and configuration examples
- **FAQs**: Frequently asked questions and answers
- **Glossary**: Terminology and definitions
- **Support Resources**: Contact information and help channels
- **Feedback Mechanisms**: User input and improvement suggestions

### **Technical Documentation**
- **Architecture Diagrams**: System and component relationships
- **API Specifications**: Endpoint details, parameters, responses
- **Configuration Guides**: Setup and customization instructions
- **Performance Guidelines**: Optimization and scaling recommendations
- **Security Considerations**: Authentication, authorization, compliance

### **Maintenance & Updates**
- **Review Schedule**: Regular content validation procedures
- **Update Procedures**: Version control and publishing workflows
- **User Feedback Integration**: Incorporating user input and corrections
- **Deprecation Notices**: Outdated content handling and migration guides

## Documentation Quality Standards:

### **Content Quality**
- **Accuracy**: Technically correct and up-to-date information
- **Completeness**: All necessary information for target audience
- **Clarity**: Clear, concise, and unambiguous language
- **Consistency**: Uniform terminology, formatting, and style

### **User Experience**
- **Findability**: Easy to locate relevant information
- **Readability**: Appropriate reading level and structure
- **Accessibility**: WCAG compliant and inclusive design
- **Usability**: Intuitive navigation and interaction patterns

### **Technical Standards**
- **Versioning**: Clear version identification and compatibility
- **Maintenance**: Regular updates and validation procedures
- **Integration**: Seamless integration with development workflows
- **Automation**: Opportunities for automated content generation

Provide comprehensive, high-quality documentation that serves the target audience's needs while maintaining technical accuracy and usability standards. Use the specialized analysis and reasoning tools as needed to ensure thorough coverage and quality validation.`
        }
      }
    ]
  };
}
