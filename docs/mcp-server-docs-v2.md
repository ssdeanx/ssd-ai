# MCP Server Documentation v2

## Overview

The Model Context Protocol (MCP) allows applications to provide context for LLMs in a standardized way, separating the concerns of providing context from the actual LLM interaction. This TypeScript SDK implements the full MCP specification, making it easy to create MCP servers that expose resources, prompts, and tools, and build MCP clients that can connect to any MCP server. It uses standard transports like stdio and Streamable HTTP.

### Installation

```
npm install @modelcontextprotocol/sdk zod
```

This SDK has a **required peer dependency** on `zod` for schema validation. The SDK internally imports from `zod/v4`, but maintains backwards compatibility with projects using Zod v3.25 or later. You can use either API in your code by importing from `zod/v3` or `zod/v4`.

## Quick Start

Create a simple MCP server that exposes a calculator tool and some data. Save as `server.ts`:

```typescript
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import * as z from 'zod/v4';

// Create an MCP server
const server = new McpServer({
    name: 'demo-server',
    version: '1.0.0'
});

// Add an addition tool
server.registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() }
    },
    async ({ a, b }) => {
        const output = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

// Add a dynamic greeting resource
server.registerResource(
    'greeting',
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    {
        title: 'Greeting Resource', // Display name for UI
        description: 'Dynamic greeting generator'
    },
    async (uri, { name }) => ({
        contents: [
            {
                uri: uri.href,
                text: `Hello, ${name}!`
            }
        ]
    })
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});
```

Install deps: `npm install @modelcontextprotocol/sdk express zod`, run with `npx -y tsx server.ts`.

Connect using MCP Inspector: `npx @modelcontextprotocol/inspector` and connect to the streamable HTTP URL `http://localhost:3000/mcp`.

## Core Concepts

### Server

The McpServer is your core interface to the MCP protocol. It handles connection management, protocol compliance, and message routing.

```typescript
const server = new McpServer({
    name: 'my-app',
    version: '1.0.0'
});
```

### Tools

Tools let LLMs take actions through your server. Tools can perform computation, fetch data, and have side effects. Tools should be designed to be model-controlled.

Examples include simple tools with parameters, async tools with external API calls, and tools that return ResourceLinks.

### Resources

Resources expose data to LLMs, but unlike tools, shouldn't perform significant computation or have side effects. Resources are designed for application-driven use.

Examples: static resources, dynamic resources with parameters, resources with context-aware completion.

### Prompts

Prompts are reusable templates that help humans prompt models to interact with your server. They're designed for user-driven interactions.

Examples: simple prompts, prompts with context-aware completion.

### Completions

MCP supports argument completions to help users fill in prompt arguments and resource template parameters.

### Display Names and Metadata

All resources, tools, and prompts support optional `title` field for better UI presentation.

### Sampling

MCP servers can request LLM completions from connected clients that support sampling.

## Running Your Server

### Streamable HTTP

For remote servers, use the Streamable HTTP transport.

#### Without Session Management

For most use cases:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import * as z from 'zod/v4';

const app = express();
app.use(express.json());

// Create the MCP server once
const server = new McpServer({
    name: 'example-server',
    version: '1.0.0'
});

// Set up tools, resources, prompts

app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.listen(3000);
```

#### With Session Management

For stateful sessions:

```typescript
import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

const app = express();
app.use(express.json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: sessionId => {
                transports[sessionId] = transport;
            }
        });

        transport.onclose = () => {
            if (transport.sessionId) {
                delete transports[transport.sessionId];
            }
        };
        const server = new McpServer({
            name: 'example-server',
            version: '1.0.0'
        });

        await server.connect(transport);
    } else {
        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided'
            },
            id: null
        });
        return;
    }

    await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }
    const transport = transports[sessionId];
    transport.handleRequest(req, res);
});

app.delete('/mcp', (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }
    const transport = transports[sessionId];
    transport.handleRequest(req, res);
});

app.listen(3000);
```

#### CORS Configuration

For browser-based clients:

```typescript
import cors from 'cors';

app.use(
    cors({
        origin: '*',
        exposedHeaders: ['Mcp-Session-Id'],
        allowedHeaders: ['Content-Type', 'mcp-session-id']
    })
);
```

#### DNS Rebinding Protection

Enable for local servers:

```typescript
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
  enableDnsRebindingProtection: true,
  allowedHosts: ['127.0.0.1'],
  allowedOrigins: ['https://yourdomain.com', 'https://www.yourdomain.com']
});
```

### stdio

For local integrations:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
    name: 'example-server',
    version: '1.0.0'
});

// Set up server

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Testing and Debugging

Use the MCP Inspector. See its README for more information.

### Node.js Web Crypto Compatibility

For Node.js v18.x, polyfill globalThis.crypto:

```typescript
import { webcrypto } from 'node:crypto';

if (typeof globalThis.crypto === 'undefined') {
    (globalThis as any).crypto = webcrypto as unknown as Crypto;
}
```

## Examples

### Echo Server

```typescript
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';

const server = new McpServer({
    name: 'echo-server',
    version: '1.0.0'
});

