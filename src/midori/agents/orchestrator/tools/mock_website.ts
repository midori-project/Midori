/**
 * Mock website generator for minimal Next.js deployment
 * Produces a minimal set of files that Vercel can build and deploy.
 */

export type MockFile = {
  path: string;
  content: string;
  type: 'code' | 'text' | 'asset';
};

/**
 * Generate a minimal Next.js (pages router) app suitable for Vercel build
 * - package.json with build script
 * - pages/index.js simple page
 * - next.config.js for proper build
 */
export function generateMinimalNextJsMockFiles(): MockFile[] {
  const packageJson = `{
  "name": "midori-deploy-mock",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}`;

  const indexJs = `import React from 'react';

export default function Home() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🚀 Mock Deployment Success!
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
        This is a test deployment from Midori AI
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '8px',
        backdropFilter: 'blur(10px)'
      }}>
        <p>✅ Vercel deployment working</p>
        <p>✅ Next.js build successful</p>
        <p>✅ Mock content generated</p>
      </div>
    </div>
  );
}`;

  const nextConfigJs = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig`;

  return [
    {
      path: 'package.json',
      type: 'text',
      content: packageJson
    },
    {
      path: 'pages/index.js',
      type: 'code',
      content: indexJs
    },
    {
      path: 'next.config.js',
      type: 'code',
      content: nextConfigJs
    }
  ];
}



