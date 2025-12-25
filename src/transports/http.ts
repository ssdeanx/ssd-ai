import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';

interface HttpTransportOptions {
  port?: number;
  hostname?: string;
  allowedOrigins?: string[];
  allowedHosts?: string[];
}

export class HttpServerTransport {
  private app: express.Express;
  private server: any;
  private messageHandler?: (message: JSONRPCMessage) => Promise<void>;
  private closeHandler?: () => void;
  private _sessionId: string | undefined;
  private options: HttpTransportOptions;

  constructor(options: HttpTransportOptions = {}) {
    this.options = {
      port: 8081,
      // Bind to all interfaces by default so container deployments are reachable
      hostname: '0.0.0.0',
      // Allowlist kept for reference but we will send permissive CORS for discovery
      allowedOrigins: ['http://localhost:*', 'https://localhost:*'],
      allowedHosts: ['127.0.0.1', 'localhost'],
      ...options
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  onmessage(handler: (message: JSONRPCMessage) => Promise<void>): void {
    this.messageHandler = handler;
  }

  onclose(handler: () => void): void {
    this.closeHandler = handler;
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));

    // Request logging for discovery/debugging
    // Initialize file-based logging for requests so operators can fetch logs via HTTP
    const logDir = process.env.LOG_DIR || '/data/logs';
    const logFile = path.join(logDir, 'requests.log');
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (e) {
      console.error('Failed to ensure log directory exists:', e);
    }

    const logToFile = (message: string) => {
      try {
        fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
      } catch (e) {
        // non-fatal - don't block request handling
        console.error('Error writing to log file:', e);
      }
    };

    this.app.use((req, res, next) => {
      try {
        const headers = Object.keys(req.headers).reduce((acc, key) => {
          acc[key] = req.headers[key as keyof typeof req.headers];
          return acc;
        }, {} as Record<string, any>);
        const msg = `[HTTP] ${req.method} ${req.path} - headers: ${JSON.stringify(headers)}`;
        console.log(msg);
        logToFile(msg);
      } catch (e) {
        console.log('[HTTP] Error logging request', e);
      }
      next();
    });

    // CORS middleware
    this.app.use((req, res, next) => {
      const origin = req.headers.origin as string;
      const allowedOrigins = this.options.allowedOrigins || [];

      // Check if origin is allowed (simple pattern matching)
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowed === origin;
      });

      // For discovery and browser-based clients, allow all origins to avoid CORS blocking.
      res.header('Access-Control-Allow-Origin', origin || '*');

      // Expose MCP headers and allow common methods/headers
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, MCP-Session-Id, MCP-Protocol-Version, Last-Event-ID');
      res.header('Access-Control-Expose-Headers', 'mcp-session-id, mcp-protocol-version');
      res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }

