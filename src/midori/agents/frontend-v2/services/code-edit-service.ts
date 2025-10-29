/**
 * 🔧 Code Edit Service
 * จัดการการแก้ไขโค้ดโดยตรงผ่าน LLM
 * 
 * Features:
 * - Website context building
 * - Smart file selection
 * - LLM-based code editing
 * - Database integration
 * - Error handling & validation
 */

import { LLMAdapter } from '../../orchestrator/adapters/llmAdapter';

// Types
export interface WebsiteContext {
  projectId: string;
  projectName: string;
  projectType: string;
  files: FileData[];
  recentChanges: RecentChange[];
  currentStyles: CurrentStyles;
}

export interface FileData {
  path: string;
  content: string;
  type: string;
}

export interface RecentChange {
  prompt: any;
  timestamp: Date;
}

export interface CurrentStyles {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  [key: string]: any;
}

export interface FileSelection {
  path: string;
  content: string;
  type: string;
}

export interface CodeChange {
  filePath: string;
  changes: ChangeDetail[];
  newContent: string;
  summary: string;
}

export interface ChangeDetail {
  type: 'style' | 'text' | 'structure' | 'import';
  line: number;
  old: string;
  new: string;
  reason: string;
}

export interface CodeEditResult {
  success: boolean;
  changes: CodeChange[];
  summary: string;
  filesModified: string[];
  executionTime: number;
  errors?: string[];
}

export class CodeEditService {
  private llmAdapter: LLMAdapter;
  private prisma: any;
  private initialized: boolean = false;

  constructor() {
    this.llmAdapter = new LLMAdapter();
    this.prisma = (globalThis as any).prisma;
  }

  /**
   * Initialize LLM adapter
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.llmAdapter.initialize();
      this.initialized = true;
      console.log('✅ CodeEditService LLM initialized');
    }
  }

  /**
   * Main entry point for code edit requests
   */
  async processEditRequest(
    userRequest: string,
    projectData: any,
    analysis: any
  ): Promise<CodeEditResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔧 Processing code edit request:', userRequest);
      
      // 1. Initialize LLM if not already done
      await this.ensureInitialized();
      
      // 2. สร้าง Website Context
      const context = await this.buildWebsiteContext(projectData.projectId);
      console.log('📋 Website context built:', {
        projectId: context.projectId,
        filesCount: context.files.length,
        projectType: context.projectType
      });
      
      // 3. เลือกไฟล์ที่เกี่ยวข้อง
      const relevantFiles = await this.selectRelevantFiles(userRequest, context);
      console.log('🎯 Selected relevant files:', relevantFiles.map(f => f.path));
      
      // 4. สร้าง Edit Prompt
      const prompt = this.createEditPrompt(userRequest, relevantFiles, context);
      
      // 5. เรียก LLM
      const llmResponse = await this.llmAdapter.callLLM(prompt, {
        useSystemPrompt: true,
        temperature: 0.3,
        maxTokens: 4000,
        maxCompletionTokens: 40000  // ✅ เพิ่ม max completion tokens สำหรับ GPT-5
      });
      
      // 6. แปลงเป็น Code Changes
      const changes = this.parseCodeChanges(llmResponse.content);
      
      // 7. Validate changes
      const validation = await this.validateCodeChanges(changes);
      if (!validation.isValid) {
        return {
          success: false,
          changes: [],
          summary: 'Code validation failed',
          filesModified: [],
          executionTime: Date.now() - startTime,
          errors: validation.errors
        };
      }
      
      // 8. บันทึกการเปลี่ยนแปลง
      await this.saveCodeChanges(projectData.projectId, projectData.userId, changes);
      
      return {
        success: true,
        changes,
        summary: this.generateSummary(changes),
        filesModified: changes.map(c => c.filePath),
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('❌ Code edit error:', error);
      return {
        success: false,
        changes: [],
        summary: 'Code edit failed',
        filesModified: [],
        executionTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * สร้าง Website Context จากข้อมูลโปรเจ็กต์
   */
  private async buildWebsiteContext(projectId: string): Promise<WebsiteContext> {
    try {
      // ดึงไฟล์ทั้งหมด
      const files = await this.prisma.file.findMany({
        where: { projectId },
        select: { path: true, content: true, type: true }
      });
      
      // ดึงข้อมูลโปรเจ็กต์
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { 
          name: true,
          projectContext: {
            select: {
              projectType: true
            }
          }
        }
      });
      
      // ดึงการเปลี่ยนแปลงล่าสุด
      const recentChanges = await this.prisma.generation.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { promptJson: true, createdAt: true }
      });
      
