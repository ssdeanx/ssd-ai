<file_path>
hi-ai\docs\mcp-server-reference.md
</file_path>

<edit_description>
Creating a reference document for checking MCP server implementation against specifications
</edit_description>

# MCP Server Implementation Reference

This reference document provides a structured checklist and guide for verifying your MCP server implementation against the Model Context Protocol specifications. Use this to cross-reference your code with the comprehensive documentation in `mcp-server-docs-v2.md`.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Core Architecture](#core-architecture)
3. [Transport Layer](#transport-layer)
4. [Server Features](#server-features)
5. [Base Protocol](#base-protocol)
6. [Security & Best Practices](#security--best-practices)
7. [Testing & Debugging](#testing--debugging)

## Project Setup

### Installation & Dependencies
- [ ] **SDK Installation**: Verify `@modelcontextprotocol/sdk` and `zod` are installed with correct versions
- [ ] **Peer Dependencies**: Ensure `zod` is at compatible version (v3.25+)
- [ ] **TypeScript Configuration**: Check tsconfig.json for proper compilation settings
- [ ] **Node.js Compatibility**: Confirm Node.js version supports required features (v18+ for crypto polyfill)

*Reference: [Overview > Installation](#overview)*

### Basic Server Structure
- [ ] **McpServer Class**: Import and instantiate `McpServer` with name and version
- [ ] **Initialization**: Set up server with proper configuration object
- [ ] **Export Structure**: Ensure server is properly exported for use

*Reference: [Core Concepts > Server](#core-concepts)*

## Core Architecture

### Server Registration
- [ ] **Tool Registration**: Use `registerTool()` method with proper schema validation
- [ ] **Resource Registration**: Implement `registerResource()` for static/dynamic resources
- [ ] **Prompt Registration**: Set up `registerPrompt()` with argument schemas
- [ ] **Schema Validation**: Ensure input/output schemas use JSON Schema 2020-12

*Reference: [Core Concepts > Tools/Resources/Prompts](#core-concepts)*

### Schema Definitions
- [ ] **Tool Input Schema**: Define required/optional parameters with proper types
- [ ] **Tool Output Schema**: Specify structured output format (optional)
- [ ] **Resource Templates**: Use URI templates for dynamic resources
- [ ] **Prompt Arguments**: Define completable arguments with validation

*Reference: [Specifications > Tools/Resources/Prompts](#specifications)*

### Handler Functions
- [ ] **Async Handlers**: All handlers should be async functions
- [ ] **Error Handling**: Implement proper error responses with `isError: true`
- [ ] **Structured Content**: Return both `content` and `structuredContent` where applicable
- [ ] **Resource Content**: Handle both text and binary resource contents

*Reference: [Examples > Echo Server](#examples)*

## Transport Layer

### stdio Transport
- [ ] **StdioServerTransport**: Import and instantiate for local subprocess communication
- [ ] **Message Delimiting**: Ensure messages are newline-delimited without embedded newlines
- [ ] **Stderr Handling**: Optionally capture server stderr for logging
- [ ] **Process Management**: Handle subprocess lifecycle properly

*Reference: [Running Your Server > stdio](#running-your-server)*

### Streamable HTTP Transport
- [ ] **StreamableHTTPServerTransport**: Use for remote server communication
- [ ] **HTTP Endpoints**: Set up single MCP endpoint (e.g., `/mcp`) supporting POST/GET
- [ ] **SSE Support**: Handle Server-Sent Events for streaming responses
- [ ] **Session Management**: Implement session IDs for stateful connections
- [ ] **CORS Configuration**: Set up proper CORS headers for browser clients

*Reference: [Running Your Server > Streamable HTTP](#running-your-server)*

### Transport Security
- [ ] **DNS Rebinding Protection**: Enable for local servers with allowed hosts/origins
- [ ] **Origin Validation**: Validate `Origin` header to prevent DNS rebinding attacks
- [ ] **Authentication**: Implement proper auth for remote connections
- [ ] **Localhost Binding**: Bind only to localhost when running locally

*Reference: [Base Protocol > Transports > Security Warning](#base-protocol)*

## Server Features

### Tools Implementation
- [ ] **Tool Discovery**: Respond to `tools/list` requests with proper metadata
- [ ] **Tool Execution**: Handle `tools/call` requests with argument validation
- [ ] **Error Reporting**: Use `isError: true` for tool execution failures
- [ ] **Content Types**: Support text, image, audio, resource links, and embedded resources
- [ ] **Annotations**: Include audience, priority, and lastModified metadata

*Reference: [Specifications > Tools](#specifications)*

### Resources Implementation
- [ ] **Resource Listing**: Implement `resources/list` with pagination support
- [ ] **Resource Reading**: Handle `resources/read` requests with proper content types
- [ ] **Resource Templates**: Support URI templates for dynamic resources
- [ ] **Subscription Support**: Optionally implement `resources/subscribe` for updates
- [ ] **MIME Types**: Use appropriate MIME types for different content types

*Reference: [Specifications > Resources](#specifications)*

### Prompts Implementation
- [ ] **Prompt Listing**: Respond to `prompts/list` with available prompts
- [ ] **Prompt Retrieval**: Handle `prompts/get` with argument templating
- [ ] **Message Structure**: Return proper role/content format for conversations
- [ ] **Completion Support**: Enable argument completion through completion API

*Reference: [Specifications > Prompts](#specifications)*

### Completion Support
- [ ] **Completion Endpoint**: Implement `completion/complete` for argument suggestions
- [ ] **Reference Types**: Support both prompt and resource template completions
- [ ] **Context Awareness**: Use previously resolved arguments for suggestions
- [ ] **Fuzzy Matching**: Provide relevant completions based on partial input

*Reference: [Specifications > Completion](#specifications)*

### Logging & Notifications
- [ ] **Logging Capability**: Declare logging capability in initialization
- [ ] **Log Levels**: Support standard syslog levels (debug, info, warning, error, etc.)
- [ ] **Message Notifications**: Send `notifications/message` with proper structure
- [ ] **Sensitive Data**: Avoid logging credentials or personal information

*Reference: [Specifications > Logging](#specifications)*

### Pagination
- [ ] **Cursor-Based Pagination**: Use opaque cursors for list operations
- [ ] **Next Cursor**: Include `nextCursor` when more results are available
- [ ] **Page Limits**: Implement reasonable limits on result set sizes
- [ ] **Cursor Validation**: Handle invalid cursors gracefully

*Reference: [Specifications > Pagination](#specifications)*

## Base Protocol

### Progress Notifications
- [ ] **Progress Tokens**: Generate unique tokens for tracking operations
- [ ] **Progress Updates**: Send `notifications/progress` with increasing values
- [ ] **Optional Fields**: Include total, message, and other metadata as available
- [ ] **Token Management**: Track active progress tokens and clean up completed ones

*Reference: [Base Protocol > Progress](#base-protocol)*

### Task-Based Execution (Experimental)
- [ ] **Task Capabilities**: Declare task support in server capabilities
- [ ] **Task Creation**: Handle task-augmented requests with `CreateTaskResult`
- [ ] **Task Polling**: Implement `tasks/get` for status checking
- [ ] **Result Retrieval**: Support `tasks/result` for completed tasks
- [ ] **Task Lifecycle**: Manage task states (working → completed/failed/cancelled)
- [ ] **Task Metadata**: Include `io.modelcontextprotocol/related-task` in messages

*Reference: [Base Protocol > Tasks](#base-protocol)*

### Lifecycle Management
- [ ] **Initialization**: Respond to `initialize` with proper capabilities
- [ ] **Capability Negotiation**: Declare supported features accurately
- [ ] **Protocol Version**: Negotiate compatible MCP protocol versions
- [ ] **Notifications**: Send `notifications/initialized` after setup

*Reference: [Architecture > Data Layer Protocol > Lifecycle Management](#architecture)*

## Security & Best Practices

### Input Validation
- [ ] **Schema Validation**: Validate all inputs against defined schemas
- [ ] **Sanitization**: Sanitize user inputs to prevent injection attacks
- [ ] **Rate Limiting**: Implement rate limits on expensive operations
- [ ] **Resource Limits**: Set bounds on memory usage and concurrent operations

*Reference: [Security Considerations](#security-considerations)*

### Error Handling
- [ ] **Protocol Errors**: Use standard JSON-RPC error codes (-32601, -32602, -32603)
- [ ] **Tool Errors**: Report execution failures with `isError: true`
- [ ] **Informative Messages**: Provide clear error messages for debugging
- [ ] **Graceful Degradation**: Handle failures without crashing the server

*Reference: [Specifications > Error Handling](#specifications)*

### Performance
- [ ] **Efficient Queries**: Optimize database/API calls in tool implementations
- [ ] **Caching**: Implement appropriate caching for frequently accessed data
- [ ] **Async Operations**: Use async/await for non-blocking I/O
- [ ] **Resource Cleanup**: Properly clean up resources and connections

*Reference: [Advanced Usage](#advanced-usage)*

## Testing & Debugging

### MCP Inspector
- [ ] **Inspector Usage**: Test server with `npx @modelcontextprotocol/inspector`
- [ ] **Connection Testing**: Verify both stdio and HTTP transport connections
- [ ] **Tool Testing**: Execute tools and verify responses
- [ ] **Resource Testing**: Access resources and check content types

*Reference: [Testing and Debugging](#testing-and-debugging)*

### Integration Testing
- [ ] **Client Connections**: Test with actual MCP clients (Claude Code, VS Code, etc.)
- [ ] **Error Scenarios**: Test error handling and recovery
- [ ] **Load Testing**: Verify performance under concurrent requests
- [ ] **Edge Cases**: Test with malformed inputs and boundary conditions

*Reference: [Examples](#examples)*

### Logging & Monitoring
- [ ] **Debug Logging**: Enable detailed logging during development
- [ ] **Production Logging**: Configure appropriate log levels for production
- [ ] **Metrics**: Track request rates, error rates, and performance metrics
- [ ] **Health Checks**: Implement basic health check endpoints

*Reference: [Specifications > Logging](#specifications)*

## Quick Reference Checklist

Use this checklist during development and before deployment:

### Pre-Implementation
- [ ] Review MCP specification version compatibility
- [ ] Choose appropriate transport (stdio for local, HTTP for remote)
- [ ] Define server capabilities and features
- [ ] Plan tool/resource/prompt schemas

### Implementation Phase
- [ ] Implement core server class and registration methods
- [ ] Add transport layer with proper security
- [ ] Implement all declared capabilities
- [ ] Add comprehensive error handling

### Testing Phase
- [ ] Test with MCP Inspector for all features
- [ ] Verify transport compatibility (stdio/HTTP)
- [ ] Test error scenarios and edge cases
- [ ] Performance and load testing

### Deployment Phase
- [ ] Configure production logging levels
- [ ] Set up monitoring and alerting
- [ ] Document API usage and limitations
- [ ] Plan for backwards compatibility

---

*This reference document is designed to be used alongside `mcp-server-docs-v2.md` for comprehensive MCP server development. Check off items as you implement them and reference the linked sections for detailed specifications.*
