/**
 * ProjectContextSyncTest Component
 * Test component for real-time project context synchronization
 */

'use client';

import React, { useState } from 'react';
import { ProjectContextSync } from './ProjectContextSync';
import { useProjectContextWebSocket } from '@/hooks/useProjectContextWebSocket';

export interface ProjectContextSyncTestProps {
  projectId?: string;
  className?: string;
}

export function ProjectContextSyncTest({
  projectId = 'test-project-123',
  className = ''
}: ProjectContextSyncTestProps) {
  const [testProjectId, setTestProjectId] = useState(projectId);
  const [syncMethod, setSyncMethod] = useState<'sse' | 'websocket' | 'both'>('sse');
  const [context, setContext] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // WebSocket hook for testing updates
  const wsSync = useProjectContextWebSocket({
    projectId: testProjectId,
    onUpdate: (context) => {
      console.log('Test context updated:', context);
      setContext(context);
    },
    onError: (error) => {
      console.error('Test error:', error);
      setError(error);
    }
  });

  const handleContextUpdate = (context: any) => {
    console.log('Context updated:', context);
    setContext(context);
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    setError(error);
  };

  const sendTestUpdate = () => {
    if (wsSync.isConnected) {
      wsSync.sendUpdate({
        status: 'test_updated',
        lastModified: new Date().toISOString(),
        testData: {
          message: 'Test update from client',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      setError('WebSocket not connected');
    }
  };

  return (
    <div className={`project-context-sync-test ${className}`}>
      <h3>Project Context Sync Test</h3>
      
      <div className="test-controls">
        <div className="control-group">
          <label>Project ID:</label>
          <input
            type="text"
            value={testProjectId}
            onChange={(e) => setTestProjectId(e.target.value)}
            placeholder="Enter project ID"
          />
        </div>
        
        <div className="control-group">
          <label>Sync Method:</label>
          <select
            value={syncMethod}
            onChange={(e) => setSyncMethod(e.target.value as 'sse' | 'websocket' | 'both')}
          >
            <option value="sse">SSE Only</option>
            <option value="websocket">WebSocket Only</option>
            <option value="both">Both</option>
          </select>
        </div>
        
        <div className="control-group">
          <button onClick={sendTestUpdate} disabled={!wsSync.isConnected}>
            Send Test Update
          </button>
        </div>
      </div>
      
      <div className="test-status">
        <h4>Status</h4>
        <div className="status-grid">
          <div className="status-item">
            <strong>SSE:</strong> {syncMethod === 'websocket' ? 'N/A' : 'Active'}
          </div>
          <div className="status-item">
            <strong>WebSocket:</strong> {wsSync.isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="status-item">
            <strong>Last Update:</strong> {context?.lastModified || 'Never'}
          </div>
          <div className="status-item">
            <strong>Error:</strong> {error || 'None'}
          </div>
        </div>
      </div>
      
      <div className="sync-components">
        <h4>Sync Components</h4>
        <ProjectContextSync
          projectId={testProjectId}
          syncMethod={syncMethod}
          onContextUpdate={handleContextUpdate}
          onError={handleError}
          showStatus={true}
        />
      </div>
      
      <div className="context-display">
        <h4>Current Context</h4>
        <pre className="context-json">
          {context ? JSON.stringify(context, null, 2) : 'No context data'}
        </pre>
      </div>
      
      <style jsx>{`
        .project-context-sync-test {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          max-width: 800px;
          margin: 20px auto;
        }
        
        h3, h4 {
          margin: 0 0 16px 0;
          color: #333;
        }
        
        .test-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .control-group label {
          font-weight: 500;
          font-size: 14px;
        }
        
        .control-group input,
        .control-group select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .control-group button {
          padding: 8px 16px;
          border: 1px solid #007bff;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }
        
        .control-group button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .test-status {
          margin-bottom: 20px;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        
        .status-item {
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .sync-components {
          margin-bottom: 20px;
        }
        
        .context-display {
          margin-top: 20px;
        }
        
        .context-json {
          background: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default ProjectContextSyncTest;
