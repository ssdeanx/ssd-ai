/**
 * MCP Task Types
 * Based on MCP Specification 2025-11-25
 * Tasks are durable state machines for long-running operations
 */

/**
 * Task status values following the MCP specification
 * - working: The request is currently being processed
 * - input_required: The receiver needs input from the requestor
 * - completed: The request completed successfully and results are available
 * - failed: The associated request did not complete successfully
 * - cancelled: The request was cancelled before completion
 */
export type TaskStatus = 'working' | 'input_required' | 'completed' | 'failed' | 'cancelled';

/**
 * Terminal statuses where no further transitions are allowed
 */
export const TERMINAL_STATUSES: TaskStatus[] = ['completed', 'failed', 'cancelled'];

/**
 * Task parameters for creating a task-augmented request
 */
export interface TaskParams {
  /** Requested duration in milliseconds to retain task from creation */
  ttl?: number;
}

/**
 * Related task metadata included in _meta field
 */
export interface RelatedTaskMeta {
  taskId: string;
}

/**
 * Full task object representing execution state
 */
export interface Task {
  /** Unique identifier for the task */
  taskId: string;
  /** Current state of the task execution */
  status: TaskStatus;
  /** Optional human-readable message describing the current state */
  statusMessage?: string;
  /** ISO 8601 timestamp when the task was created */
  createdAt: string;
  /** ISO 8601 timestamp when the task status was last updated */
  lastUpdatedAt: string;
  /** Time in milliseconds from creation before task may be deleted */
  ttl: number;
  /** Suggested time in milliseconds between status checks */
  pollInterval?: number;
}

/**
 * Internal task storage with additional metadata
 */
export interface StoredTask extends Task {
  /** The method that was called (e.g., 'tools/call') */
  method: string;
  /** The original request parameters */
  requestParams: unknown;
  /** The result of the operation (if completed) */
  result?: unknown;
  /** Error information (if failed) */
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  /** Progress token for progress notifications */
  progressToken?: string | number;
}

/**
 * Result returned when a task is created
 */
export interface CreateTaskResult {
  task: Task;
}

/**
 * Parameters for tasks/get request
 */
export interface GetTaskParams {
  taskId: string;
}

/**
 * Parameters for tasks/result request
 */
export interface GetTaskResultParams {
  taskId: string;
}

/**
 * Parameters for tasks/list request
 */
export interface ListTasksParams {
  cursor?: string;
}

/**
 * Result of tasks/list request
 */
export interface ListTasksResult {
  tasks: Task[];
  nextCursor?: string;
}

/**
 * Parameters for tasks/cancel request
 */
export interface CancelTaskParams {
  taskId: string;
}

/**
 * Task status notification parameters
 */
export interface TaskStatusNotificationParams extends Task { }

/**
 * Tool execution configuration for task support
 */
export interface ToolTaskSupport {
  /** Whether task augmentation is required, optional, or forbidden */
  taskSupport?: 'required' | 'optional' | 'forbidden';
}

/**
 * Task capabilities for server/client
 */
export interface TaskCapabilities {
  /** Server supports tasks/list operation */
  list?: Record<string, never>;
  /** Server supports tasks/cancel operation */
  cancel?: Record<string, never>;
  /** Request types that support task augmentation */
  requests?: {
    tools?: {
      call?: Record<string, never>;
    };
    sampling?: {
      createMessage?: Record<string, never>;
    };
    elicitation?: {
      create?: Record<string, never>;
    };
  };
}

/**
 * Default TTL for tasks (5 minutes)
 */
export const DEFAULT_TASK_TTL = 5 * 60 * 1000;

/**
 * Maximum TTL for tasks (1 hour)
 */
export const MAX_TASK_TTL = 60 * 60 * 1000;

/**
 * Default poll interval (5 seconds)
 */
export const DEFAULT_POLL_INTERVAL = 5000;

/**
 * Page size for task listing
 */
export const TASK_PAGE_SIZE = 20;
