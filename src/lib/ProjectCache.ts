// Project caching utility for ts-morph (v1.4)
// Implements LRU cache with memory limits to avoid re-parsing on every request

import { Project } from 'ts-morph';
import path from 'path';

interface CachedProject {
  project: Project;
  lastAccess: number;
  fileCount: number;
  estimatedMemoryMB: number;
  hitCount: number;
}

interface CacheStats {
  size: number;
  totalMemoryMB: number;
  hitRate: number;
  projects: Array<{
    path: string;
    files: number;
    memoryMB: number;
    age: number;
    hits: number;
  }>;
}

export class ProjectCache {
  private static instance: ProjectCache | null = null;
  private cache = new Map<string, CachedProject>();
  private totalHits = 0;
  private totalMisses = 0;
  private lastCleanup = Date.now();
  
  // Configuration constants
  private readonly MAX_CACHE_SIZE = 5;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_TOTAL_MEMORY_MB = 200;
  private readonly MAX_PROJECT_MEMORY_MB = 100;
  private readonly MEMORY_PER_FILE_MB = 0.5;
  private readonly BASE_MEMORY_MB = 1;
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  private constructor() {}

  public static getInstance(): ProjectCache {
    if (!ProjectCache.instance) {
      ProjectCache.instance = new ProjectCache();
    }
    return ProjectCache.instance;
  }

  public getOrCreate(projectPath: string): Project {
    // Normalize path and remove trailing slashes
    let normalizedPath = path.normalize(projectPath);
    if (normalizedPath.endsWith(path.sep) && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    const now = Date.now();

    // Check if cached and not expired
    const cached = this.cache.get(normalizedPath);
    if (cached && (now - cached.lastAccess) < this.CACHE_TTL) {
      cached.lastAccess = now;
      cached.hitCount++;
      this.totalHits++;
      return cached.project;
    }

    this.totalMisses++;

    // Lazy cleanup - only run periodically to reduce overhead
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      this.removeExpired();
      this.lastCleanup = now;
    }

    // LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }

    // Create new project
    const project = new Project({
      useInMemoryFileSystem: false,
      compilerOptions: {
        allowJs: true,
        skipLibCheck: true,
        noEmit: true
      }
    });

    // Add source files
    const pattern = path.join(normalizedPath, '**/*.{ts,tsx,js,jsx}');
    project.addSourceFilesAtPaths(pattern);

    const sourceFiles = project.getSourceFiles();
    const fileCount = sourceFiles.length;

    // Estimate memory usage: base + per-file overhead
    const estimatedMemoryMB = this.BASE_MEMORY_MB + (fileCount * this.MEMORY_PER_FILE_MB);

    // Skip caching if project is too large
    if (estimatedMemoryMB > this.MAX_PROJECT_MEMORY_MB) {
      console.warn(`Project ${normalizedPath} too large (${estimatedMemoryMB.toFixed(1)}MB, ${fileCount} files) - skipping cache`);
      return project;
    }

    // Check total cache memory before adding
    const totalMemory = this.getTotalMemoryUsage();
    if (totalMemory + estimatedMemoryMB > this.MAX_TOTAL_MEMORY_MB) {
      // Evict projects until we have enough space
      while (this.getTotalMemoryUsage() + estimatedMemoryMB > this.MAX_TOTAL_MEMORY_MB && this.cache.size > 0) {
        this.evictLRU();
      }
    }

    this.cache.set(normalizedPath, {
      project,
      lastAccess: now,
      fileCount,
      estimatedMemoryMB,
      hitCount: 0
    });

    return project;
  }

  public invalidate(projectPath: string): void {
    const normalizedPath = path.normalize(projectPath);
    this.cache.delete(normalizedPath);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): CacheStats {
    const now = Date.now();
    const projects = Array.from(this.cache.entries()).map(([projectPath, cached]) => ({
      path: projectPath,
      files: cached.fileCount,
      memoryMB: cached.estimatedMemoryMB,
      age: Math.floor((now - cached.lastAccess) / 1000),
      hits: cached.hitCount
    }));

    const totalRequests = this.totalHits + this.totalMisses;
    const hitRate = totalRequests > 0 ? this.totalHits / totalRequests : 0;

    return {
      size: this.cache.size,
      totalMemoryMB: this.getTotalMemoryUsage(),
      hitRate: Math.round(hitRate * 100) / 100,
      projects
    };
  }

  private getTotalMemoryUsage(): number {
    let total = 0;
    this.cache.forEach(cached => {
      total += cached.estimatedMemoryMB;
    });
    return total;
  }

  private removeExpired(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.cache.forEach((cached, path) => {
      if ((now - cached.lastAccess) >= this.CACHE_TTL) {
        toRemove.push(path);
      }
    });

    toRemove.forEach(path => this.cache.delete(path));
  }

  private evictLRU(): void {
    let victimPath: string | null = null;
    let lowestScore = Infinity;

    // LRU-K variant: consider both recency and frequency
    const now = Date.now();
    this.cache.forEach((cached, projectPath) => {
      // Score = recency weight + frequency weight
      // Lower score = better candidate for eviction
      const age = now - cached.lastAccess;
      const recencyScore = age / this.CACHE_TTL; // 0-1, higher = older
      const frequencyScore = 1 / (cached.hitCount + 1); // Higher hits = lower score
      const score = recencyScore * 0.7 + frequencyScore * 0.3;
      
      if (score > lowestScore || victimPath === null) {
        lowestScore = score;
        victimPath = projectPath;
      }
    });

    if (victimPath) {
      this.cache.delete(victimPath);
    }
  }
}
