/**
 * MCP Task Manager
 * Handles creation, tracking, and lifecycle management of tasks
 * Based on MCP Specification 2025-11-25
 */

import { randomUUID } from 'crypto';
import { decodeCursor, encodeCursor } from '../types/pagination.js';
import {
  DEFAULT_POLL_INTERVAL,
  DEFAULT_TASK_TTL,
  MAX_TASK_TTL,
  TASK_PAGE_SIZE,
  TERMINAL_STATUSES,
  type CancelTaskParams,
  type CreateTaskResult,
  type GetTaskParams,
  type GetTaskResultParams,
  type ListTasksParams,
  type ListTasksResult,
  type StoredTask,
  type Task,
  type TaskParams,
  type TaskStatus,
} from '../types/task.js';

/**
 * Task execution function type
 * Returns a promise that resolves with the result or rejects with an error
 */
export type TaskExecutor<T = unknown> = () => Promise<T>;

/**
 * Task status change callback
 */
export type TaskStatusCallback = (task: Task) => void | Promise<void>;

/**
 * TaskManager handles the lifecycle of long-running tasks
 */
export class TaskManager {
  private tasks: Map<string, StoredTask> = new Map();
  private statusCallbacks: TaskStatusCallback[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of expired tasks
    this.startCleanupInterval();
  }

  /**
   * Register a callback for task status changes
   */
  onStatusChange(callback: TaskStatusCallback): void {
    this.statusCallbacks.push(callback);
  }

  /**
   * Remove a status change callback
   */
  offStatusChange(callback: TaskStatusCallback): void {
    const index = this.statusCallbacks.indexOf(callback);
    if (index !== -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  /**
   * Create a new task for a request
   */
  createTask(
    method: string,
    requestParams: unknown,
    taskParams?: TaskParams,
    progressToken?: string | number
  ): CreateTaskResult {
    const taskId = randomUUID();
    const now = new Date().toISOString();

    // Calculate TTL (bounded by MAX_TASK_TTL)
    const requestedTtl = taskParams?.ttl ?? DEFAULT_TASK_TTL;
    const ttl = Math.min(requestedTtl, MAX_TASK_TTL);

    const storedTask: StoredTask = {
      taskId,
      status: 'working',
      createdAt: now,
      lastUpdatedAt: now,
      ttl,
      pollInterval: DEFAULT_POLL_INTERVAL,
      method,
      requestParams,
      progressToken,
    };

    this.tasks.set(taskId, storedTask);

    return {
      task: this.toPublicTask(storedTask),
    };
  }

  /**
   * Execute a task asynchronously
   */
  async executeTask<T>(
    taskId: string,
    executor: TaskExecutor<T>
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    try {
      const result = await executor();
      await this.completeTask(taskId, result);
    } catch (error) {
      await this.failTask(taskId, error);
    }
  }

  /**
   * Get a task by ID
   */
  getTask(params: GetTaskParams): Task | null {
    const task = this.tasks.get(params.taskId);
    if (!task) {
      return null;
    }

    // Check if task has expired
    if (this.isExpired(task)) {
      this.tasks.delete(params.taskId);
      return null;
    }

    return this.toPublicTask(task);
  }

  /**
   * Get the result of a completed task
   * Returns the result if completed, error if failed, null if not found
   * For non-terminal statuses, returns the task with current status
   */
  getTaskResult(params: GetTaskResultParams): {
    result?: unknown;
    error?: { code: number; message: string; data?: unknown };
    task?: Task;
    isTerminal: boolean;
  } | null {
    const storedTask = this.tasks.get(params.taskId);
    if (!storedTask) {
      return null;
    }

    // Check if task has expired
    if (this.isExpired(storedTask)) {
      this.tasks.delete(params.taskId);
      return null;
    }

    const isTerminal = TERMINAL_STATUSES.includes(storedTask.status);

    if (storedTask.status === 'completed') {
      return {
        result: storedTask.result,
        isTerminal: true,
      };
    }

    if (storedTask.status === 'failed') {
      return {
        error: storedTask.error ?? {
          code: -32603,
          message: 'Task failed with unknown error',
        },
        isTerminal: true,
      };
    }

    if (storedTask.status === 'cancelled') {
      return {
        error: {
          code: -32603,
          message: 'Task was cancelled',
        },
        isTerminal: true,
      };
    }

    // For non-terminal statuses (working, input_required)
    return {
      task: this.toPublicTask(storedTask),
      isTerminal: false,
    };
  }

  /**
   * List all tasks with pagination
   */
  listTasks(params: ListTasksParams): ListTasksResult {
    // Get all non-expired tasks sorted by creation time (newest first)
    const allTasks = Array.from(this.tasks.values())
      .filter((task) => !this.isExpired(task))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Clean up expired tasks while we're at it
    this.cleanupExpiredTasks();

    let offset = 0;
    if (params.cursor) {
      const cursorData = decodeCursor(params.cursor);
      if (cursorData) {
        offset = cursorData.offset;
      }
    }

    const paginatedTasks = allTasks.slice(offset, offset + TASK_PAGE_SIZE);
    const hasMore = offset + TASK_PAGE_SIZE < allTasks.length;

    const result: ListTasksResult = {
      tasks: paginatedTasks.map((t) => this.toPublicTask(t)),
    };

    if (hasMore) {
      result.nextCursor = encodeCursor({
        offset: offset + TASK_PAGE_SIZE,
        limit: TASK_PAGE_SIZE,
      });
    }

    return result;
  }

  /**
   * Cancel a task
   */
  async cancelTask(params: CancelTaskParams): Promise<Task | null> {
    const task = this.tasks.get(params.taskId);
    if (!task) {
      return null;
    }

    // Cannot cancel tasks in terminal status
    if (TERMINAL_STATUSES.includes(task.status)) {
      throw new Error(`Cannot cancel task: already in terminal status '${task.status}'`);
    }

    task.status = 'cancelled';
    task.statusMessage = 'The task was cancelled by request.';
    task.lastUpdatedAt = new Date().toISOString();

    await this.notifyStatusChange(task);

    return this.toPublicTask(task);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    statusMessage?: string
  ): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    // Cannot transition from terminal status
    if (TERMINAL_STATUSES.includes(task.status)) {
      return null;
    }

    task.status = status;
    if (statusMessage !== undefined) {
      task.statusMessage = statusMessage;
    }
    task.lastUpdatedAt = new Date().toISOString();

    await this.notifyStatusChange(task);

    return this.toPublicTask(task);
  }

  /**
   * Mark a task as requiring input
   */
  async setInputRequired(taskId: string, message?: string): Promise<Task | null> {
    return this.updateTaskStatus(taskId, 'input_required', message ?? 'Input required to continue');
  }

  /**
   * Resume a task from input_required status
   */
  async resumeTask(taskId: string): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'input_required') {
      return null;
    }