server.registerTool(
    'echo',
    {
        title: 'Echo Tool',
        description: 'Echoes back the provided message',
        inputSchema: { message: z.string() },
        outputSchema: { echo: z.string() }
    },
    async ({ message }) => {
        const output = { echo: `Tool echo: ${message}` };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerResource(
    'echo',
    new ResourceTemplate('echo://{message}', { list: undefined }),
    {
        title: 'Echo Resource',
        description: 'Echoes back messages as resources'
    },
    async (uri, { message }) => ({
        contents: [
            {
                uri: uri.href,
                text: `Resource echo: ${message}`
            }
        ]
    })
);

server.registerPrompt(
    'echo',
    {
        title: 'Echo Prompt',
        description: 'Creates a prompt to process a message',
        argsSchema: { message: z.string() }
    },
    ({ message }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please process this message: ${message}`
                }
            }
        ]
    })
);
```

### SQLite Explorer

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as z from 'zod/v4';

const server = new McpServer({
    name: 'sqlite-explorer',
    version: '1.0.0'
});

const getDb = () => {
    const db = new sqlite3.Database('database.db');
    return {
        all: promisify<string, any[]>(db.all.bind(db)),
        close: promisify(db.close.bind(db))
    };
};

server.registerResource(
    'schema',
    'schema://main',
    {
        title: 'Database Schema',
        description: 'SQLite database schema',
        mimeType: 'text/plain'
    },
    async uri => {
        const db = getDb();
        try {
            const tables = await db.all("SELECT sql FROM sqlite_master WHERE type='table'");
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: tables.map((t: { sql: string }) => t.sql).join('\n')
                    }
                ]
            };
        } finally {
            await db.close();
        }
    }
);

server.registerTool(
    'query',
    {
        title: 'SQL Query',
        description: 'Execute SQL queries on the database',
        inputSchema: { sql: z.string() },
        outputSchema: {
            rows: z.array(z.record(z.any())),
            rowCount: z.number()
        }
    },
    async ({ sql }) => {
        const db = getDb();
        try {
            const results = await db.all(sql);
            const output = { rows: results, rowCount: results.length };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(output, null, 2)
                    }
                ],
                structuredContent: output
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error.message}`
                    }
                ],
                isError: true
            };
        } finally {
            await db.close();
        }
    }
);
```

## Advanced Usage

### Dynamic Servers

Add/update/remove tools/resources/prompts after connection.

### Improving Network Efficiency with Notification Debouncing

Enable debouncing for rapid changes.

### Low-Level Server

Use Server class directly.

### Eliciting User Input

Request non-sensitive information via form or URL elicitation.

### Task-Based Execution

Experimental API for long-running operations.

### Writing MCP Clients

High-level client interface.

### OAuth Client Authentication

Helpers for OAuth-secured servers.

### Proxy Authorization Requests Upstream

Proxy OAuth to external providers.

### Backwards Compatibility

Support for older HTTP+SSE transport.

## Architecture Overview

MCP follows a client-server architecture. An MCP host connects to MCP servers via MCP clients. Servers can run locally or remotely.

### Participants

- **MCP Host**: AI application coordinating clients
- **MCP Client**: Component connecting to a server
- **MCP Server**: Program providing context

### Layers

- **Data Layer**: JSON-RPC protocol for communication
- **Transport Layer**: Communication mechanisms (stdio, Streamable HTTP)

### Data Layer Protocol

Uses JSON-RPC 2.0. Includes lifecycle management, primitives (tools, resources, prompts), and notifications.

#### Lifecycle Management

Capability negotiation via initialize request.

#### Primitives

- **Tools**: Executable functions for actions
- **Resources**: Data sources for context
- **Prompts**: Templates for interactions

#### Notifications

Real-time updates for changes.

### Example Data Layer Interaction

Initialization, tool discovery, tool execution, notifications.

## Understanding MCP Servers

Servers provide functionality through tools, resources, and prompts.

### Tools

Model-controlled actions. Examples: search flights, send emails.

### Resources

Application-driven data. Examples: calendar data, documents.

### Prompts

User-controlled templates. Examples: vacation planning.

### Bringing Servers Together

Multi-server scenarios for comprehensive functionality.

## Specification Details

### Prompts

Prompts are user-controlled templates. Capabilities, protocol messages, data types.

### Resources

Resources provide read-only data. Capabilities, protocol messages, data types, URI schemes.

### Tools

Tools enable actions. Capabilities, protocol messages, data types, error handling.

### Completion

Argument autocompletion for prompts and resources.

### Logging

Structured log messages.

### Pagination

Cursor-based pagination for lists.

### Schema Reference

Full JSON schema definitions for all types.

## Base Protocol

### Transports

MCP uses JSON-RPC to encode messages. JSON-RPC messages **MUST** be UTF-8 encoded. The protocol currently defines two standard transport mechanisms for client-server communication: stdio and Streamable HTTP. Clients **SHOULD** support stdio whenever possible. It is also possible for clients and servers to implement custom transports in a pluggable fashion.

#### stdio

In the **stdio** transport:
- The client launches the MCP server as a subprocess.
- The server reads JSON-RPC messages from its standard input (`stdin`) and sends messages to its standard output (`stdout`).
- Messages are individual JSON-RPC requests, notifications, or responses.
- Messages are delimited by newlines, and **MUST NOT** contain embedded newlines.
- The server **MAY** write UTF-8 strings to its standard error (`stderr`) for any logging purposes including informational, debug, and error messages.
- The client **MAY** capture, forward, or ignore the server’s `stderr` output and **SHOULD NOT** assume `stderr` output indicates error conditions.
- The server **MUST NOT** write anything to its `stdout` that is not a valid MCP message.
- The client **MUST NOT** write anything to the server’s `stdin` that is not a valid MCP message.

#### Streamable HTTP

This replaces the HTTP+SSE transport from protocol version 2024-11-05. The server operates as an independent process that can handle multiple client connections. This transport uses HTTP POST and GET requests. Server can optionally make use of Server-Sent Events (SSE) to stream multiple server messages. This permits basic MCP servers, as well as more feature-rich servers supporting streaming and server-to-client notifications and requests.

The server **MUST** provide a single HTTP endpoint path (hereafter referred to as the **MCP endpoint**) that supports both POST and GET methods. For example, this could be a URL like `https://example.com/mcp`.

##### Security Warning

When implementing Streamable HTTP transport:
- Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks
- If the `Origin` header is present and invalid, servers **MUST** respond with HTTP 403 Forbidden. The HTTP response body **MAY** comprise a JSON-RPC _error response_ that has no `id`
- When running locally, servers **SHOULD** bind only to localhost (127.0.0.1) rather than all network interfaces (0.0.0.0)
- Servers **SHOULD** implement proper authentication for all connections

Without these protections, attackers could use DNS rebinding to interact with local MCP servers from remote websites.

##### Sending Messages to the Server

Every JSON-RPC message sent from the client **MUST** be a new HTTP POST request to the MCP endpoint.
- The client **MUST** use HTTP POST to send JSON-RPC messages to the MCP endpoint.
- The client **MUST** include an `Accept` header, listing both `application/json` and `text/event-stream` as supported content types.
- The body of the POST request **MUST** be a single JSON-RPC _request_, _notification_, or _response_.
- If the input is a JSON-RPC _response_ or _notification_:
- If the server accepts the input, the server **MUST** return HTTP status code 202 Accepted with no body.
- If the server cannot accept the input, it **MUST** return an HTTP error status code (e.g., 400 Bad Request). The HTTP response body **MAY** comprise a JSON-RPC _error response_ that has no `id`.
- If the input is a JSON-RPC _request_, the server **MUST** either return `Content-Type: text/event-stream`, to initiate an SSE stream, or `Content-Type: application/json`, to return one JSON object. The client **MUST** support both these cases.
- If the server initiates an SSE stream:
- The server **SHOULD** immediately send an SSE event consisting of an event ID and an empty `data` field in order to prime the client to reconnect (using that event ID as `Last-Event-ID`).
- After the server has sent an SSE event with an event ID to the client, the server **MAY** close the _connection_ (without terminating the _SSE stream_) at any time in order to avoid holding a long-lived connection. The client **SHOULD** then "poll" the SSE stream by attempting to reconnect.
- If the server does close the _connection_ prior to terminating the _SSE stream_, it **SHOULD** send an SSE event with a standard `retry` field before closing the connection. The client **MUST** respect the `retry` field, waiting the given number of milliseconds before attempting to reconnect.
- The SSE stream **SHOULD** eventually include a JSON-RPC _response_ for the JSON-RPC _request_ sent in the POST body.
- The server **MAY** send JSON-RPC _requests_ and _notifications_ before sending the JSON-RPC _response_. These messages **SHOULD** relate to the originating client_request_.
- The server **MAY** terminate the SSE stream if the session expires.
- After the JSON-RPC _response_ has been sent, the server **SHOULD** terminate the SSE stream.
- Disconnection **MAY** occur at any time (e.g., due to network conditions). Therefore:
- Disconnection **SHOULD NOT** be interpreted as the client cancelling its request.
- To cancel, the client **SHOULD** explicitly send an MCP `CancelledNotification`.
- To avoid message loss due to disconnection, the server **MAY** make the stream resumable.

##### Listening for Messages from the Server

- The client **MAY** issue an HTTP GET to the MCP endpoint. This can be used to open an SSE stream, allowing the server to communicate to the client, without the client first sending data via HTTP POST.
- The client **MUST** include an `Accept` header, listing `text/event-stream` as a supported content type.
- The server **MUST** either return `Content-Type: text/event-stream` in response to this HTTP GET, or else return HTTP 405 Method Not Allowed, indicating that the server does not offer an SSE stream at this endpoint.
- If the server initiates an SSE stream:
- The server **MAY** send JSON-RPC _requests_ and _notifications_ on the stream.
- These messages **SHOULD** be unrelated to any concurrently-running JSON-RPC_request_ from the client.
- The server **MUST NOT** send a JSON-RPC _response_ on the stream **unless** resuming a stream associated with a previous client request.
- The server **MAY** close the SSE stream at any time.
- If the server closes the _connection_ without terminating the _stream_, it **SHOULD** follow the same polling behavior as described for POST requests: sending a `retry` field and allowing the client to reconnect.
- The client **MAY** close the SSE stream at any time.

##### Multiple Connections

- The client **MAY** remain connected to multiple SSE streams simultaneously.
- The server **MUST** send each of its JSON-RPC messages on only one of the connected streams; that is, it **MUST NOT** broadcast the same message across multiple streams.
- The risk of message loss **MAY** be mitigated by making the stream resumable.

##### Resumability and Redelivery

To support resuming broken connections, and redelivering messages that might otherwise be lost:
- Servers **MAY** attach an `id` field to their SSE events, as described in the SSE standard.
- If present, the ID **MUST** be globally unique across all streams within that session—or all streams with that specific client, if session management is not in use.
- Event IDs **SHOULD** encode sufficient information to identify the originating stream, enabling the server to correlate a `Last-Event-ID` to the correct stream.
- If the client wishes to resume after a disconnection (whether due to network failure or server-initiated closure), it **SHOULD** issue an HTTP GET to the MCP endpoint, and include the `Last-Event-ID` header to indicate the last event ID it received.
- The server **MAY** use this header to replay messages that would have been sent after the last event ID, _on the stream that was disconnected_, and to resume the stream from that point.
- The server **MUST NOT** replay messages that would have been delivered on a different stream.
- This mechanism applies regardless of how the original stream was initiated (via POST or GET). Resumption is always via HTTP GET with `Last-Event-ID`.

##### Session Management

An MCP "session" consists of logically related interactions between a client and a server, beginning with the initialization phase. To support servers which want to establish stateful sessions:
- A server using the Streamable HTTP transport **MAY** assign a session ID at initialization time, by including it in an `MCP-Session-Id` header on the HTTP response containing the `InitializeResult`.
- The session ID **SHOULD** be globally unique and cryptographically secure (e.g., a securely generated UUID, a JWT, or a cryptographic hash).
- The session ID **MUST** only contain visible ASCII characters (ranging from 0x21 to 0x7E).
- The client **MUST** handle the session ID in a secure manner.
- If an `MCP-Session-Id` is returned by the server during initialization, clients using the Streamable HTTP transport **MUST** include it in the `MCP-Session-Id` header on all of their subsequent HTTP requests.
- Servers that require a session ID **SHOULD** respond to requests without an `MCP-Session-Id` header (other than initialization) with HTTP 400 Bad Request.
- The server **MAY** terminate the session at any time, after which it **MUST** respond to requests containing that session ID with HTTP 404 Not Found.
- When a client receives HTTP 404 in response to a request containing an `MCP-Session-Id`, it **MUST** start a new session by sending a new `InitializeRequest` without a session ID attached.
- Clients that no longer need a particular session (e.g., because the user is leaving the client application) **SHOULD** send an HTTP DELETE to the MCP endpoint with the `MCP-Session-Id` header, to explicitly terminate the session.
- The server **MAY** respond to this request with HTTP 405 Method Not Allowed, indicating that the server does not allow clients to terminate sessions.

##### Protocol Version Header

If using HTTP, the client **MUST** include the `MCP-Protocol-Version: <protocol-version>` HTTP header on all subsequent requests to the MCP server, allowing the MCP server to respond based on the MCP protocol version. For example: `MCP-Protocol-Version: 2025-11-25`. The protocol version sent by the client **SHOULD** be the one negotiated during initialization. For backwards compatibility, if the server does _not_ receive an `MCP-Protocol-Version` header, and has no other way to identify the version - for example, by relying on the protocol version negotiated during initialization - the server **SHOULD** assume protocol version `2025-03-26`. If the server receives a request with an invalid or unsupported `MCP-Protocol-Version`, it **MUST** respond with `400 Bad Request`.

##### Backwards Compatibility

Clients and servers can maintain backwards compatibility with the deprecated HTTP+SSE transport (from protocol version 2024-11-05) as follows: **Servers** wanting to support older clients should continue to host both the SSE and POST endpoints of the old transport, alongside the new "MCP endpoint" defined for the Streamable HTTP transport. It is also possible to combine the old POST endpoint and the new MCP endpoint, but this may introduce unneeded complexity. **Clients** wanting to support older servers should accept an MCP server URL from the user, which may point to either a server using the old transport or the new transport. Attempt to POST an `InitializeRequest` to the server URL, with an `Accept` header as defined above. If it succeeds, the client can assume this is a server supporting the new Streamable HTTP transport. If it fails with the following HTTP status codes "400 Bad Request", "404 Not Found" or "405 Method Not Allowed": Issue a GET request to the server URL, expecting that this will open an SSE stream and return an `endpoint` event as the first event. When the `endpoint` event arrives, the client can assume this is a server running the old HTTP+SSE transport, and should use that transport for all subsequent communication.

#### Custom Transports

Clients and servers **MAY** implement additional custom transport mechanisms to suit their specific needs. The protocol is transport-agnostic and can be implemented over any communication channel that supports bidirectional message exchange. Implementers who choose to support custom transports **MUST** ensure they preserve the JSON-RPC message format and lifecycle requirements defined by MCP. Custom transports **SHOULD** document their specific connection establishment and message exchange patterns to aid interoperability.

### Progress

The Model Context Protocol (MCP) supports optional progress tracking for long-running operations through notification messages. Either side can send progress notifications to provide updates about operation status.

#### Progress Flow

When a party wants to _receive_ progress updates for a request, it includes a `progressToken` in the request metadata.
- Progress tokens **MUST** be a string or integer value
- Progress tokens can be chosen by the sender using any means, but **MUST** be unique across all active requests.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "some_method",
  "params": {
    "_meta": {
      "progressToken": "abc123"
    }
  }
}
```

The receiver **MAY** then send progress notifications containing:
- The original progress token
- The current progress value so far
- An optional "total" value
- An optional "message" value

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "abc123",
    "progress": 50,
    "total": 100,
    "message": "Reticulating splines..."
  }
}
```

