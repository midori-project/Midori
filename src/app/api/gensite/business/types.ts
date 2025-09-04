export interface BusinessContext {
  industry: string;
  specificNiche: string;
  businessModel: string;
  keyDifferentiators: string[];
}

export type FileType = 'config' | 'page' | 'component' | 'style' | 'util' | 'entry' | 'app';

export interface FileConfigLite {
  path: string;
  type: FileType;
}

export interface ProjectLike {
  name: string;
  fileStructure?: string[];
}

export interface BusinessHandler {
  getEssentialFiles(project: ProjectLike): FileConfigLite[];
  templates: Record<string, (project: ProjectLike) => string>;
  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string;
  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string;
}


