'use client';

import React from 'react';

interface PreviewErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Preview Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Preview Error
            </h3>
            <p className="text-red-700 mb-4 text-sm">
              เกิดข้อผิดพลาดในการแสดง Preview
            </p>
            <details className="text-left bg-red-100 p-3 rounded text-xs text-red-800">
              <summary className="cursor-pointer font-medium mb-2">
                Technical Details
              </summary>
              <pre className="whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PreviewErrorBoundary;