- The `progress` value **MUST** increase with each notification, even if the total is unknown.
- The `progress` and the `total` values **MAY** be floating point.
- The `message` field **SHOULD** provide relevant human readable progress information.

#### Behavior Requirements

- Progress notifications **MUST** only reference tokens that:
- Were provided in an active request
- Are associated with an in-progress operation

- Receivers of progress requests **MAY**:
- Choose not to send any progress notifications
- Send notifications at whatever frequency they deem appropriate
- Omit the total value if unknown

- For task-augmented requests, the `progressToken` provided in the original request **MUST** continue to be used for progress notifications throughout the task's lifetime, even after the `CreateTaskResult` has been returned. The progress token remains valid and associated with the task until the task reaches a terminal status.
- Progress notifications for tasks **MUST** use the same `progressToken` that was provided in the initial task-augmented request
- Progress notifications for tasks **MUST** stop after the task reaches a terminal status (`completed`, `failed`, or `cancelled`)

#### Implementation Notes

- Senders and receivers **SHOULD** track active progress tokens
- Both parties **SHOULD** implement rate limiting to prevent flooding
- Progress notifications **MUST** stop after completion

### Tasks

Tasks were introduced in version 2025-11-25 of the MCP specification and are currently considered **experimental**. The design and behavior of tasks may evolve in future protocol versions. The Model Context Protocol (MCP) allows requestors — which can be either clients or servers, depending on the direction of communication — to augment their requests with **tasks**. Tasks are durable state machines that carry information about the underlying execution state of the request they wrap, and are intended for requestor polling and deferred result retrieval. Each task is uniquely identifiable by a receiver-generated **task ID**.

