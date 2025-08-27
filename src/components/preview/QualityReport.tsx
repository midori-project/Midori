'use client';

import React from 'react';

interface QualityReportProps {
  score: number;
  issues: Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }>;
  onFixIssues?: () => void;
}

const QualityReport: React.FC<QualityReportProps> = ({ score, issues, onFixIssues }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Code Quality Report</h3>
        {onFixIssues && (
          <button
            onClick={onFixIssues}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            🔧 Auto Fix Issues
          </button>
        )}
      </div>
      
      {/* Score Display */}
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-3xl">{getScoreIcon(score)}</span>
          <div>
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </div>
            <div className="text-sm text-gray-600">{getScoreLabel(score)}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 ml-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                score >= 90 ? 'bg-green-500' : 
                score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Issue Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-red-700">Errors</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
          <div className="text-sm text-yellow-700">Warnings</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
          <div className="text-sm text-blue-700">Suggestions</div>
        </div>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Issues Found:</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className={`text-sm mt-0.5 ${
                  issue.type === 'error' ? 'text-red-600' :
                  issue.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {issue.file}
                    </p>
                    {issue.line && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        Line {issue.line}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {issue.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {score < 90 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {errorCount > 0 && (
              <li>• Fix {errorCount} error(s) to improve code quality</li>
            )}
            {warningCount > 0 && (
              <li>• Address {warningCount} warning(s) for better practices</li>
            )}
            {infoCount > 0 && (
              <li>• Consider {infoCount} suggestion(s) for optimization</li>
            )}
            <li>• Use TypeScript strict mode to catch more issues</li>
            <li>• Add proper error handling and validation</li>
          </ul>
        </div>
      )}

      {/* Success Message */}
      {score >= 90 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🎉</span>
            <span className="font-semibold text-green-800">Excellent Code Quality!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your generated code meets high quality standards. Great job!
          </p>
        </div>
      )}
    </div>
  );
};

export default QualityReport;
