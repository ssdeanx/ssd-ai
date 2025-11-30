import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const testingDefinition: PromptDefinition = {
  name: 'testing-strategy',
  description: 'Comprehensive testing strategy development using multiple specialized personas for thorough quality assurance and validation planning',
  arguments: [
    {
      name: 'test_type',
      description: 'Type of testing to plan (unit, integration, e2e, performance, security, api, ui, mobile)',
      required: true
    },
    {
      name: 'system_under_test',
      description: 'The system, component, or feature to test',
      required: true
    },
    {
      name: 'testing_context',
      description: 'Project context, existing tests, or system architecture',
      required: false
    },
    {
      name: 'quality_requirements',
      description: 'Quality standards, coverage goals, or compliance requirements',
      required: false
    },
    {
      name: 'constraints',
      description: 'Timeline, resource, or technical constraints',
      required: false
    }
  ]
};

export function getTestingPrompt(
  testType: string,
  systemUnderTest: string,
  testingContext: string = 'No specific context provided',
  qualityRequirements: string = 'Standard quality requirements apply',
  constraints: string = 'Standard project constraints apply'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please develop a comprehensive testing strategy for the following using multiple specialized personas for thorough quality assurance planning:

**Testing Type:** ${testType}
**System Under Test:** ${systemUnderTest}
**Testing Context:** ${testingContext}
**Quality Requirements:** ${qualityRequirements}
**Constraints:** ${constraints}

## Multi-Persona Testing Strategy Development Process:

Adopt different specialized personas to create comprehensive testing strategies that ensure quality, reliability, and user satisfaction across all testing dimensions.

### **Persona 1: Test Architect**
**Role:** Testing framework and infrastructure design
**Focus:** Test automation, tooling, scalability, integration
**Deliverables:**
- Test framework selection and architecture
- CI/CD integration and automation pipelines
- Test data management and environment setup
- Performance testing infrastructure
- Test reporting and analytics systems

### **Persona 2: Quality Assurance Engineer**
**Role:** Test planning and execution strategy
**Focus:** Test coverage, risk assessment, quality metrics
**Deliverables:**
- Test planning and prioritization
- Risk-based testing approach
- Quality metrics and KPIs
- Test coverage analysis and goals
- Defect tracking and management

### **Persona 3: Security Tester**
**Role:** Security and compliance testing
**Focus:** Vulnerability assessment, compliance, data protection
**Deliverables:**
- Security testing methodologies
- Compliance and regulatory requirements
- Penetration testing strategies
- Data protection and privacy testing
- Security automation and monitoring

### **Persona 4: Performance Engineer**
**Role:** Performance and scalability testing
**Focus:** Load testing, stress testing, optimization
**Deliverables:**
- Performance testing scenarios and scripts
- Load and stress testing strategies
- Performance monitoring and profiling
- Scalability and capacity planning
- Performance optimization recommendations

### **Persona 5: User Experience Tester**
**Role:** Usability and user acceptance testing
**Focus:** User satisfaction, accessibility, usability
**Deliverables:**
- User acceptance testing (UAT) procedures
- Usability testing methodologies
- Accessibility testing (WCAG compliance)
- User feedback integration
- Beta testing and user validation

### **Persona 6: DevOps Engineer**
**Role:** Testing in deployment and operations
**Focus:** Deployment testing, monitoring, reliability
**Deliverables:**
- Deployment and release testing
- Production monitoring and alerting
- Rollback and recovery testing
- Chaos engineering and resilience testing
- Operational acceptance testing

## Testing Strategy Development Workflow:

### Phase 1: Testing Foundation
**Test Architect + QA Engineer Perspective:**
- Define testing objectives and scope
- Assess system architecture and dependencies
- Establish testing frameworks and tooling
- Create test environment strategy

### Phase 2: Test Planning
**QA Engineer + Security Tester Perspective:**
- Develop detailed test plans and schedules
- Identify test scenarios and test cases
- Define acceptance criteria and success metrics
- Plan risk mitigation and contingency testing

### Phase 3: Quality Assurance Implementation
**All Testing Personas Perspective:**
- Implement automated testing frameworks
- Develop comprehensive test suites
- Establish continuous integration testing
- Create test data management strategies

### Phase 4: Specialized Testing
**Performance + Security + UX Personas Perspective:**
- Execute performance and load testing
- Conduct security assessments and testing
- Perform usability and accessibility testing
- Validate user acceptance and satisfaction

### Phase 5: Monitoring & Optimization
**DevOps + QA Engineer Perspective:**
- Implement production monitoring and alerting
- Establish continuous testing in production
- Optimize testing processes and efficiency
- Maintain testing documentation and procedures

## Required Testing Strategy Deliverables:

### **Testing Framework & Infrastructure**
- **Test Automation Framework**: Technology stack and architecture
- **CI/CD Integration**: Automated testing pipelines and triggers
- **Test Environments**: Staging, testing, and production environments
- **Test Data Management**: Data generation, masking, and management
- **Test Reporting**: Dashboards, metrics, and stakeholder reporting

### **Test Planning & Execution**
- **Test Strategy Document**: Overall testing approach and methodology
- **Test Plans**: Detailed plans for each testing phase
- **Test Cases**: Comprehensive test case specifications
- **Test Scripts**: Automated test implementations
- **Test Data**: Test datasets and data generation procedures

### **Quality Assurance Processes**
- **Code Quality Gates**: Static analysis and code review requirements
- **Test Coverage Metrics**: Coverage goals and measurement procedures
- **Defect Management**: Bug tracking, triage, and resolution processes
- **Quality Metrics**: KPIs for measuring testing effectiveness
- **Continuous Improvement**: Retrospectives and process optimization

### **Specialized Testing Approaches**
- **Security Testing**: Vulnerability scanning, penetration testing, compliance
- **Performance Testing**: Load testing, stress testing, capacity planning
- **Usability Testing**: User experience validation and accessibility testing
- **Compatibility Testing**: Cross-browser, cross-device, cross-platform testing
- **Integration Testing**: API testing, contract testing, end-to-end flows

### **Risk Management & Mitigation**
- **Risk Assessment**: Critical failure points and business impact
- **Risk-Based Testing**: Prioritization based on risk severity
- **Contingency Planning**: Backup testing strategies and procedures
- **Regression Testing**: Change impact analysis and regression suites
- **Exploratory Testing**: Unscripted testing for edge cases and usability

### **Monitoring & Analytics**
- **Test Execution Monitoring**: Real-time test status and progress tracking
- **Quality Dashboards**: Visual representation of quality metrics
- **Trend Analysis**: Historical data and improvement tracking
- **Predictive Analytics**: Early warning systems for quality issues
- **Stakeholder Reporting**: Executive summaries and detailed reports

## Testing Quality Standards:

### **Coverage Standards**
- **Code Coverage**: Minimum coverage percentages by component
- **Requirements Coverage**: Traceability from requirements to tests
- **Risk Coverage**: Critical risk areas adequately tested
- **Platform Coverage**: Supported platforms and configurations tested

### **Process Standards**
- **Test Case Standards**: Format, naming, and maintenance procedures
- **Documentation Standards**: Test plans, cases, and results documentation
- **Review Standards**: Peer review and approval processes
- **Maintenance Standards**: Test suite updates and refactoring

### **Automation Standards**
- **Automation Coverage**: Percentage of tests automated
- **Execution Speed**: Test execution time and parallelization
- **Reliability**: Flaky test detection and elimination
- **Maintenance**: Test code quality and refactoring procedures

### **Performance Standards**
- **Execution Time**: Maximum acceptable test execution times
- **Resource Usage**: Memory, CPU, and infrastructure utilization
- **Scalability**: Ability to handle increased test loads
- **Reliability**: Test stability and consistency over time

Provide a comprehensive testing strategy that ensures software quality, reliability, and user satisfaction while optimizing testing efficiency and effectiveness. Use the specialized analysis and quality assurance tools as needed to validate and enhance the testing approach.`
        }
      }
    ]
  };
}
