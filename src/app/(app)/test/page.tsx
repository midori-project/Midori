import { Sandpack } from "@codesandbox/sandpack-react";
import testJson from "./testJson/test.json";

export default function Test() {
  // แปลงข้อมูลจาก JSON ให้เป็นรูปแบบที่ Sandpack ต้องการ
  const sandpackFiles = testJson.files.reduce((acc: any, file: any) => {
    acc[file.path] = {
      code: file.content,
      hidden: false,
      active: file.path === "src/App.tsx"
    };
    return acc;
  }, {});

  return (
    <div className="mt-[200px]">
      <Sandpack
        template="react"
        files={sandpackFiles}
        options={{
          showNavigator: true,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 500,
          editorWidthPercentage: 60,
          externalResources: ["https://cdn.tailwindcss.com"]
        }}
      />
    </div>
  );
}