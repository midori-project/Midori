"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import {
  createReactSandpackProps
} from "@/utils/sandPackConverter";
import t2_fixed from "@/components/preview/test/t2_fixed.json";

export default function previewPage() {
  const react3SandpackProps = createReactSandpackProps(t2_fixed, { 
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

