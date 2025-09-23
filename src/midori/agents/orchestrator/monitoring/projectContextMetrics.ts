/**
 * Project Context Metrics
 * Monitoring and metrics collection for project context operations
 */

export interface ProjectContextMetrics {
  operation: string;
  projectId: string;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MetricsSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  operationsByType: Record<string, number>;
  errorsByType: Record<string, number>;
  timeRange: {
    start: string;
    end: string;
  };
}

export class ProjectContextMetricsCollector {
  private static instance: ProjectContextMetricsCollector;
  private metrics: ProjectContextMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics

  private constructor() {
    console.log('📊 ProjectContextMetricsCollector initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProjectContextMetricsCollector {
    if (!ProjectContextMetricsCollector.instance) {
      ProjectContextMetricsCollector.instance = new ProjectContextMetricsCollector();
    }
    return ProjectContextMetricsCollector.instance;
  }

  /**
   * Record a metric
   */
  recordMetric(metric: Omit<ProjectContextMetrics, 'timestamp'>): void {
    const fullMetric: ProjectContextMetrics = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetric);

    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log metric
    const logLevel = metric.success ? 'info' : 'error';
    const message = `${metric.operation} for ${metric.projectId}: ${metric.duration}ms ${metric.success ? 'SUCCESS' : 'FAILED'}`;
    
    if (logLevel === 'info') {
      console.log(`📊 ${message}`);
    } else {
      console.error(`📊 ${message} - ${metric.error}`);
    }
  }

  /**
   * Track get project context operation
   */
  trackGetProjectContext(projectId: string, duration: number, success: boolean, error?: string): void {
    this.recordMetric({
      operation: 'get_project_context',
      projectId,
      duration,
      success,
      error,
      metadata: {
        cacheHit: duration < 10, // Assume cache hit if very fast
        source: 'database'
      }
    });
  }

  /**
   * Track update project context operation
   */
  trackUpdateProjectContext(projectId: string, duration: number, success: boolean, error?: string, updates?: any): void {
    this.recordMetric({
      operation: 'update_project_context',
      projectId,
      duration,
      success,
      error,
      metadata: {
        updateFields: updates ? Object.keys(updates) : [],
        updateCount: updates ? Object.keys(updates).length : 0
      }
    });
  }

  /**
   * Track cache operations
   */
  trackCacheOperation(operation: 'hit' | 'miss' | 'invalidate', projectId: string, duration: number = 0): void {
    this.recordMetric({
      operation: `cache_${operation}`,
      projectId,
      duration,
      success: true,
      metadata: {
        cacheOperation: operation
      }
    });
  }

  /**
   * Track validation operations
   */
  trackValidation(projectId: string, duration: number, success: boolean, errorCount: number, warningCount: number): void {
    this.recordMetric({
      operation: 'validate_project_context',
      projectId,
      duration,
      success,
      metadata: {
        errorCount,
        warningCount,
        isValid: errorCount === 0
      }
    });
  }

  /**
   * Track consistency checks
   */
  trackConsistencyCheck(projectId: string, duration: number, success: boolean, inconsistencyCount: number): void {
    this.recordMetric({
      operation: 'consistency_check',
      projectId,
      duration,
      success,
      metadata: {
        inconsistencyCount,
        isConsistent: inconsistencyCount === 0
      }
    });
  }