      return {
        projectId,
        projectName: project?.name || 'Unknown Project',
        projectType: project?.projectContext?.projectType || 'website',
        files: files.map((f: any) => ({
          path: f.path,
          content: f.content || '',
          type: f.type
        })),
        recentChanges: recentChanges.map((c: any) => ({
          prompt: c.promptJson,
          timestamp: c.createdAt
        })),
        currentStyles: this.extractCurrentStyles(files)
      };
    } catch (error) {
      console.error('Failed to build website context:', error);
      throw new Error('Failed to build website context');
    }
  }

  /**
   * เลือกไฟล์ที่เกี่ยวข้องกับคำขอ
   */
  private async selectRelevantFiles(
    userRequest: string, 
    context: WebsiteContext
  ): Promise<FileSelection[]> {
    
    try {
      // ใช้ LLM เลือกไฟล์ที่เกี่ยวข้อง
      const prompt = `
User Request: "${userRequest}"

Available Files:
${context.files.map(f => `- ${f.path} (${f.type})`).join('\n')}

Which files need to be modified to fulfill this request?
Return JSON array of file paths only.

Example: ["src/components/Navbar.tsx", "src/index.css"]
      `;
      
      const response = await this.llmAdapter.callLLM(prompt, {
        useSystemPrompt: false,
        temperature: 0.1,
        maxTokens: 500,
        maxCompletionTokens: 40000  // ✅ เพิ่มสำหรับ GPT-5
      });
      
      const selectedPaths = JSON.parse(response.content);
      
      return context.files.filter(f => selectedPaths.includes(f.path));
    } catch (error) {
      console.error('Failed to select relevant files:', error);
      // Fallback: return all files
      return context.files;
    }
  }

  /**
   * สร้าง Edit Prompt สำหรับ LLM
   */
  private createEditPrompt(
    userRequest: string,
    files: FileSelection[],
    context: WebsiteContext
  ): string {
    const exampleClassName = 'className={`flex $' + '{isOpen ? \'block\' : \'hidden\'}`}';
    
    return `
You are an expert React/TypeScript developer. Your task is to modify the website code based on user request.

WEBSITE CONTEXT:
- Project: ${context.projectName} (${context.projectType})
- Recent Changes: ${context.recentChanges.map(c => c.prompt).join(', ')}

USER REQUEST: "${userRequest}"

FILES TO MODIFY:
${files.map(f => `
FILE: ${f.path}
TYPE: ${f.type}
CONTENT:
\`\`\`${this.getFileLanguage(f.path)}
${f.content}
\`\`\`
`).join('\n')}

CURRENT STYLES:
${JSON.stringify(context.currentStyles, null, 2)}