Tasks are useful for representing expensive computations and batch processing requests, and integrate seamlessly with external job APIs.

#### Definitions

Tasks represent parties as either "requestors" or "receivers," defined as follows:
- **Requestor:** The sender of a task-augmented request. This can be the client or the server — either can create tasks.
- **Receiver:** The receiver of a task-augmented request, and the entity executing the task. This can be the client or the server — either can receive and execute tasks.

#### User Interaction Model

Tasks are designed to be **requestor-driven** - requestors are responsible for augmenting requests with tasks and for polling for the results of those tasks; meanwhile, receivers tightly control which requests (if any) support task-based execution and manages the lifecycles of those tasks. This requestor-driven approach ensures deterministic response handling and enables sophisticated patterns such as dispatching concurrent requests, which only the requestor has sufficient context to orchestrate. Implementations are free to expose tasks through any interface pattern that suits their needs — the protocol itself does not mandate any specific user interaction model.

#### Capabilities

Servers and clients that support task-augmented requests **MUST** declare a `tasks` capability during initialization. The `tasks` capability is structured by request category, with boolean properties indicating which specific request types support task augmentation.

##### Server Capabilities

Servers declare if they support tasks, and if so, which server-side requests can be augmented with tasks.

| Capability | Description |
| --- | --- |
| `tasks.list` | Server supports the `tasks/list` operation |
| `tasks.cancel` | Server supports the `tasks/cancel` operation |
| `tasks.requests.tools.call` | Server supports task-augmented `tools/call` requests |

