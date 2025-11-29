// Python code parser utility (v1.5)
// Uses Python's ast module via child_process for code analysis

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const execAsync = promisify(exec);

// Execution configuration
const EXEC_CONFIG = {
  maxBuffer: 10 * 1024 * 1024, // 10MB
  timeout: 30000 // 30 seconds
} as const;

// Simple LRU cache for analysis results
interface CacheEntry {
  result: any;
  timestamp: number;
}

const RESULT_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute
const MAX_CACHE_SIZE = 50;

export interface PythonSymbol {
  name: string;
  kind: 'function' | 'class' | 'variable' | 'import';
  line: number;
  column: number;
  endLine?: number;
  docstring?: string;
}

export interface PythonComplexity {
  cyclomaticComplexity: number;
  functions: Array<{
    name: string;
    complexity: number;
    line: number;
  }>;
  classes: Array<{
    name: string;
    methods: number;
    line: number;
  }>;
}

export class PythonParser {
  private static cleanupRegistered = false;

  private static pythonScript = `
import ast
import sys
import json

def analyze_code(code):
    try:
        tree = ast.parse(code)
        symbols = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                symbols.append({
                    'name': node.name,
                    'kind': 'function',
                    'line': node.lineno,
                    'column': node.col_offset,
                    'endLine': node.end_lineno,
                    'docstring': ast.get_docstring(node)
                })
            elif isinstance(node, ast.ClassDef):
                symbols.append({
                    'name': node.name,
                    'kind': 'class',
                    'line': node.lineno,
                    'column': node.col_offset,
                    'endLine': node.end_lineno,
                    'docstring': ast.get_docstring(node)
                })
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        symbols.append({
                            'name': target.id,
                            'kind': 'variable',
                            'line': node.lineno,
                            'column': node.col_offset
                        })
            elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    symbols.append({
                        'name': alias.name,
                        'kind': 'import',
                        'line': node.lineno,
                        'column': node.col_offset
                    })

        return {'success': True, 'symbols': symbols}
    except SyntaxError as e:
        return {'success': False, 'error': str(e)}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def calculate_complexity(code):
    try:
        tree = ast.parse(code)

        def cyclomatic_complexity(node):
            complexity = 1
            for child in ast.walk(node):
                if isinstance(child, (ast.If, ast.For, ast.While, ast.And, ast.Or, ast.ExceptHandler)):
                    complexity += 1
                elif isinstance(child, ast.BoolOp):
                    complexity += len(child.values) - 1
            return complexity

        functions = []
        classes = []
        total_complexity = 1

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_complexity = cyclomatic_complexity(node)
                functions.append({
                    'name': node.name,
                    'complexity': func_complexity,
                    'line': node.lineno
                })
                total_complexity += func_complexity
            elif isinstance(node, ast.ClassDef):
                method_count = sum(1 for n in node.body if isinstance(n, ast.FunctionDef))
                classes.append({
                    'name': node.name,
                    'methods': method_count,
                    'line': node.lineno
                })

        return {
            'success': True,
            'cyclomaticComplexity': total_complexity,
            'functions': functions,
            'classes': classes
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    code = sys.stdin.read()
    action = sys.argv[1] if len(sys.argv) > 1 else 'symbols'

    if action == 'symbols':
        result = analyze_code(code)
    elif action == 'complexity':
        result = calculate_complexity(code)
    else:
        result = {'success': False, 'error': 'Unknown action'}

    print(json.dumps(result))
`;

  // Singleton Python script path to avoid recreating it
  private static scriptPath: string | null = null;
  private static pythonCommand: string | null = null;
  private static pythonChecked = false;

  /**
   * Check and cache Python command availability
   */
  private static async getPythonCommand(): Promise<string> {
    if (this.pythonCommand) {
      return this.pythonCommand;
    }

    // Try python3 first, then python
    const commands = ['python3', 'python'];
    for (const cmd of commands) {
      try {
        await execAsync(`${cmd} --version`, { timeout: 5000 });
        this.pythonCommand = cmd;
        return cmd;
      } catch {
        continue;
      }
    }
    throw new Error('Python 3 not found. Please install Python 3 to analyze Python code.');
  }

  /**
   * Generate cache key for code + action
   */
  private static getCacheKey(code: string, action: string): string {
    const hash = crypto.createHash('md5').update(code).digest('hex');
    return `${action}:${hash}`;
  }

