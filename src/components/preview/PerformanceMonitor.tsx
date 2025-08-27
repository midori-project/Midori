'use client';

import React, { useState, useEffect } from 'react';

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ onMetrics }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure render time
    const measurePerformance = () => {
      const renderTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      const newMetrics: PerformanceMetrics = {
        loadTime: renderTime,
        renderTime,
        memoryUsage,
        timestamp: Date.now()
      };
      
      setMetrics(newMetrics);
      onMetrics?.(newMetrics);
    };

    // Measure after component mounts
    const timer = setTimeout(measurePerformance, 100);
    
    return () => clearTimeout(timer);
  }, [onMetrics]);

  if (!metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        title="Performance Metrics"
      >
        📊 {Math.round(metrics.renderTime)}ms
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[250px]">
          <h4 className="font-semibold mb-3 text-gray-900">📊 Performance Metrics</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Render Time:</span>
              <span className={`font-medium ${
                metrics.renderTime < 100 ? 'text-green-600' : 
                metrics.renderTime < 500 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(metrics.renderTime)}ms
              </span>
            </div>
            
            {metrics.memoryUsage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-medium text-blue-600">
                  {Math.round(metrics.memoryUsage / 1024 / 1024)}MB
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-medium text-gray-800">
                {new Date(metrics.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                metrics.renderTime < 100 ? 'bg-green-400' :
                metrics.renderTime < 500 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              {metrics.renderTime < 100 ? 'Excellent' :
               metrics.renderTime < 500 ? 'Good' : 'Needs Optimization'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
