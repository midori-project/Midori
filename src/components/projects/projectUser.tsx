import { getPromptJson } from "./getProject";

export default async function previewProject({ projectId }: { projectId: string }) {
  const project = await getPromptJson(projectId);
  const projectData = project as { name?: string } | null;
  
  return (
    <div>{projectData?.name}</div>
  );
}