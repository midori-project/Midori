// Types for JSON structure
interface ProjectFile {
  code: string;
  hidden: boolean;
}

interface ProjectStructure {
  name: string;
  files: Record<string, ProjectFile>;
}

// New interface for react.json structure
interface ReactJsonFile {
  path: string;
  content: string;
  type: string;
  language: string;
}

interface ReactJsonData {
  projectStructure: ProjectStructure | null;
  files: ReactJsonFile[];
}

interface TestJsonData {
  projectStructure: ProjectStructure;
}

// Sandpack file interface
interface SandpackFile {
  [key: string]: string;
}

/**
 * แปลงข้อมูลจาก react.json ให้เป็นรูปแบบที่ Sandpack ต้องการ
 * @param jsonData ข้อมูลจาก react.json
 * @param enableTailwind เปิดใช้งาน Tailwind CSS
 * @returns object ที่มี files property สำหรับ Sandpack
 */
export function convertReactJsonToSandpackFiles(
  jsonData: ReactJsonData, 
  enableTailwind: boolean = true
): { files: SandpackFile } {
  const files: SandpackFile = {};

  // วนลูปผ่านไฟล์ทั้งหมดและบันทึกด้วย path ที่ขึ้นต้นด้วย '/'
  jsonData.files.forEach((file) => {
    const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    files[normalizedPath] = file.content;
  });

  // เติมไฟล์พื้นฐานตามโครงสร้าง CRA ถ้ายังไม่มี
  if (!files['/package.json']) {
    files['/package.json'] = JSON.stringify({
      name: 'sandpack-react-ts',
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      }
    }, null, 2);
  }

  if (!files['/public/index.html']) {
    files['/public/index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${jsonData.projectStructure?.name || 'App'}</title>
    <link rel="stylesheet" href="/src/index.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  const indexExt = Object.prototype.hasOwnProperty.call(files, '/src/index.tsx') ? 'tsx' : 'tsx';

  if (!files[`/src/index.${indexExt}`]) {
    files[`/src/index.${indexExt}`] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  const appExt = Object.prototype.hasOwnProperty.call(files, '/src/App.tsx') ? 'tsx' : 'tsx';
  if (!files[`/src/App.${appExt}`]) {
    files[`/src/App.${appExt}`] = `import React from 'react';

export default function App() {
  return (
    <div className="App">
      <h1>${jsonData.projectStructure?.name || 'Hello Sandpack'}</h1>
    </div>
  );
}`;
  }

  if (!files['/src/index.css']) {
    files['/src/index.css'] = `${enableTailwind ? '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n' : ''}body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; }\n.App { padding: 2rem; }`;
  }

  return { files };
}

/**
 * แปลงข้อมูลจาก test.json ให้เป็นรูปแบบที่ Sandpack ต้องการ
 * @param jsonData ข้อมูลจาก test.json
 * @param enableTailwind เปิดใช้งาน Tailwind CSS
 * @returns object ที่มี files property สำหรับ Sandpack
 */
export function convertJsonToSandpackFiles(
  jsonData: TestJsonData, 

): { files: SandpackFile } {
  const files: SandpackFile = {};
  
  // วนลูปผ่านไฟล์ทั้งหมดใน projectStructure
  Object.entries(jsonData.projectStructure.files).forEach(([filePath, fileData]) => {
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    files[normalizedPath] = fileData.code;
  });

  // เติมไฟล์พื้นฐานตามโครงสร้าง CRA ถ้ายังไม่มี
  if (!files['/package.json']) {
    files['/package.json'] = JSON.stringify({
      name: 'sandpack-react-ts',
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      }
    }, null, 2);
  }

  if (!files['/public/index.html']) {
    files['/public/index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${jsonData.projectStructure.name || 'App'}</title>
    <link rel="stylesheet" href="/src/index.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  if (!files['/src/index.tsx']) {
    files['/src/index.tsx'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  if (!files['/src/App.tsx']) {
    files['/src/App.tsx'] = `import React from 'react';

export default function App() {
  return (
    <div className="App">
      <h1>${jsonData.projectStructure.name || 'Hello Sandpack'}</h1>
    </div>
  );
}`;
  }

  if (!files['/src/index.css']) {
    files['/src/index.css'] = `${enableTailwind ? '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n' : ''}body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; }\n.App { padding: 2rem; }`;
  }

  return { files };
}

/**
 * แปลงข้อมูลจาก react.json และสร้าง Sandpack configuration
 * @param jsonData ข้อมูลจาก react.json
 * @param options options เพิ่มเติมสำหรับ Sandpack
 * @returns Sandpack configuration object
 */
export function createReactSandpackConfig(
  jsonData: ReactJsonData, 
  options: {
    template?: 'react' | 'nextjs' | 'vanilla' | 'vue' | 'angular';
    theme?: 'dark' | 'light';
    showNavigator?: boolean;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    editorHeight?: number;
    autorun?: boolean;
    enableTailwind?: boolean;
  } = {}
) {
  const defaultOptions = {
    template: 'react' as const,
    theme: 'dark' as const,
    showNavigator: true,
    showTabs: true,
    showLineNumbers: true,
    showInlineErrors: true,
    wrapContent: true,
    editorHeight: 400,
    autorun: true,
    enableTailwind: true
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const { files } = convertReactJsonToSandpackFiles(jsonData, mergedOptions.enableTailwind);

  return {
    template: mergedOptions.template,
    theme: mergedOptions.theme,
    options: {
      showNavigator: mergedOptions.showNavigator,
      showTabs: mergedOptions.showTabs,
      showLineNumbers: mergedOptions.showLineNumbers,
      showInlineErrors: mergedOptions.showInlineErrors,
      wrapContent: mergedOptions.wrapContent,
      editorHeight: mergedOptions.editorHeight,
      autorun: mergedOptions.autorun
    },
    files
  };
}

/**
 * แปลงข้อมูลจาก test.json และสร้าง Sandpack configuration
 * @param jsonData ข้อมูลจาก test.json
 * @param options options เพิ่มเติมสำหรับ Sandpack
 * @returns Sandpack configuration object
 */
export function createSandpackConfig(
  jsonData: TestJsonData, 
  options: {
    template?: 'react' | 'nextjs' | 'vanilla' | 'vue' | 'angular';
    theme?: 'dark' | 'light';
    showNavigator?: boolean;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    editorHeight?: number;
    autorun?: boolean;
    enableTailwind?: boolean;
  } = {}
) {
  const defaultOptions = {
    template: 'react' as const,
    theme: 'dark' as const,
    showNavigator: true,
    showTabs: true,
    showLineNumbers: true,
    showInlineErrors: true,
    wrapContent: true,
    editorHeight: 400,
    autorun: true,
    enableTailwind: true
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const { files } = convertJsonToSandpackFiles(jsonData);

  return {
    template: mergedOptions.template,
    theme: mergedOptions.theme,
    options: {
      showNavigator: mergedOptions.showNavigator,
      showTabs: mergedOptions.showTabs,
      showLineNumbers: mergedOptions.showLineNumbers,
      showInlineErrors: mergedOptions.showInlineErrors,
      wrapContent: mergedOptions.wrapContent,
      editorHeight: mergedOptions.editorHeight,
      autorun: mergedOptions.autorun
    },
    files
  };
}

/**
 * ตรวจสอบว่า JSON data มีโครงสร้างที่ถูกต้องหรือไม่ (สำหรับ test.json)
 * @param jsonData ข้อมูลที่จะตรวจสอบ
 * @returns boolean
 */
export function validateJsonStructure(jsonData: any): jsonData is TestJsonData {
  return (
    jsonData &&
    typeof jsonData === 'object' &&
    jsonData.projectStructure &&
    typeof jsonData.projectStructure === 'object' &&
    jsonData.projectStructure.files &&
    typeof jsonData.projectStructure.files === 'object'
  );
}

/**
 * ตรวจสอบว่า JSON data มีโครงสร้างที่ถูกต้องหรือไม่ (สำหรับ react.json)
 * @param jsonData ข้อมูลที่จะตรวจสอบ
 * @returns boolean
 */
export function validateReactJsonStructure(jsonData: any): jsonData is ReactJsonData {
  return (
    jsonData &&
    typeof jsonData === 'object' &&
    jsonData.files &&
    Array.isArray(jsonData.files) &&
    jsonData.files.length > 0 &&
    jsonData.files.every((file: any) => 
      file && 
      typeof file === 'object' && 
      typeof file.path === 'string' && 
      typeof file.content === 'string'
    )
  );
}

/**
 * แปลงข้อมูลจาก react.json และสร้าง Sandpack component props
 * @param jsonData ข้อมูลจาก react.json
 * @param customOptions options เพิ่มเติม
 * @returns props สำหรับ Sandpack component
 */
export function createReactSandpackProps(
  jsonData: ReactJsonData,
  customOptions: {
    template?: 'react' | 'nextjs' | 'vanilla' | 'vue' | 'angular';
    theme?: 'dark' | 'light';
    showNavigator?: boolean;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    editorHeight?: number;
    autorun?: boolean;
    enableTailwind?: boolean;
  } = {}
) {
  if (!validateReactJsonStructure(jsonData)) {
    throw new Error('Invalid React JSON structure. Expected files array with path and content properties.');
  }

  return createReactSandpackConfig(jsonData, customOptions);
}

/**
 * แปลงข้อมูลจาก test.json และสร้าง Sandpack component props
 * @param jsonData ข้อมูลจาก test.json
 * @param customOptions options เพิ่มเติม
 * @returns props สำหรับ Sandpack component
 */
export function createSandpackProps(
  jsonData: TestJsonData,
  customOptions: {
    template?: 'react' | 'nextjs' | 'vanilla' | 'vue' | 'angular';
    theme?: 'dark' | 'light';
    showNavigator?: boolean;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    editorHeight?: number;
    autorun?: boolean;
    enableTailwind?: boolean;
  } = {}
) {
  if (!validateJsonStructure(jsonData)) {
    throw new Error('Invalid JSON structure. Expected projectStructure with files.');
  }

  return createSandpackConfig(jsonData, customOptions);
}

/**
 * สร้าง Sandpack files จาก JSON string (สำหรับ react.json)
 * @param jsonString JSON string ที่มีโครงสร้างของ react.json
 * @param enableTailwind เปิดใช้งาน Tailwind CSS
 * @returns object ที่มี files property สำหรับ Sandpack
 */
export function convertReactJsonStringToSandpackFiles(
  jsonString: string, 
  enableTailwind: boolean = true
): { files: SandpackFile } {
  try {
    const jsonData = JSON.parse(jsonString) as ReactJsonData;
    return convertReactJsonToSandpackFiles(jsonData, enableTailwind);
  } catch (error) {
    throw new Error(`Failed to parse React JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * สร้าง Sandpack files จาก JSON string (สำหรับ test.json)
 * @param jsonString JSON string ที่มีโครงสร้างของ test.json
 * @param enableTailwind เปิดใช้งาน Tailwind CSS
 * @returns object ที่มี files property สำหรับ Sandpack
 */
export function convertJsonStringToSandpackFiles(
  jsonString: string, 
  enableTailwind: boolean = true
): { files: SandpackFile } {
  try {
    const jsonData = JSON.parse(jsonString) as TestJsonData;
    return convertJsonToSandpackFiles(jsonData);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * ตัวอย่างการใช้งาน:
 * 
 * // สำหรับ react.json พร้อม Tailwind CSS
 * import { createReactSandpackProps } from '@/utils/sandPackConverter';
 * import reactJsonData from '@/app/component/preview/test/react.json';
 * 
 * const sandpackProps = createReactSandpackProps(reactJsonData, {
 *   template: 'react',
 *   theme: 'dark',
 *   editorHeight: 500,
 *   enableTailwind: true // เปิดใช้งาน Tailwind CSS
 * });
 * 
 * // ใช้กับ Sandpack component
 * <Sandpack {...sandpackProps} />
 * 
 * // สำหรับ test.json พร้อม Tailwind CSS
 * import { createSandpackProps } from '@/utils/sandPackConverter';
 * import testJsonData from '@/app/component/preview/test.json';
 * 
 * const sandpackProps = createSandpackProps(testJsonData, {
 *   template: 'react',
 *   theme: 'dark',
 *   editorHeight: 500,
 *   enableTailwind: true // เปิดใช้งาน Tailwind CSS
 * });
 * 
 * // ใช้กับ Sandpack component
 * <Sandpack {...sandpackProps} />
 */