```json
{
  "capabilities": {
    "tasks": {
      "list": {},
      "cancel": {},
      "requests": {
        "tools": {
          "call": {}
        }
      }
    }
  }
}
```

##### Client Capabilities

Clients declare if they support tasks, and if so, which client-side requests can be augmented with tasks.

| Capability | Description |
| --- | --- |
| `tasks.list` | Client supports the `tasks/list` operation |
| `tasks.cancel` | Client supports the `tasks/cancel` operation |
| `tasks.requests.sampling.createMessage` | Client supports task-augmented `sampling/createMessage` requests |
| `tasks.requests.elicitation.create` | Client supports task-augmented `elicitation/create` requests |

```json
{
  "capabilities": {
    "tasks": {
      "list": {},
      "cancel": {},
      "requests": {
        "sampling": {
          "createMessage": {}
        },
        "elicitation": {
          "create": {}
        }
      }
    }
  }
}
```

##### Capability Negotiation

During the initialization phase, both parties exchange their `tasks` capabilities to establish which operations support task-based execution. Requestors **SHOULD** only augment requests with a task if the corresponding capability has been declared by the receiver. For example, if a server's capabilities include `tasks.requests.tools.call: {}`, then clients may augment `tools/call` requests with a task. If a client's capabilities include `tasks.requests.sampling.createMessage: {}`, then servers may augment `sampling/createMessage` requests with a task. If `capabilities.tasks` is not defined, the peer **SHOULD NOT** attempt to create tasks during requests. The set of capabilities in `capabilities.tasks.requests` is exhaustive. If a request type is not present, it does not support task-augmentation. `capabilities.tasks.list` controls if the `tasks/list` operation is supported by the party. `capabilities.tasks.cancel` controls if the `tasks/cancel` operation is supported by the party.

##### Tool-Level Negotiation

Tool calls are given special consideration for the purpose of task augmentation. In the result of `tools/list`, tools declare support for tasks via `execution.taskSupport`, which if present can have a value of `"required"`, `"optional"`, or `"forbidden"`. This is to be interpreted as a fine-grained layer in addition to capabilities, following these rules:
- If a server's capabilities do not include `tasks.requests.tools.call`, then clients **MUST NOT** attempt to use task augmentation on that server's tools, regardless of the `execution.taskSupport` value.
- If a server's capabilities include `tasks.requests.tools.call`, then clients consider the value of `execution.taskSupport`, and handle it accordingly:
- If `execution.taskSupport` is not present or `"forbidden"`, clients **MUST NOT** attempt to invoke the tool as a task. Servers **SHOULD** return a `-32601` (Method not found) error if a client attempts to do so. This is the default behavior.
- If `execution.taskSupport` is `"optional"`, clients **MAY** invoke the tool as a task or as a normal request.
- If `execution.taskSupport` is `"required"`, clients **MUST** invoke the tool as a task. Servers **MUST** return a `-32601` (Method not found) error if a client does not attempt to do so.

#### Protocol Messages

##### Creating Tasks

Task-augmented requests follow a two-phase response pattern that differs from normal requests:
- **Normal requests**: The server processes the request and returns the actual operation result directly.
- **Task-augmented requests**: The server accepts the request and immediately returns a `CreateTaskResult` containing task data. The actual operation result becomes available later through `tasks/result` after the task completes.

To create a task, requestors send a request with the `task` field included in the request params. Requestors **MAY** include a `ttl` value indicating the desired task lifetime duration (in milliseconds).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "city": "New York"
    },
    "task": {
      "ttl": 60000
    }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "task": {
      "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840",
      "status": "working",
      "statusMessage": "The operation is now in progress.",
      "createdAt": "2025-11-25T10:30:00Z",
      "lastUpdatedAt": "2025-11-25T10:40:00Z",
      "ttl": 60000,
      "pollInterval": 5000
    }
  }
}
```

When a receiver accepts a task-augmented request, it returns a `CreateTaskResult` containing task data. The response does not include the actual operation result. The actual result (e.g., tool result for `tools/call`) becomes available only through `tasks/result` after the task completes. When a task is created in response to a `tools/call` request, host applications may wish to return control to the model while the task is executing. This allows the model to continue processing other requests or perform additional work while waiting for the task to complete. To support this pattern, servers can provide an optional `io.modelcontextprotocol/model-immediate-response` key in the `_meta` field of the `CreateTaskResult`. The value of this key should be a string intended to be passed as an immediate tool result to the model. If a server does not provide this field, the host application can fall back to its own predefined message. This guidance is non-binding and is provisional logic intended to account for the specific use case. This behavior may be formalized or modified as part of `CreateTaskResult` in future protocol versions.

##### Getting Tasks

In the Streamable HTTP (SSE) transport, clients **MAY** disconnect from an SSE stream opened by the server in response to a `tasks/get` request at any time. While this note is not prescriptive regarding the specific usage of SSE streams, all implementations **MUST** continue to comply with the existing Streamable HTTP transport specification. Requestors poll for task completion by sending `tasks/get` requests. Requestors **SHOULD** respect the `pollInterval` provided in responses when determining polling frequency. Requestors **SHOULD** continue polling until the task reaches a terminal status (`completed`, `failed`, or `cancelled`), or until encountering the `input_required` status. Note that invoking `tasks/result` does not imply that the requestor needs to stop polling - requestors **SHOULD** continue polling the task status via `tasks/get` if they are not actively waiting for `tasks/result` to complete.

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tasks/get",
  "params": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840"
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840",
    "status": "working",
    "statusMessage": "The operation is now in progress.",
    "createdAt": "2025-11-25T10:30:00Z",
    "lastUpdatedAt": "2025-11-25T10:40:00Z",
    "ttl": 30000,
    "pollInterval": 5000
  }
}
```

