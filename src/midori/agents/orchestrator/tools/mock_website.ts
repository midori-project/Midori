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
 */
export function generateMinimalNextJsMockFiles(): MockFile[] {
  const packageJson = `{
  "name": "midori-deploy-mock",
  "version": "1.0.0",
  "private": true,
  "scripts": { "build": "next build" },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}`;

  const indexJs = `export default function Home() {
  return <div style={{padding:20,fontFamily:'sans-serif'}}>Mock Deployment OK</div>;
}`;

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
    }
  ];
}



