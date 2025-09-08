import { DEFAULT_GENERATION_OPTIONS } from './config';
import { UserIntentAnalyzer } from './user-intent-analyzer';
import { OpenAIService } from './openai-service';
import { ProjectStructureGenerator } from './project-structure-generator';
import { FileGenerator } from '../../app/api/gensite/route';
import { GeneratedFile, ProjectStructure, GenerationOptions } from './types';

/**
 * Site Generator Service
 * Main service class that orchestrates the site generation process
 */
export class SiteGeneratorService {
  
  /**
   * Generate a complete website from finalJson
   */
  static async generateSite(
    finalJson: Record<string, unknown>, 
    options = DEFAULT_GENERATION_OPTIONS
  ): Promise<{ files: GeneratedFile[], projectStructure: ProjectStructure }> {
    
    console.log('🚀 Starting USER-INTENT BASED site generation...');
    console.log('Final JSON:', JSON.stringify(finalJson, null, 2));
    console.log('Options:', options);
    
    // เพิ่ม User Intent Analysis
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(finalJson);
    console.log('🎯 User Intent Analysis:', userIntent);

    console.log('🚀 Starting site generation process...');
    
    // Enrich finalJson with options so templates can read from finalJson.options
    const enrichedFinalJson = { ...finalJson, options } as Record<string, unknown>;

    // Step 1: Analyze finalJson and create project structure
    const projectStructure = await this.createProjectStructureWithTimeout(enrichedFinalJson, options);
    console.log('✅ Project structure created:', projectStructure.name);
    console.log('📋 Project structure details:', projectStructure);
    
    // Step 2: Generate files based on the project structure (OPTIMIZED)
    const files = await FileGenerator.generateEssentialFilesOnly(enrichedFinalJson, projectStructure, options);
    console.log('✅ User-intent based files generated:', files.length);
    console.log(' Generated files:', files.map(f => f.path));
    
    return {
      files,
      projectStructure
    };
  }

  /**
   * Create project structure with timeout - เพิ่มเวลา timeout และ logging
   */
  private static async createProjectStructureWithTimeout(
    finalJson: Record<string, unknown>, 
    options: GenerationOptions, 
    timeoutMs: number = 600000
  ): Promise<ProjectStructure> {
    console.log('🏗️ Starting Frontend-only structure generation...');
    const startTime = Date.now();
    
    const result = await Promise.race([
      ProjectStructureGenerator.createProjectStructure(finalJson, options).then(result => {
        const duration = Date.now() - startTime;
        console.log(`✅ Frontend structure generated successfully in ${duration}ms`);
        return result;
      }),
      new Promise<ProjectStructure>((_, reject) => 
        setTimeout(() => {
          const duration = Date.now() - startTime;
          console.log(`❌ Frontend structure generation timeout after ${duration}ms`);
          reject(new Error(`Frontend structure generation timeout after ${duration}ms`));
        }, timeoutMs)
      )
    ]);
    return result as ProjectStructure;
  }
}

// Re-export main classes and types for convenience
export { UserIntentAnalyzer } from './user-intent-analyzer';
export { OpenAIService } from './openai-service';
export { ProjectStructureGenerator } from './project-structure-generator';
export { FileGenerator } from '../../app/api/gensite/route';
export { DEFAULT_GENERATION_OPTIONS } from './config';
export type { 
  GeneratedFile, 
  ProjectStructure, 
  GenerationOptions,
  UserIntent,
  BusinessContext,
  ConversationContext,
  FileConfig,
  OpenAIRequestParams
} from './types';