##### Retrieving Task Results

In the Streamable HTTP (SSE) transport, clients **MAY** disconnect from an SSE stream opened by the server in response to a `tasks/result` request at any time. While this note is not prescriptive regarding the specific usage of SSE streams, all implementations **MUST** continue to comply with the existing Streamable HTTP transport specification. After a task completes the operation result is retrieved via `tasks/result`. This is distinct from the initial `CreateTaskResult` response, which contains only task data. The result structure matches the original request type (e.g., `CallToolResult` for `tools/call`). To retrieve the result of a completed task, requestors can send a `tasks/result` request: While `tasks/result` blocks until the task reaches a terminal status, requestors can continue polling via `tasks/get` in parallel if they are not actively blocked waiting for the result, such as if their previous `tasks/result` request failed or was cancelled. This allows requestors to monitor status changes or display progress updates while the task executes, even after invoking `tasks/result`.

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tasks/result",
  "params": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840"
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Current weather in New York:\nTemperature: 72°F\nConditions: Partly cloudy"
      }
    ],
    "isError": false,
    "_meta": {
      "io.modelcontextprotocol/related-task": {
        "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840"
      }
    }
  }
}
```

##### Task Status Notification

When a task status changes, receivers **MAY** send a `notifications/tasks/status` notification to inform the requestor of the change. This notification includes the full task state.

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/tasks/status",
  "params": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840",
    "status": "completed",
    "createdAt": "2025-11-25T10:30:00Z",
    "lastUpdatedAt": "2025-11-25T10:50:00Z",
    "ttl": 60000,
    "pollInterval": 5000
  }
}
```

The notification includes the full `Task` object, including the updated `status` and `statusMessage` (if present). This allows requestors to access the complete task state without making an additional `tasks/get` request. Requestors **MUST NOT** rely on receiving this notifications, as it is optional. Receivers are not required to send status notifications and may choose to only send them for certain status transitions. Requestors **SHOULD** continue to poll via `tasks/get` to ensure they receive status updates.

##### Listing Tasks