    return this.updateTaskStatus(taskId, 'working', 'Task resumed');
  }

  /**
   * Complete a task with a result
   */
  private async completeTask(taskId: string, result: unknown): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.status = 'completed';
    task.result = result;
    task.lastUpdatedAt = new Date().toISOString();
    delete task.statusMessage;

    await this.notifyStatusChange(task);
  }

  /**
   * Fail a task with an error
   */
  private async failTask(taskId: string, error: unknown): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.status = 'failed';
    task.lastUpdatedAt = new Date().toISOString();

    if (error instanceof Error) {
      task.statusMessage = error.message;
      task.error = {
        code: -32603,
        message: error.message,
      };
    } else if (typeof error === 'object' && error !== null) {
      const errObj = error as { code?: number; message?: string; data?: unknown };
      task.error = {
        code: errObj.code ?? -32603,
        message: errObj.message ?? 'Unknown error',
        data: errObj.data,
      };
      task.statusMessage = task.error.message;
    } else {
      task.error = {
        code: -32603,
        message: String(error),
      };
      task.statusMessage = task.error.message;
    }

    await this.notifyStatusChange(task);
  }

  /**
   * Notify all registered callbacks of a status change
   */
  private async notifyStatusChange(task: StoredTask): Promise<void> {
    const publicTask = this.toPublicTask(task);
    for (const callback of this.statusCallbacks) {
      try {
        await callback(publicTask);
      } catch (error) {
        console.error('Error in task status callback:', error);
      }
    }
  }

  /**
   * Convert a stored task to a public task (without internal fields)
   */
  private toPublicTask(task: StoredTask): Task {
    return {
      taskId: task.taskId,
      status: task.status,
      statusMessage: task.statusMessage,
      createdAt: task.createdAt,
      lastUpdatedAt: task.lastUpdatedAt,
      ttl: task.ttl,
      pollInterval: task.pollInterval,
    };
  }

  /**
   * Check if a task has expired
   */
  private isExpired(task: StoredTask): boolean {
    const createdAt = new Date(task.createdAt).getTime();
    const now = Date.now();
    return now - createdAt > task.ttl;
  }

  /**
   * Clean up expired tasks
   */
  private cleanupExpiredTasks(): void {
    for (const [taskId, task] of this.tasks) {
      if (this.isExpired(task)) {
        this.tasks.delete(taskId);
      }
    }
  }

  /**
   * Start periodic cleanup of expired tasks
   */
  private startCleanupInterval(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTasks();
    }, 60000);

    // Ensure the interval doesn't prevent the process from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop the cleanup interval and clear all tasks
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.tasks.clear();
    this.statusCallbacks = [];
  }

  /**
   * Get the number of active (non-expired) tasks
   */
  getActiveTaskCount(): number {
    this.cleanupExpiredTasks();
    return this.tasks.size;
  }

  /**
   * Check if a task exists and is not expired
   */
  hasTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }
    if (this.isExpired(task)) {
      this.tasks.delete(taskId);
      return false;
    }
    return true;
  }

  /**
   * Get the stored task (internal use only)
   */
  getStoredTask(taskId: string): StoredTask | null {
    const task = this.tasks.get(taskId);
    if (!task || this.isExpired(task)) {
      return null;
    }
    return task;
  }
}

// Export singleton instance
export const taskManager = new TaskManager();