      next();
    });
  }

  private setupRoutes() {
    // Robust handler: match well-known paths anywhere in URL and for any method (HEAD/GET/OPTIONS)
    this.app.use((req, res, next) => {
      const url = (req.originalUrl || req.url || '').toLowerCase();
      // Accept queries and trailing slashes; match substring
      if (url.includes('/.well-known/mcp-config')) {
        console.log('[HTTP] Well-known probe:', req.method, url, 'host=', req.get('host'));
        res.header('Cache-Control', 'no-store');
        res.header('X-MCP-Discovery', 'true');
        res.header('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') return res.sendStatus(200);
        // Respond with schema
        const host = req.get('host') || 'localhost';
        const schema = {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: `https://${host}/.well-known/mcp-config`,
          title: 'MCP Session Configuration',
          description: 'Configuration for connecting to this MCP server',
          'x-query-style': 'dot+bracket',
          type: 'object',
          properties: {
            enableAutoSave: {
              type: 'boolean',
              title: 'Enable Auto Save',
              description: 'Automatically save session context between interactions',
              default: true
            },
            defaultPriority: {
              type: 'string',
              title: 'Default Task Priority',
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium'
            }
          },
          additionalProperties: false
        };
        return res.status(200).json(schema);
      }

      if (url.includes('/.well-known/mcp-server-card')) {
        console.log('[HTTP] Well-known probe:', req.method, url, 'host=', req.get('host'));
        res.header('Cache-Control', 'no-store');
        res.header('X-MCP-Discovery', 'true');
        res.header('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') return res.sendStatus(200);
        const serverCard = {
          $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
          version: '1.0',
          protocolVersion: '2025-11-25',
          serverInfo: {
            name: 'hi-ai',
            title: 'Hi-AI',
            version: '1.6.0',
            description: 'Model Context Protocol based AI development assistant',
            iconUrl: 'https://raw.githubusercontent.com/ssdeanx/ssd-ai/main/icon.png',
            documentationUrl: 'https://github.com/ssdeanx/ssd-ai'
          },
          transport: {
            type: 'streamable-http',
            endpoint: '/mcp'
          },
          authentication: {
            required: false,
            schemes: []
          },
          requires: [],
          capabilities: {
            tools: { listChanged: true },
            prompts: { listChanged: true },
            resources: { listChanged: true }
          }
        };

        return res.status(200).json(serverCard);
      }

      next();
    });

    // Well-known endpoints are handled above by the flexible handler (supports proxies and query strings)


    // Health endpoint for quick runtime checks
    this.app.get('/health', (req, res) => {
      const health = {
        status: 'ok',
        authentication: false,
        memories: {
          dir: process.env.MEMORIES_DIR || null,
          dbPath: process.env.MEMORY_DB_PATH || null
        },
        endpoints: {
          mcp: '/mcp',
          mcpConfig: '/.well-known/mcp-config',
          mcpServerCard: '/.well-known/mcp-server-card',
          logs: '/logs'
        }
      };
      res.header('Content-Type', 'application/json');
      res.status(200).json(health);
    });

    // Logs endpoint - returns last N lines of request log
    this.app.get('/logs', (req, res) => {
      const logDir = process.env.LOG_DIR || '/data/logs';
      const logFile = path.join(logDir, 'requests.log');
      const lines = parseInt((req.query.lines as string) || '100', 10);

      try {
        if (!fs.existsSync(logFile)) {
          return res.status(404).json({ error: 'Log file not found' });
        }

        // Read file and return last `lines` lines
        const data = fs.readFileSync(logFile, 'utf-8');
        const allLines = data.trim().split('\n');
        const tail = allLines.slice(Math.max(0, allLines.length - lines)).join('\n');

        res.header('Content-Type', 'text/plain');
        return res.status(200).send(tail);
      } catch (error) {
        console.error('Error reading logs:', error);
        return res.status(500).json({ error: 'Failed to read logs' });
      }
    });

    // MCP endpoint
    this.app.all('/mcp', async (req, res) => {
      try {
        const protocolVersion = req.headers['mcp-protocol-version'] as string;

        // Validate protocol version
        if (!protocolVersion || protocolVersion !== '2025-11-25') {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Unsupported protocol version',
              data: {
                supported: ['2025-11-25'],
                requested: protocolVersion
              }
            },
            id: null
          });
        }

        // Handle the message
        if (req.body && this.messageHandler) {
          // Handle POST requests with JSON-RPC messages
          await this.messageHandler(req.body);

          // For requests, we expect a response to be sent back
          // The response will be handled by the message handler
          res.status(202).json({ status: 'accepted' });
        } else if (req.method === 'GET') {
          // Handle GET requests for SSE or polling
          res.status(200).json({ status: 'connected' });
        } else {
          res.status(400).json({ error: 'Invalid request' });
        }
      } catch (error) {
        console.error('HTTP transport error:', error);
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error'
          },
          id: null
        });
      }
    });

    // Session termination
    this.app.delete('/mcp', (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string;
      if (sessionId === this.sessionId) {
        this.close();
        res.status(204).send();
      } else {
        res.status(404).send();
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.options.port!, this.options.hostname!, () => {
          console.log(`MCP HTTP server running on http://${this.options.hostname}:${this.options.port}/mcp`);
          this._sessionId = randomUUID();
          resolve();
        });

        this.server.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    // For HTTP transport, we can't send unsolicited messages
    // Messages are sent in response to requests
    // This is a limitation of HTTP vs persistent connections
    console.log('HTTP transport received message to send:', message);
  }

  async close(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    if (this.closeHandler) {
      this.closeHandler();
    }
  }

  get sessionId(): string | undefined {
    return this._sessionId;
  }
}