To retrieve a list of tasks, requestors can send a `tasks/list` request. This operation supports pagination.

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tasks/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "tasks": [
      {
        "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840",
        "status": "working",
        "createdAt": "2025-11-25T10:30:00Z",
        "lastUpdatedAt": "2025-11-25T10:40:00Z",
        "ttl": 30000,
        "pollInterval": 5000
      },
      {
        "taskId": "abc123-def456-ghi789",
        "status": "completed",
        "createdAt": "2025-11-25T09:15:00Z",
        "lastUpdatedAt": "2025-11-25T10:40:00Z",
        "ttl": 60000
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}
```

##### Cancelling Tasks

To explicitly cancel a task, requestors can send a `tasks/cancel` request.

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tasks/cancel",
  "params": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840"
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840",
    "status": "cancelled",
    "statusMessage": "The task was cancelled by request.",
    "createdAt": "2025-11-25T10:30:00Z",
    "lastUpdatedAt": "2025-11-25T10:40:00Z",
    "ttl": 30000,
    "pollInterval": 5000
  }
}
```

#### Behavior Requirements

These requirements apply to all parties that support receiving task-augmented requests.

##### Task Support and Handling

- Receivers that do not declare the task capability for a request type **MUST** process requests of that type normally, ignoring any task-augmentation metadata if present.
- Receivers that declare the task capability for a request type **MAY** return an error for non-task-augmented requests, requiring requestors to use task augmentation.

##### Task ID Requirements

- Task IDs **MUST** be a string value.
- Task IDs **MUST** be generated by the receiver when creating a task.
- Task IDs **MUST** be unique among all tasks controlled by the receiver.

##### Task Status Lifecycle

- Tasks **MUST** begin in the `working` status when created.
- Receivers **MUST** only transition tasks through the following valid paths:
- From `working`: may move to `input_required`, `completed`, `failed`, or `cancelled`
- From `input_required`: may move to `working`, `completed`, `failed`, or `cancelled`
- Tasks with a `completed`, `failed`, or `cancelled` status are in a terminal state and **MUST NOT** transition to any other status

**Task Status State Diagram:**

[Diagram would be here, but text-based]

##### Input Required Status

With the Streamable HTTP (SSE) transport, servers often close SSE streams after delivering a response message, which can lead to ambiguity regarding the stream used for subsequent task messages. Servers can handle this by enqueueing messages to the client to side-channel task-related messages alongside other responses. Servers have flexibility in how they manage SSE streams during task polling and result retrieval, and clients **SHOULD** expect messages to be delivered on any SSE stream, including the HTTP GET stream. One possible approach is maintaining an SSE stream on `tasks/result` (see notes on the `input_required` status). Where possible, servers **SHOULD NOT** upgrade to an SSE stream in response to a `tasks/get` request, as the client has indicated it wishes to poll for a result. While this note is not prescriptive regarding the specific usage of SSE streams, all implementations **MUST** continue to comply with the existing Streamable HTTP transport specification.
- When the task receiver has messages for the requestor that are necessary to complete the task, the receiver **SHOULD** move the task to the `input_required` status.
- The receiver **MUST** include the `io.modelcontextprotocol/related-task` metadata in the request to associate it with the task.
- When the requestor encounters the `input_required` status, it **SHOULD** preemptively call `tasks/result`.
- When the receiver receives all required input, the task **SHOULD** transition out of `input_required` status (typically back to `working`).

##### TTL and Resource Management

- Receivers **MUST** include a `createdAt` ISO 8601-formatted timestamp in all task responses to indicate when the task was created.
- Receivers **MUST** include a `lastUpdatedAt` ISO 8601-formatted timestamp in all task responses to indicate when the task was last updated.
- Receivers **MAY** override the requested `ttl` duration.
- Receivers **MUST** include the actual `ttl` duration (or `null` for unlimited) in `tasks/get` responses.
- After a task's `ttl` lifetime has elapsed, receivers **MAY** delete the task and its results, regardless of the task status.
- Receivers **MAY** include a `pollInterval` value (in milliseconds) in `tasks/get` responses to suggest polling intervals. Requestors **SHOULD** respect this value when provided.

##### Result Retrieval

- Receivers that accept a task-augmented request **MUST** return a `CreateTaskResult` as the response. This result **SHOULD** be returned as soon as possible after accepting the task.
- When a receiver receives a `tasks/result` request for a task in a terminal status (`completed`, `failed`, or `cancelled`), it **MUST** return the final result of the underlying request, whether that is a successful result or a JSON-RPC error.
- When a receiver receives a `tasks/result` request for a task in any other non-terminal status (`working` or `input_required`), it **MUST** block the response until the task reaches a terminal status.
- For tasks in a terminal status, receivers **MUST** return from `tasks/result` exactly what the underlying request would have returned, whether that is a successful result or a JSON-RPC response.

##### Associating Task-Related Messages

- All requests, notifications, and responses related to a task **MUST** include the `io.modelcontextprotocol/related-task` key in their `_meta` field, with the value set to an object with a `taskId` matching the associated task ID.
- For example, an elicitation that a task-augmented tool call depends on **MUST** share the same related task ID with that tool call's task.
- For the `tasks/get`, `tasks/result`, and `tasks/cancel` operations, the `taskId` parameter in the request **MUST** be used as the source of truth for identifying the target task. Requestors **SHOULD NOT** include `io.modelcontextprotocol/related-task` metadata in these requests, and receivers **MUST** ignore such metadata if present in favor of the RPC method parameter. Similarly, for the `tasks/get`, `tasks/list`, and `tasks/cancel` operations, receivers **SHOULD NOT** include `io.modelcontextprotocol/related-task` metadata in the result messages, as the `taskId` is already present in the response structure.

##### Task Notifications

- Receivers **MAY** send `notifications/tasks/status` notifications when a task's status changes.
- Requestors **MUST NOT** rely on receiving the `notifications/tasks/status` notification, as it is optional.
- When sent, the `notifications/tasks/status` notification **SHOULD NOT** include the `io.modelcontextprotocol/related-task` metadata, as the task ID is already present in the notification parameters.

##### Task Progress Notifications

Task-augmented requests support progress notifications as defined in the progress specification. The `progressToken` provided in the initial request remains valid throughout the task lifetime.

##### Task Listing

- Receivers **SHOULD** use cursor-based pagination to limit the number of tasks returned in a single response.
- Receivers **MUST** include a `nextCursor` in the response if more tasks are available.
- Requestors **MUST** treat cursors as opaque tokens and not attempt to parse or modify them.
- If a task is retrievable via `tasks/get` for a requestor, it **MUST** be retrievable via `tasks/list` for that requestor.

##### Task Cancellation

- Receivers **MUST** reject cancellation requests for tasks already in a terminal status (`completed`, `failed`, or `cancelled`) with error code `-32602` (Invalid params).
- Upon receiving a valid cancellation request, receivers **SHOULD** attempt to stop the task execution and **MUST** transition the task to `cancelled` status before sending the response.
- Once a task is cancelled, it **MUST** remain in `cancelled` status even if execution continues to completion or fails.
- The `tasks/cancel` operation does not define deletion behavior. However, receivers **MAY** delete cancelled tasks at their discretion at any time, including immediately after cancellation or after the task `ttl` expires.
- Requestors **SHOULD NOT** rely on cancelled tasks being retained for any specific duration and should retrieve any needed information before cancelling.

#### Message Flow

##### Basic Task Lifecycle

[Sequence diagrams would be here]

##### Task-Augmented Tool Call With Elicitation

[Sequence diagrams would be here]

##### Task-Augmented Sampling Request

[Sequence diagrams would be here]

##### Task Cancellation Flow

[Sequence diagrams would be here]

#### Data Types

##### Task

A task represents the execution state of a request. The task state includes:
- `taskId`: Unique identifier for the task
- `status`: Current state of the task execution
- `statusMessage`: Optional human-readable message describing the current state (can be present for any status, including error details for failed tasks)
- `createdAt`: ISO 8601 timestamp when the task was created
- `ttl`: Time in milliseconds from creation before task may be deleted
- `pollInterval`: Suggested time in milliseconds between status checks
- `lastUpdatedAt`: ISO 8601 timestamp when the task status was last updated

##### Task Status

Tasks can be in one of the following states:
- `working`: The request is currently being processed.
- `input_required`: The receiver needs input from the requestor. The requestor should call `tasks/result` to receive input requests, even though the task has not reached a terminal state.
- `completed`: The request completed successfully and results are available.
- `failed`: The associated request did not complete successfully. For tool calls specifically, this includes cases where the tool call result has `isError` set to true.
- `cancelled`: The request was cancelled before completion.

##### Task Parameters

When augmenting a request with task execution, the `task` field is included in the request parameters:

```json
{
  "task": {
    "ttl": 60000
  }
}
```

Fields:
- `ttl` (number, optional): Requested duration in milliseconds to retain task from creation

##### Related Task Metadata

All requests, responses, and notifications associated with a task **MUST** include the `io.modelcontextprotocol/related-task` key in `_meta`:

```json
{
  "io.modelcontextprotocol/related-task": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f320fe840"
  }
}
```

This associates messages with their originating task across the entire request lifecycle. For the `tasks/get`, `tasks/list`, and `tasks/cancel` operations, requestors and receivers **SHOULD NOT** include this metadata in their messages, as the `taskId` is already present in the message structure. The `tasks/result` operation **MUST** include this metadata in its response, as the result structure itself does not contain the task ID.

#### Error Handling

Tasks use two error reporting mechanisms:
- **Protocol Errors**: Standard JSON-RPC errors for protocol-level issues
- **Task Execution Errors**: Errors in the underlying request execution, reported through task status

##### Protocol Errors

Receivers **MUST** return standard JSON-RPC errors for the following protocol error cases:
- Invalid or nonexistent `taskId` in `tasks/get`, `tasks/result`, or `tasks/cancel`: `-32602` (Invalid params)
- Invalid or nonexistent cursor in `tasks/list`: `-32602` (Invalid params)
- Attempt to cancel a task already in a terminal status: `-32602` (Invalid params)
- Internal errors: `-32603` (Internal error)

Additionally, receivers **MAY** return the following errors:
- Non-task-augmented request when receiver requires task augmentation for that request type: `-32600` (Invalid request)

Receivers **SHOULD** provide informative error messages to describe the cause of errors.

**Example: Task augmentation required**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Task augmentation required for tools/call requests"
  }
}
```

**Example: Task not found**

```json
{
  "jsonrpc": "2.0",
  "id": 70,
  "error": {
    "code": -32602,
    "message": "Failed to retrieve task: Task not found"
  }
}
```

**Example: Task expired**

```json
{
  "jsonrpc": "2.0",
  "id": 71,
  "error": {
    "code": -32602,
    "message": "Failed to retrieve task: Task has expired"
  }
}
```

**Example: Task cancellation rejected (already terminal)**

```json
{
  "jsonrpc": "2.0",
  "id": 74,
  "error": {
    "code": -32602,
    "message": "Cannot cancel task: already in terminal status 'completed'"
  }
}
```

Receivers are not required to retain tasks indefinitely. It is compliant behavior for a receiver to return an error stating the task cannot be found if it has purged an expired task.

##### Task Execution Errors

When the underlying request does not complete successfully, the task moves to the `failed` status. This includes JSON-RPC protocol errors during request execution, or for tool calls specifically, when the tool result has `isError` set to true. The `tasks/get` response **SHOULD** include a `statusMessage` field with diagnostic information about the failure.

**Example: Task with execution error**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "taskId": "786512e2-9e0d-44bd-8f29-789f820fe840",
    "status": "failed",
    "createdAt": "2025-11-25T10:30:00Z",
    "lastUpdatedAt": "2025-11-25T10:40:00Z",
    "ttl": 30000,
    "statusMessage": "Tool execution failed: API rate limit exceeded"
  }
}
```