  /**
   * Get cached result if valid
   */
  private static getCachedResult(key: string): any | null {
    const entry = RESULT_CACHE.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.result;
    }
    if (entry) {
      RESULT_CACHE.delete(key);
    }
    return null;
  }

  /**
   * Cache result with LRU eviction
   */
  private static cacheResult(key: string, result: any): void {
    // LRU eviction if cache is full
    if (RESULT_CACHE.size >= MAX_CACHE_SIZE) {
      const oldestKey = RESULT_CACHE.keys().next().value;
      if (oldestKey) {
        RESULT_CACHE.delete(oldestKey);
      }
    }
    RESULT_CACHE.set(key, { result, timestamp: Date.now() });
  }

  /**
   * Register cleanup handlers on first use
   */
  private static registerCleanup(): void {
    if (this.cleanupRegistered) {
      return;
    }

    this.cleanupRegistered = true;

    // Cleanup on normal exit
    process.on('exit', () => {
      if (this.scriptPath) {
        try {
          const fs = require('fs');
          fs.unlinkSync(this.scriptPath);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    });

    // Cleanup on SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.cleanup().then(() => process.exit(0));
    });

    // Cleanup on SIGTERM
    process.on('SIGTERM', () => {
      this.cleanup().then(() => process.exit(0));
    });

    // Cleanup on uncaught exception
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.cleanup().then(() => process.exit(1));
    });
  }

  /**
   * Initialize Python script (singleton pattern)
   */
  private static async ensureScriptExists(): Promise<string> {
    if (this.scriptPath) {
      return this.scriptPath;
    }

    // Register cleanup handlers on first use
    this.registerCleanup();

    this.scriptPath = path.join(os.tmpdir(), `hi-ai-parser-${process.pid}.py`);
    await writeFile(this.scriptPath, this.pythonScript);
    return this.scriptPath;
  }

  /**
   * Execute Python code analysis with caching and spawn for better memory
   */
  private static async executePython(code: string, action: 'symbols' | 'complexity'): Promise<any> {
    // Check cache first
    const cacheKey = this.getCacheKey(code, action);
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const pythonCmd = await this.getPythonCommand();
      const scriptPath = await this.ensureScriptExists();

      // Use spawn with stdin piping - no temp file needed
      const result = await new Promise<any>((resolve, reject) => {
        const child = spawn(pythonCmd, [scriptPath, action], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (exitCode) => {
          if (stderr && !stderr.includes('DeprecationWarning')) {
            console.error('Python stderr:', stderr);
          }

          try {
            const parsed = JSON.parse(stdout);
            if (!parsed.success) {
              reject(new Error(parsed.error || `Python ${action} analysis failed`));
            } else {
              resolve(parsed);
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${stdout.substring(0, 200)}`));
          }
        });

        child.on('error', (error) => {
          reject(error);
        });

        // Set timeout
        const timeout = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error('Python execution timed out'));
        }, EXEC_CONFIG.timeout);

        child.on('close', () => clearTimeout(timeout));

        // Write code to stdin and close
        child.stdin.write(code);
        child.stdin.end();
      });

      // Cache successful result
      this.cacheResult(cacheKey, result);
      return result;

    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error('Python 3 not found. Please install Python 3 to analyze Python code.');
      }
      throw error;
    }
  }

  public static async findSymbols(code: string): Promise<PythonSymbol[]> {
    const result = await this.executePython(code, 'symbols');
    return result.symbols || [];
  }

  public static async analyzeComplexity(code: string): Promise<PythonComplexity> {
    const result = await this.executePython(code, 'complexity');
    return {
      cyclomaticComplexity: result.cyclomaticComplexity || 1,
      functions: result.functions || [],
      classes: result.classes || []
    };
  }

  /**
   * Cleanup singleton script on process exit
   */
  public static async cleanup(): Promise<void> {
    if (this.scriptPath) {
      await unlink(this.scriptPath).catch(() => {});
      this.scriptPath = null;
    }
    // Clear result cache
    RESULT_CACHE.clear();
    this.pythonCommand = null;
  }

  public static isPythonFile(filePath: string): boolean {
    return filePath.endsWith('.py');
  }

  public static isPythonCode(code: string): boolean {
    // Heuristic: Check for Python-specific patterns
    const pythonPatterns = [
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /^def\s+\w+\s*\(/m,
      /^class\s+\w+/m,
      /^if\s+__name__\s*==\s*['"]__main__['"]/m
    ];

    return pythonPatterns.some(pattern => pattern.test(code));
  }
}
