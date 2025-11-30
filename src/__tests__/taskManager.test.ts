import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskManager } from '../lib/taskManager.js';
import { TERMINAL_STATUSES } from '../types/task.js';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  afterEach(() => {
    taskManager.dispose();
  });

  describe('createTask', () => {
    it('should create a new task with working status', () => {
      const result = taskManager.createTask('tools/call', { name: 'test_tool' });

      expect(result.task).toBeDefined();
      expect(result.task.taskId).toBeDefined();
      expect(result.task.status).toBe('working');
      expect(result.task.createdAt).toBeDefined();
      expect(result.task.lastUpdatedAt).toBeDefined();
      expect(result.task.ttl).toBeGreaterThan(0);
      expect(result.task.pollInterval).toBeGreaterThan(0);
    });

    it('should respect custom TTL', () => {
      const customTtl = 60000;
      const result = taskManager.createTask('tools/call', { name: 'test' }, { ttl: customTtl });

      expect(result.task.ttl).toBe(customTtl);
    });

    it('should cap TTL at MAX_TASK_TTL', () => {
      const veryLongTtl = 24 * 60 * 60 * 1000; // 24 hours
      const result = taskManager.createTask('tools/call', { name: 'test' }, { ttl: veryLongTtl });

      expect(result.task.ttl).toBeLessThanOrEqual(60 * 60 * 1000); // 1 hour max
    });

    it('should generate unique task IDs', () => {
      const result1 = taskManager.createTask('tools/call', { name: 'test1' });
      const result2 = taskManager.createTask('tools/call', { name: 'test2' });

      expect(result1.task.taskId).not.toBe(result2.task.taskId);
    });
  });

  describe('getTask', () => {
    it('should return task by ID', () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      const task = taskManager.getTask({ taskId: createResult.task.taskId });

      expect(task).toBeDefined();
      expect(task?.taskId).toBe(createResult.task.taskId);
    });

    it('should return null for non-existent task', () => {
      const task = taskManager.getTask({ taskId: 'non-existent-id' });

      expect(task).toBeNull();
    });

    it('should return null for expired task', async () => {
      // Create task with very short TTL
      const result = taskManager.createTask('tools/call', { name: 'test' }, { ttl: 1 });

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const task = taskManager.getTask({ taskId: result.task.taskId });
      expect(task).toBeNull();
    });
  });

  describe('executeTask', () => {
    it('should complete task with successful result', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      const expectedResult = { content: [{ type: 'text', text: 'Success!' }] };

      await taskManager.executeTask(createResult.task.taskId, async () => expectedResult);

      const taskResult = taskManager.getTaskResult({ taskId: createResult.task.taskId });
      expect(taskResult?.isTerminal).toBe(true);
      expect(taskResult?.result).toEqual(expectedResult);
    });

    it('should fail task on executor error', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      await taskManager.executeTask(createResult.task.taskId, async () => {
        throw new Error('Execution failed');
      });

      const taskResult = taskManager.getTaskResult({ taskId: createResult.task.taskId });
      expect(taskResult?.isTerminal).toBe(true);
      expect(taskResult?.error).toBeDefined();
      expect(taskResult?.error?.message).toBe('Execution failed');
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskManager.executeTask('non-existent', async () => 'result')
      ).rejects.toThrow('Task not found');
    });
  });

  describe('getTaskResult', () => {
    it('should return result for completed task', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      const expectedResult = { data: 'test' };

      await taskManager.executeTask(createResult.task.taskId, async () => expectedResult);

      const result = taskManager.getTaskResult({ taskId: createResult.task.taskId });
      expect(result?.isTerminal).toBe(true);
      expect(result?.result).toEqual(expectedResult);
    });

    it('should return error for failed task', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      await taskManager.executeTask(createResult.task.taskId, async () => {
        throw new Error('Task failed');
      });

      const result = taskManager.getTaskResult({ taskId: createResult.task.taskId });
      expect(result?.isTerminal).toBe(true);
      expect(result?.error).toBeDefined();
    });

    it('should return task info for non-terminal status', () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const result = taskManager.getTaskResult({ taskId: createResult.task.taskId });
      expect(result?.isTerminal).toBe(false);
      expect(result?.task).toBeDefined();
      expect(result?.task?.status).toBe('working');
    });

    it('should return null for non-existent task', () => {
      const result = taskManager.getTaskResult({ taskId: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('listTasks', () => {
    it('should list all tasks', () => {
      taskManager.createTask('tools/call', { name: 'test1' });
      taskManager.createTask('tools/call', { name: 'test2' });
      taskManager.createTask('tools/call', { name: 'test3' });

      const result = taskManager.listTasks({});

      expect(result.tasks.length).toBe(3);
    });

    it('should return empty array when no tasks', () => {
      const result = taskManager.listTasks({});

      expect(result.tasks).toEqual([]);
    });

    it('should support pagination', () => {
      // Create 25 tasks
      for (let i = 0; i < 25; i++) {
        taskManager.createTask('tools/call', { name: `test${i}` });
      }

      const firstPage = taskManager.listTasks({});
      expect(firstPage.tasks.length).toBe(20); // Default page size
      expect(firstPage.nextCursor).toBeDefined();

      const secondPage = taskManager.listTasks({ cursor: firstPage.nextCursor });
      expect(secondPage.tasks.length).toBe(5);
      expect(secondPage.nextCursor).toBeUndefined();
    });

    it('should order tasks by creation time (newest first)', async () => {
      const task1 = taskManager.createTask('tools/call', { name: 'first' });
      await new Promise((r) => setTimeout(r, 10));
      const task2 = taskManager.createTask('tools/call', { name: 'second' });
      await new Promise((r) => setTimeout(r, 10));
      const task3 = taskManager.createTask('tools/call', { name: 'third' });

      const result = taskManager.listTasks({});

      expect(result.tasks[0].taskId).toBe(task3.task.taskId);
      expect(result.tasks[1].taskId).toBe(task2.task.taskId);
      expect(result.tasks[2].taskId).toBe(task1.task.taskId);
    });
  });

  describe('cancelTask', () => {
    it('should cancel a working task', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const cancelledTask = await taskManager.cancelTask({ taskId: createResult.task.taskId });

      expect(cancelledTask).toBeDefined();
      expect(cancelledTask?.status).toBe('cancelled');
      expect(cancelledTask?.statusMessage).toBe('The task was cancelled by request.');
    });

    it('should return null for non-existent task', async () => {
      const result = await taskManager.cancelTask({ taskId: 'non-existent' });
      expect(result).toBeNull();
    });

    it('should throw error when cancelling completed task', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      await taskManager.executeTask(createResult.task.taskId, async () => 'result');

      await expect(
        taskManager.cancelTask({ taskId: createResult.task.taskId })
      ).rejects.toThrow("Cannot cancel task: already in terminal status 'completed'");
    });

    it('should throw error when cancelling already cancelled task', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      await taskManager.cancelTask({ taskId: createResult.task.taskId });

      await expect(
        taskManager.cancelTask({ taskId: createResult.task.taskId })
      ).rejects.toThrow("Cannot cancel task: already in terminal status 'cancelled'");
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const updated = await taskManager.updateTaskStatus(
        createResult.task.taskId,
        'input_required',
        'Waiting for user input'
      );

      expect(updated?.status).toBe('input_required');
      expect(updated?.statusMessage).toBe('Waiting for user input');
    });

    it('should not update terminal status', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      await taskManager.executeTask(createResult.task.taskId, async () => 'done');

      const result = await taskManager.updateTaskStatus(
        createResult.task.taskId,
        'working'
      );

      expect(result).toBeNull();
    });

    it('should return null for non-existent task', async () => {
      const result = await taskManager.updateTaskStatus('non-existent', 'working');
      expect(result).toBeNull();
    });
  });

  describe('setInputRequired', () => {
    it('should set task to input_required status', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const result = await taskManager.setInputRequired(
        createResult.task.taskId,
        'Please provide more information'
      );

      expect(result?.status).toBe('input_required');
      expect(result?.statusMessage).toBe('Please provide more information');
    });

    it('should use default message if none provided', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const result = await taskManager.setInputRequired(createResult.task.taskId);

      expect(result?.statusMessage).toBe('Input required to continue');
    });
  });

  describe('resumeTask', () => {
    it('should resume task from input_required to working', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      await taskManager.setInputRequired(createResult.task.taskId);

      const result = await taskManager.resumeTask(createResult.task.taskId);

      expect(result?.status).toBe('working');
      expect(result?.statusMessage).toBe('Task resumed');
    });

    it('should return null if task is not in input_required status', async () => {
      const createResult = taskManager.createTask('tools/call', { name: 'test' });

      const result = await taskManager.resumeTask(createResult.task.taskId);

      expect(result).toBeNull();
    });
  });

  describe('status callbacks', () => {
    it('should notify callbacks on status change', async () => {
      const callback = vi.fn();
      taskManager.onStatusChange(callback);

      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      await taskManager.executeTask(createResult.task.taskId, async () => 'result');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: createResult.task.taskId,
          status: 'completed',
        })
      );
    });

    it('should remove callback with offStatusChange', async () => {
      const callback = vi.fn();
      taskManager.onStatusChange(callback);
      taskManager.offStatusChange(callback);

      const createResult = taskManager.createTask('tools/call', { name: 'test' });
      await taskManager.executeTask(createResult.task.taskId, async () => 'result');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('getActiveTaskCount should return count of non-expired tasks', () => {
      taskManager.createTask('tools/call', { name: 'test1' });
      taskManager.createTask('tools/call', { name: 'test2' });

      expect(taskManager.getActiveTaskCount()).toBe(2);
    });

    it('hasTask should return true for existing task', () => {
      const result = taskManager.createTask('tools/call', { name: 'test' });

      expect(taskManager.hasTask(result.task.taskId)).toBe(true);
    });

    it('hasTask should return false for non-existent task', () => {
      expect(taskManager.hasTask('non-existent')).toBe(false);
    });

    it('getStoredTask should return internal task data', () => {
      const result = taskManager.createTask('tools/call', { name: 'test' });
      const stored = taskManager.getStoredTask(result.task.taskId);

      expect(stored).toBeDefined();
      expect(stored?.method).toBe('tools/call');
      expect(stored?.requestParams).toEqual({ name: 'test' });
    });

    it('dispose should clear all tasks and callbacks', () => {
      const callback = vi.fn();
      taskManager.onStatusChange(callback);
      taskManager.createTask('tools/call', { name: 'test' });

      taskManager.dispose();

      expect(taskManager.getActiveTaskCount()).toBe(0);
    });
  });

  describe('terminal statuses', () => {
    it('should include completed, failed, and cancelled', () => {
      expect(TERMINAL_STATUSES).toContain('completed');
      expect(TERMINAL_STATUSES).toContain('failed');
      expect(TERMINAL_STATUSES).toContain('cancelled');
      expect(TERMINAL_STATUSES.length).toBe(3);
    });
  });
});
