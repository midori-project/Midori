"use client";

import React, { useState } from 'react';
import { X, AlertCircle, Check, Globe } from 'lucide-react';

interface CustomDomainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (customDomain?: string) => void;
  projectName: string;
  generateSubdomain: (name: string) => string;
  isDeploying: boolean;
}

/**
 * Dialog for selecting deployment with custom domain or midori.lol subdomain
 */
export function CustomDomainDialog({
  isOpen,
  onClose,
  onDeploy,
  projectName,
  generateSubdomain,
  isDeploying,
}: CustomDomainDialogProps) {
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const defaultSubdomain = `${generateSubdomain(projectName)}.wiivor.com`;

  const validateDomain = (domain: string): boolean => {
    if (!domain) return false;
    // Validate format: www.example.com or example.com
    const domainRegex = /^([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const handleDeploy = () => {
    setError('');

    if (useCustomDomain) {
      if (!customDomain) {
        setError('Please enter your domain');
        return;
      }

      if (!validateDomain(customDomain)) {
        setError('Invalid domain format (example: www.mawza.lol or mawza.lol)');
        return;
      }

      onDeploy(customDomain);
    } else {
      onDeploy();
    }

    // Close dialog after deploy
    setTimeout(() => {
      onClose();
      setCustomDomain('');
      setUseCustomDomain(false);
      setError('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#748a74]" />
            Select Domain for Deploy
          </h2>
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Option 1: Midori.lol subdomain */}
          <div className={`border-2 rounded-lg p-4 ${!useCustomDomain ? 'bg-[#bcccbc] border-[#8aac8a]' : 'bg-white'}`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="domainType"
                checked={!useCustomDomain}
                onChange={() => setUseCustomDomain(false)}
                disabled={isDeploying}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 font-bold" />
                  Use Wiivor subdomain (Recommended)
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  The system will automatically create a domain from your project name
                </div>
                <div className="bg-white border border-purple-200 rounded-md px-3 py-2 text-sm font-mono ">
                  {defaultSubdomain}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ✅ No DNS configuration needed<br />
                  ✅ Automatic SSL certificate<br />
                  ✅ Ready to use immediately
                </div>
              </div>
            </label>
          </div>

          {/* Option 2: Custom domain */}
          <div className={`border-2 rounded-lg p-4 ${useCustomDomain ? 'bg-[#bcccbc] border-[#8aac8a]' : 'bg-white border-gray-200'}`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="domainType"
                checked={useCustomDomain}
                onChange={() => setUseCustomDomain(true)}
                disabled={isDeploying}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#748a74] font-bold" />
                  Use my own domain
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Deploy to your own domain
                </div>
                
                {useCustomDomain && (
                  <>
                    <input
                      type="text"
                      placeholder="www.mawza.lol or mawza.lol"
                      value={customDomain}
                      onChange={(e) => {
                        setCustomDomain(e.target.value.toLowerCase().trim());
                        setError('');
                      }}
                      disabled={isDeploying}
                      className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 font-mono text-sm"
                    />
                    
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800">
                          <div className="font-medium mb-1">⚠️ DNS configuration required:</div>
                          <div className="space-y-1 ml-4">
                            <div>• Type: <span className="font-mono">CNAME</span></div>
                            <div>• Name: <span className="font-mono">www</span> or <span className="font-mono">@</span></div>
                            <div>• Value: <span className="font-mono">cname.vercel-dns.com</span></div>
                          </div>
                          <div className="mt-2">
                            DNS propagation may take 24-48 hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying || (useCustomDomain && !customDomain)}
            className="px-4 py-2 text-sm font-medium text-white border-[#72856E] bg-gradient-to-r from-[#3D8080] to-[#72856E] rounded-md hover:from-[#3D8080]/80 hover:to-[#72856E]/80 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md "
          >
            {isDeploying ? 'Deploying...' : 'Deploy Now 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}