For tasks that wrap tool call requests, when the tool result has `isError` set to `true`, the task should reach `failed` status. The `tasks/result` endpoint returns exactly what the underlying request would have returned:
- If the underlying request resulted in a JSON-RPC error, `tasks/result` **MUST** return that same JSON-RPC error.
- If the request completed with a JSON-RPC response, `tasks/result` **MUST** return a successful JSON-RPC response containing that result.

#### Security Considerations

##### Task Isolation and Access Control

Task IDs are the primary mechanism for accessing task state and results. Without proper access controls, any party that can guess or obtain a task ID could potentially access sensitive information or manipulate tasks they did not create. When an authorization context is provided, receivers **MUST** bind tasks to said context. Context-binding is not practical for all applications. Some MCP servers operate in environments without authorization, such as single-user tools, or use transports that don't support authorization. In these scenarios, receivers **SHOULD** document this limitation clearly, as task results may be accessible to any requestor that can guess the task ID. If context-binding is unavailable, receivers **MUST** generate cryptographically secure task IDs with enough entropy to prevent guessing and should consider using shorter TTL durations to reduce the exposure window. If context-binding is available, receivers **MUST** reject `tasks/get`, `tasks/result`, and `tasks/cancel` requests for tasks that do not belong to the same authorization context as the requestor. For `tasks/list` requests, receivers **MUST** ensure the returned task list includes only tasks associated with the requestor's authorization context. Additionally, receivers **SHOULD** implement rate limiting on task operations to prevent denial-of-service and enumeration attacks.

##### Resource Management

- Receivers **SHOULD**:
- Enforce limits on concurrent tasks per requestor
- Enforce maximum `ttl` durations to prevent indefinite resource retention
- Clean up expired tasks promptly to free resources
- Document maximum supported `ttl` duration
- Document maximum concurrent tasks per requestor
- Implement monitoring and alerting for resource usage

##### Audit and Logging

- Receivers **SHOULD**:
- Log task creation, completion, and retrieval events for audit purposes
- Include auth context in logs when available
- Monitor for suspicious patterns (e.g., many failed task lookups, excessive polling)

- Requestors **SHOULD**:
- Log task lifecycle events for debugging and audit purposes
- Track task IDs and their associated operations

This document compiles information from the TypeScript SDK README, architecture docs, server concepts, and all specification pages for prompts, resources, tools, completion, logging, pagination, schema, transports, progress, and tasks. It includes details on stdio and HTTP/SSE transports.