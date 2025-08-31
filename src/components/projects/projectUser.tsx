import { getPromptJson } from "./getProject";

export default function previewProject({ projectId }: { projectId: string }) {
  const project = getPromptJson(projectId);
  return
   <div>{project?.name}</div>;
}