INSTRUCTIONS:
1. Make ONLY the necessary changes to fulfill the user request
2. Preserve existing functionality
3. Follow React/TypeScript best practices
4. Maintain consistent styling
5. Return ONLY the modified code sections
6. CRITICAL: Return valid, unescaped code - use proper JSX syntax:
   - Use backticks for template literals with dynamic expressions
   - Use regular quotes (") for string literals
   - Do NOT escape quotes in JSX attributes
   - Example: ${exampleClassName}

RESPONSE FORMAT:
{
  "files": [
    {
      "path": "src/components/Navbar.tsx",
      "changes": [
        {
          "type": "style",
          "line": 15,
          "old": "backgroundColor: '#3b82f6'",
          "new": "backgroundColor: '#10b981'",
          "reason": "Changed navbar color to green as requested"
        }
      ],
      "newContent": "// Full file content with changes applied - VALID JSX CODE"
    }
  ],
  "summary": "Brief description of changes made"
}
    `;
  }

  /**
   * แปลง LLM response เป็น Code Changes
   */
  private parseCodeChanges(llmResponse: string): CodeChange[] {
    try {
      const cleanResponse = llmResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      return parsed.files.map((file: any) => ({
        filePath: file.path,
        changes: file.changes,
        newContent: this.unescapeContent(file.newContent),  // ✅ Unescape content
        summary: file.summary || parsed.summary
      }));
      
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error('Invalid LLM response format');
    }
  }

  /**
   * Unescape content from LLM (removes extra escaping)
   */
  private unescapeContent(content: string): string {
    if (!content) return content;
    
    try {
      // If content is a JSON string, parse it to unescape
      // This handles cases where LLM returns escaped strings like \"
      if (content.startsWith('"') && content.endsWith('"')) {
        return JSON.parse(content);
      }
      
      // Manual unescape for common cases
      return content
        .replace(/\\"/g, '"')     // \" → "
        .replace(/\\'/g, "'")     // \' → '
        .replace(/\\n/g, '\n')    // \\n → \n
        .replace(/\\t/g, '\t')    // \\t → \t
        .replace(/\\\\/g, '\\');  // \\\\ → \\
      
    } catch (error) {
      console.warn('Failed to unescape content, using as-is:', error);
      return content;
    }
  }

  /**
   * Validate code changes
   */
  private async validateCodeChanges(changes: CodeChange[]): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    for (const change of changes) {
      // ตรวจสอบ syntax
      if (change.filePath.endsWith('.tsx') || change.filePath.endsWith('.ts')) {
        const syntaxValid = await this.validateTypeScript(change.newContent);
        if (!syntaxValid) {
          errors.push(`Syntax error in ${change.filePath}`);
        }
      }
      
      // ตรวจสอบ imports
      const importsValid = await this.validateImports(change.newContent);
      if (!importsValid) {
        errors.push(`Import error in ${change.filePath}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * บันทึกการเปลี่ยนแปลงลง database
   */
  private async saveCodeChanges(projectId: string, userId: string, changes: CodeChange[]): Promise<void> {
    try {
      // 1. สร้าง Generation record
      const generation = await this.prisma.generation.create({
        data: {
          projectId,
          userId,
          model: 'gpt-5-nano',
          promptJson: { type: 'code_edit', changes },
          options: { editType: 'chat_edit' }
        }
      });
      
      // 2. อัปเดตไฟล์
      for (const change of changes) {
        // อัปเดตไฟล์หลัก
        await this.prisma.file.update({
          where: { projectId_path: { projectId, path: change.filePath } },
          data: { 
            content: change.newContent,
            updatedAt: new Date()
          }
        });
        
        // บันทึกใน GenerationFile
        await this.prisma.generationFile.create({
          data: {
            generationId: generation.id,
            filePath: change.filePath,
            fileContent: change.newContent,
            changeType: 'update'
          }
        });
      }
      
      // 3. สร้าง Snapshot
      await this.createSnapshot(projectId, generation.id);
      
      // 4. อัปเดต project และ project context
      await this.prisma.project.update({
        where: { id: projectId },
        data: { 
          updatedAt: new Date()
        }
      });
      
      // Update project context status
      await this.prisma.projectContext.updateMany({
        where: { projectId },
        data: {
          status: 'in_progress',  // Mark as in progress after edit
          lastModified: new Date()
        }
      });
      
      console.log(`✅ Code changes saved and preview will auto-update for project ${projectId}`);
      
    } catch (error) {
      console.error('Failed to save code changes:', error);
      throw error;
    }
  }

  /**
   * สร้าง Snapshot
   */
  private async createSnapshot(projectId: string, generationId: string): Promise<void> {
    const files = await this.prisma.file.findMany({
      where: { projectId },
      select: { path: true, content: true, type: true }
    });
    
    await this.prisma.snapshot.create({
      data: {
        projectId,
        label: `chat-edit-${new Date().toISOString()}`,
        files: files as any,
        fromGenerationId: generationId,
        templateData: {
          editType: 'chat_edit',
          timestamp: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Helper methods
   */
  private getFileLanguage(filePath: string): string {
    if (filePath.endsWith('.tsx')) return 'tsx';
    if (filePath.endsWith('.ts')) return 'typescript';
    if (filePath.endsWith('.jsx')) return 'jsx';
    if (filePath.endsWith('.js')) return 'javascript';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.json')) return 'json';
    return 'text';
  }

  private extractCurrentStyles(files: any[]): CurrentStyles {
    // Extract current styles from CSS files
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const styles: CurrentStyles = {};
    
    for (const file of cssFiles) {
      const content = file.content || '';
      // Extract CSS variables and common styles
      const colorMatch = content.match(/--primary-color:\s*([^;]+)/);
      if (colorMatch) {
        styles.primaryColor = colorMatch[1].trim();
      }
    }
    
    return styles;
  }

  private async validateTypeScript(content: string): Promise<boolean> {
    // Basic TypeScript validation
    try {
      // Check for basic syntax errors
      if (content.includes('import') && !content.includes('from')) {
        return false;
      }
      if (content.includes('export') && content.includes('export export')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private async validateImports(content: string): Promise<boolean> {
    // Basic import validation
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    for (const line of importLines) {
      if (!line.includes('from') && !line.includes('require')) {
        return false;
      }
    }
    return true;
  }

  private generateSummary(changes: CodeChange[]): string {
    if (changes.length === 0) {
      return 'No changes made';
    }
    
    const fileCount = changes.length;
    const changeCount = changes.reduce((sum, change) => sum + change.changes.length, 0);
    
    return `Modified ${fileCount} file(s) with ${changeCount} change(s)`;
  }
}

// Export singleton instance
export const codeEditService = new CodeEditService();