  /**
   * Track real-time sync operations
   */
  trackSyncOperation(operation: 'subscribe' | 'unsubscribe' | 'broadcast', projectId: string, duration: number, success: boolean, subscriberCount?: number): void {
    this.recordMetric({
      operation: `sync_${operation}`,
      projectId,
      duration,
      success,
      metadata: {
        subscriberCount: subscriberCount || 0
      }
    });
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(timeRange?: { start: Date; end: Date }): MetricsSummary {
    let filteredMetrics = this.metrics;

    if (timeRange) {
      filteredMetrics = this.metrics.filter(metric => {
        const metricTime = new Date(metric.timestamp);
        return metricTime >= timeRange.start && metricTime <= timeRange.end;
      });
    }

    const totalOperations = filteredMetrics.length;
    const successfulOperations = filteredMetrics.filter(m => m.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const averageDuration = totalOperations > 0 
      ? filteredMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations 
      : 0;

    const operationsByType: Record<string, number> = {};
    const errorsByType: Record<string, number> = {};

    filteredMetrics.forEach(metric => {
      operationsByType[metric.operation] = (operationsByType[metric.operation] || 0) + 1;
      if (!metric.success) {
        errorsByType[metric.operation] = (errorsByType[metric.operation] || 0) + 1;
      }
    });

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration,
      operationsByType,
      errorsByType,
      timeRange: {
        start: filteredMetrics[0]?.timestamp || new Date().toISOString(),
        end: filteredMetrics[filteredMetrics.length - 1]?.timestamp || new Date().toISOString()
      }
    };
  }

  /**
   * Get metrics for a specific project
   */
  getProjectMetrics(projectId: string, timeRange?: { start: Date; end: Date }): ProjectContextMetrics[] {
    let filteredMetrics = this.metrics.filter(m => m.projectId === projectId);

    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(metric => {
        const metricTime = new Date(metric.timestamp);
        return metricTime >= timeRange.start && metricTime <= timeRange.end;
      });
    }

    return filteredMetrics;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    averageGetDuration: number;
    averageUpdateDuration: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number; // operations per minute
  } {
    const getMetrics = this.metrics.filter(m => m.operation === 'get_project_context');
    const updateMetrics = this.metrics.filter(m => m.operation === 'update_project_context');
    const cacheMetrics = this.metrics.filter(m => m.operation.startsWith('cache_'));
    const allMetrics = this.metrics;

    const averageGetDuration = getMetrics.length > 0 
      ? getMetrics.reduce((sum, m) => sum + m.duration, 0) / getMetrics.length 
      : 0;

    const averageUpdateDuration = updateMetrics.length > 0 
      ? updateMetrics.reduce((sum, m) => sum + m.duration, 0) / updateMetrics.length 
      : 0;

    const cacheHits = cacheMetrics.filter(m => m.operation === 'cache_hit').length;
    const cacheMisses = cacheMetrics.filter(m => m.operation === 'cache_miss').length;
    const cacheHitRate = (cacheHits + cacheMisses) > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;

    const errorRate = allMetrics.length > 0 
      ? allMetrics.filter(m => !m.success).length / allMetrics.length 
      : 0;

    // Calculate throughput (operations per minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentMetrics = allMetrics.filter(m => new Date(m.timestamp) >= oneMinuteAgo);
    const throughput = recentMetrics.length;

    return {
      averageGetDuration,
      averageUpdateDuration,
      cacheHitRate,
      errorRate,
      throughput
    };
  }

  /**
   * Get error analysis
   */
  getErrorAnalysis(): {
    totalErrors: number;
    errorsByOperation: Record<string, number>;
    commonErrors: Array<{ error: string; count: number }>;
    errorTrend: Array<{ timestamp: string; errorCount: number }>;
  } {
    const errorMetrics = this.metrics.filter(m => !m.success);
    const errorsByOperation: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    errorMetrics.forEach(metric => {
      errorsByOperation[metric.operation] = (errorsByOperation[metric.operation] || 0) + 1;
      if (metric.error) {
        errorCounts[metric.error] = (errorCounts[metric.error] || 0) + 1;
      }
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group errors by hour for trend analysis
    const errorTrend: Array<{ timestamp: string; errorCount: number }> = [];
    const hourlyErrors: Record<string, number> = {};

    errorMetrics.forEach(metric => {
      const hour = new Date(metric.timestamp).toISOString().substring(0, 13) + ':00:00Z';
      hourlyErrors[hour] = (hourlyErrors[hour] || 0) + 1;
    });

    Object.entries(hourlyErrors)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([timestamp, errorCount]) => {
        errorTrend.push({ timestamp, errorCount });
      });

    return {
      totalErrors: errorMetrics.length,
      errorsByOperation,
      commonErrors,
      errorTrend
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    console.log('🗑️ Cleared all metrics');
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
      performance: this.getPerformanceMetrics(),
      errorAnalysis: this.getErrorAnalysis()
    }, null, 2);
  }
}

// Export singleton instance
export const projectContextMetrics = ProjectContextMetricsCollector.getInstance();
