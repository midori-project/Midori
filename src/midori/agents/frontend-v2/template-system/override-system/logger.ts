// Logger System
// จัดการ logging สำหรับระบบ Override

import {
  LogEntry,
  LoggerConfig,
  ProcessingStats,
  ProcessingStep
} from './types';

export class OverrideLogger {
  private static instance: OverrideLogger;
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: true,
      logLevel: 'info',
      includeData: false,
      maxEntries: 1000,
      ...config
    };
  }

  static getInstance(config?: Partial<LoggerConfig>): OverrideLogger {
    if (!OverrideLogger.instance) {
      OverrideLogger.instance = new OverrideLogger(config);
    }
    return OverrideLogger.instance;
  }

  /**
   * Log Resolver Step
   */
  logResolverStep(step: string, data?: any): void {
    this.log('info', 'resolver', `[Resolver] ${step}`, data);
  }

  /**
   * Log Renderer Step
   */
  logRendererStep(step: string, data?: any): void {
    this.log('info', 'renderer', `[Renderer] ${step}`, data);
  }

  /**
   * Log AI Interaction
   */
  logAIInteraction(prompt: string, response?: any): void {
    this.log('info', 'ai', '[AI] Interaction', { prompt, response });
  }

  /**
   * Log Validation
   */
  logValidation(result: any, isValid: boolean): void {
    this.log(isValid ? 'info' : 'warn', 'validation', '[Validation] Result', result);
  }

  /**
   * Log Error
   */
  logError(error: Error, context?: any): void {
    this.log('error', 'resolver', '[Error]', { 
      message: error.message, 
      stack: error.stack, 
      context 
    });
  }

  /**
   * Log Processing Stats
   */
  logProcessingStats(stats: ProcessingStats): void {
    this.log('info', 'resolver', '[Processing Stats]', {
      duration: stats.duration,
      steps: stats.steps.length,
      memoryUsage: stats.memoryUsage
    });
  }

  /**
   * Log Performance Metrics
   */
  logPerformanceMetrics(component: string, metrics: {
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage?: number;
  }): void {
    this.log('debug', component as any, '[Performance]', metrics);
  }

  /**
   * Log Memory Usage
   */
  logMemoryUsage(component: string): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memoryUsage = process.memoryUsage();
      this.log('debug', component as any, '[Memory Usage]', {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      });
    }
  }

  /**
   * Log Configuration
   */
  logConfiguration(config: any): void {
    this.log('debug', 'resolver', '[Configuration]', config);
  }

  /**
   * Log User Data
   */
  logUserData(userData: any): void {
    this.log('debug', 'ai', '[User Data]', userData);
  }

  /**
   * Log Generated Files
   */
  logGeneratedFiles(files: Record<string, string>): void {
    const fileInfo = Object.entries(files).map(([name, content]) => ({
      name,
      size: content.length,
      checksum: this.calculateChecksum(content)
    }));

    this.log('info', 'renderer', '[Generated Files]', fileInfo);
  }

  /**
   * Log Applied Overrides
   */
  logAppliedOverrides(overrides: string[]): void {
    this.log('info', 'resolver', '[Applied Overrides]', overrides);
  }

  /**
   * Log Business Category Selection
   */
  logBusinessCategorySelection(categoryId: string, keywords: string[]): void {
    this.log('info', 'resolver', '[Business Category Selection]', {
      categoryId,
      keywords
    });
  }

  /**
   * Log Concrete Manifest Creation
   */
  logConcreteManifestCreation(manifest: any): void {
    this.log('info', 'resolver', '[Concrete Manifest Created]', {
      businessCategoryId: manifest.businessCategory?.id,
      totalBlocks: manifest.blocks?.length,
      appliedOverrides: manifest.metadata?.appliedOverrides
    });
  }

  /**
   * Log Template Rendering
   */
  logTemplateRendering(blockId: string, template: string, userData: any): void {
    this.log('debug', 'renderer', `[Template Rendering] ${blockId}`, {
      templateLength: template.length,
      userDataKeys: Object.keys(userData)
    });
  }

  /**
   * Log Validation Results
   */
  logValidationResults(result: any): void {
    this.log('info', 'validation', '[Validation Results]', {
      isValid: result.isValid,
      errorCount: result.errors?.length || 0,
      warningCount: result.warnings?.length || 0,
      successRate: result.summary?.successRate || 0
    });
  }

  /**
   * Log API Request
   */
  logAPIRequest(method: string, url: string, data?: any): void {
    this.log('info', 'ai', '[API Request]', { method, url, dataSize: data ? JSON.stringify(data).length : 0 });
  }

  /**
   * Log API Response
   */
  logAPIResponse(status: number, data?: any): void {
    this.log('info', 'ai', '[API Response]', { 
      status, 
      dataSize: data ? JSON.stringify(data).length : 0 
    });
  }

  /**
   * Core Log Method
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', component: string, message: string, data?: any): void {
    if (!this.config.enabled) return;

    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[this.config.logLevel];
    const messageLevel = logLevels[level];

    if (messageLevel < currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: component as 'resolver' | 'renderer' | 'ai' | 'validation',
      message,
      data: this.config.includeData ? data : undefined
    };

    this.logEntries.push(entry);

    // Keep only maxEntries
    if (this.logEntries.length > this.config.maxEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxEntries);
    }

    // Console output
    const logMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.component}] ${entry.message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
    }
  }

  /**
   * Get Log Entries
   */
  getLogEntries(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Get Log Entries by Level
   */
  getLogEntriesByLevel(level: 'debug' | 'info' | 'warn' | 'error'): LogEntry[] {
    return this.logEntries.filter(entry => entry.level === level);
  }

  /**
   * Get Log Entries by Component
   */
  getLogEntriesByComponent(component: string): LogEntry[] {
    return this.logEntries.filter(entry => entry.component === component);
  }

  /**
   * Get Log Entries by Time Range
   */
  getLogEntriesByTimeRange(startTime: string, endTime: string): LogEntry[] {
    return this.logEntries.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Clear Log Entries
   */
  clearLogEntries(): void {
    this.logEntries = [];
  }

  /**
   * Export Log Entries to JSON
   */
  exportLogEntries(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  /**
   * Export Log Entries to CSV
   */
  exportLogEntriesToCSV(): string {
    const headers = ['timestamp', 'level', 'component', 'message', 'data'];
    const csvRows = [headers.join(',')];

    for (const entry of this.logEntries) {
      const row = [
        entry.timestamp,
        entry.level,
        entry.component,
        `"${entry.message.replace(/"/g, '""')}"`,
        entry.data ? `"${JSON.stringify(entry.data).replace(/"/g, '""')}"` : ''
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Get Log Statistics
   */
  getLogStatistics(): {
    totalEntries: number;
    entriesByLevel: Record<string, number>;
    entriesByComponent: Record<string, number>;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const entriesByLevel: Record<string, number> = {};
    const entriesByComponent: Record<string, number> = {};
    let oldestEntry: string | null = null;
    let newestEntry: string | null = null;

    for (const entry of this.logEntries) {
      entriesByLevel[entry.level] = (entriesByLevel[entry.level] || 0) + 1;
      entriesByComponent[entry.component] = (entriesByComponent[entry.component] || 0) + 1;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    return {
      totalEntries: this.logEntries.length,
      entriesByLevel,
      entriesByComponent,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Update Configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Calculate Checksum
   */
  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// ===== Logger Factory =====

export class LoggerFactory {
  private static loggers: Map<string, OverrideLogger> = new Map();

  /**
   * Get or Create Logger
   */
  static getLogger(name: string, config?: Partial<LoggerConfig>): OverrideLogger {
    if (!this.loggers.has(name)) {
      this.loggers.set(name, OverrideLogger.getInstance());
    }
    return this.loggers.get(name)!;
  }

  /**
   * Get All Loggers
   */
  static getAllLoggers(): Map<string, OverrideLogger> {
    return new Map(this.loggers);
  }

  /**
   * Clear All Loggers
   */
  static clearAllLoggers(): void {
    this.loggers.clear();
  }
}

// ===== Default Logger Instance =====

export const logger = OverrideLogger.getInstance();
