"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import {
  createReactSandpackProps
} from "@/utils/sandPackConverter";
import t1 from "@/components/preview/test/t1.json";

export default function TestPage() {
  const react3SandpackProps = createReactSandpackProps(t1, { 
    template: "react",
    theme: "dark",
    showNavigator: true,
    showTabs: true,
    showLineNumbers: true,
    showInlineErrors: true,
    wrapContent: true,
    autorun: true,
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">🐱 Cat Gallery Sandpack Preview</h1>
        <p className="text-sm text-gray-300 mt-2">
          ✅ React Router ทำงานแล้ว! ลิงก์จะนำทางได้ใน Sandpack environment
        </p>
      </div>

      {/* Sandpack */}
      <div className="flex-1">
        {/* <Sandpack {...sandpackProps} /> */}
        <Sandpack
          {...react3SandpackProps}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        />
      </div>
    </div>
  );
}

