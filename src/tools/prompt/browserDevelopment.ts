import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const browserDevelopmentDefinition: PromptDefinition = {
  name: 'browser-development',
  description: 'Web development debugging and monitoring using browser tools for console logging, network inspection, and client-side issue resolution',
  arguments: [
    {
      name: 'debugging_task',
      description: 'Specific debugging or monitoring task (console-analysis, network-inspection, performance-monitoring, error-tracking)',
      required: true
    },
    {
      name: 'target_url',
      description: 'URL of the web application to analyze',
      required: true
    },
    {
      name: 'issue_description',
      description: 'Description of the issue or behavior to investigate',
      required: false
    },
    {
      name: 'monitoring_duration',
      description: 'Duration for monitoring in seconds (default: 30)',
      required: false
    },
    {
      name: 'focus_areas',
      description: 'Specific areas to focus on (errors, performance, network, console)',
      required: false
    }
  ]
};

export function getBrowserDevelopmentPrompt(
  debuggingTask: string,
  targetUrl: string,
  issueDescription: string = 'General debugging and monitoring',
  monitoringDuration: string = '30',
  focusAreas: string = 'errors, performance, network, console'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please assist with browser-based web development debugging using all available browser development tools:

**Debugging Task:** ${debuggingTask}
**Target URL:** ${targetUrl}
**Issue Description:** ${issueDescription}
**Monitoring Duration:** ${monitoringDuration} seconds
**Focus Areas:** ${focusAreas}

Use these specialized browser development tools for comprehensive web debugging:

## Browser Debugging Process:

### 1. **Console Log Monitoring** (monitor_console_logs)
- Capture all console output including errors, warnings, and info messages
- Monitor log levels: error, warn, info, debug
- Track console API usage and custom logging
- Identify JavaScript runtime errors and exceptions
- Analyze console timing and performance logs

### 2. **Network Request Inspection** (inspect_network_requests)
- Analyze all network requests (XHR, Fetch, WebSocket, etc.)
- Examine request/response headers and payloads
- Identify failed requests and error responses
- Monitor network timing and performance metrics
- Check for security issues in network communications
- Validate API endpoints and data flow

### 3. **Error Analysis & Correlation**
- Correlate console errors with network failures
- Identify root causes of client-side issues
- Analyze error patterns and frequencies
- Determine impact on user experience

### 4. **Performance Monitoring**
- Track page load performance and resource timing
- Monitor JavaScript execution performance
- Identify bottlenecks in network requests
- Analyze memory usage and leaks

### 5. **Security Assessment**
- Check for insecure network requests
- Validate CORS configurations
- Monitor for potential security vulnerabilities
- Review authentication and authorization flows

### 6. **Data Flow Analysis**
- Trace data flow between client and server
- Validate request/response data integrity
- Monitor state management and data persistence
- Check for data synchronization issues

## Required Browser Debugging Output:

**Console Analysis Report:**
- All captured console messages categorized by level
- Error frequency and patterns
- Performance timing information
- Custom logging insights

**Network Inspection Report:**
- Complete request/response analysis
- Failed request identification and causes
- Performance metrics and bottlenecks
- Security assessment findings

**Issue Correlation:**
- Links between console errors and network issues
- Root cause identification
- Impact assessment on application functionality

**Performance Insights:**
- Loading performance analysis
- Resource optimization recommendations
- JavaScript execution efficiency
- Memory usage patterns

**Security Findings:**
- Security vulnerability identification
- Configuration issues and recommendations
- Authentication flow validation

**Resolution Recommendations:**
- Specific fixes for identified issues
- Code changes and configuration updates
- Testing procedures for validation
- Monitoring recommendations for ongoing issues

Provide comprehensive browser debugging analysis that enables effective resolution of client-side issues and optimization of web application performance.`
        }
      }
    ]
  };
}
