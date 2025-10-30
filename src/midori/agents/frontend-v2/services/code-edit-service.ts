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
      console.log('🔄 Code changes parsed:', {
        filesCount: changes.length,
        files: changes.map(c => ({
          path: c.filePath,
          changesCount: c.changes?.length || 0,
          contentLength: c.newContent?.length || 0
        }))
      });
      
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
      console.log('💾 Saving changes to database...');
      await this.saveCodeChanges(projectData.projectId, projectData.userId, changes);
      
      const summary = this.generateSummary(changes);
      console.log('✅ Code edit completed successfully!');
      console.log('📊 Summary:', summary);
      console.log('📁 Files modified:', changes.map(c => c.filePath));
      console.log(`⏱️  Execution time: ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        changes,
        summary,
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
5. CRITICAL: Return valid, unescaped code - use proper JSX syntax:
   - Use backticks for template literals with dynamic expressions
   - Use regular quotes (") for string literals
   - Do NOT escape quotes in JSX attributes
   - Example: ${exampleClassName}

IMAGE HANDLING RULES (CRITICAL):
- When user requests image changes (photos, pictures, icons, illustrations):
  * Use REAL, DIRECT URLs from Unsplash in src attribute
  * Format: src="https://images.unsplash.com/photo-[PHOTO_ID]?w=800&q=80"
  * Do NOT create variables, constants, arrays, or functions for image URLs
  * Do NOT use template literals or curly braces for static URLs
  * Do NOT write src="{variableName}" - this is INVALID JSX
  * Do NOT use useMemo, useState, or any hooks for selecting images
  * Do NOT create random/dynamic image selection logic
  * ALWAYS use static, hardcoded URL directly in the src attribute
  * Example CORRECT: <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800" alt="Cat" />
  * Example WRONG: <img src="{catImage}" alt="Cat" /> ❌
  * Example WRONG: const catImage = "..."; <img src={catImage} /> ❌
  * Example WRONG: const images = [...]; const random = useMemo(...); ❌

- How to select Photo IDs:
  * You can use ANY valid Unsplash photo ID that matches the user's request
  * Photo ID format: Usually 13-22 alphanumeric characters (e.g., "1514888286974-6c03e2ca1dba")
  * Search strategy: Think of appropriate keywords and use realistic photo IDs
  * Common examples (you can use these or find similar ones):
    - Cats: photo-1514888286974-6c03e2ca1dba, photo-1519052537078-e6302a4968d4
    - Dogs: photo-1587300003388-59208cc962cb, photo-1561037404-61cd46aa615b, photo-1543466835-00a7907e9de1
    - Horses: photo-1553284965-83fd3e82fa5a, photo-1598924111933-059bb019d110
    - Birds: photo-1552728089-57bdde30beb3, photo-1444464666168-49d633b86797
    - Ocean/Sea: photo-1505142468610-359e7d316be0, photo-1439405326854-014607f694d7
    - Mountains: photo-1506905925346-21bda4d32df4, photo-1464822759023-fed622ff2c3b
    - Forests: photo-1448375240586-882707db888b, photo-1511497584788-876760111969
    - Food: photo-1546069901-ba9599a7e63c, photo-1504674900247-0877df9cc836
    - Coffee: photo-1447933601403-0c6688de566e, photo-1509042239860-f550ce710b93
    - Technology: photo-1518770660439-4636190af475, photo-1519389950473-47ba0277781c
    - Business: photo-1497366216548-37526070297c, photo-1486406146926-c627a92ad1ab
    - People: photo-1438761681033-6461ffad8d80, photo-1507003211169-0a1dd7228f2d
  * For subjects not in the list: Use your knowledge to select appropriate photo IDs
  * IMPORTANT: Always use realistic-looking photo IDs with correct format


CRITICAL REQUIREMENT FOR "newContent":
- You MUST provide the COMPLETE file content with changes applied
- Do NOT use placeholders, comments, or summaries
- Do NOT write "// Full file content..." or similar placeholders
- Write the ACTUAL, COMPLETE, WORKING code
- The code must be ready to save and run immediately

RESPONSE FORMAT (with REAL CODE example):
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
      "newContent": "import React from 'react';\\n\\nexport default function Navbar() {\\n  return (\\n    <nav style={{ backgroundColor: '#10b981' }}>\\n      <h1>My Site</h1>\\n    </nav>\\n  );\\n}"
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
      console.log('🔍 Raw LLM response length:', llmResponse?.length || 0);
      
      const cleanResponse = llmResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('🔍 Cleaned response length:', cleanResponse.length);
      console.log('🔍 Response preview:', cleanResponse.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanResponse);
      console.log('✅ JSON parsed successfully:', {
        hasFiles: !!parsed.files,
        filesCount: parsed.files?.length || 0,
        hasSummary: !!parsed.summary
      });
      
      const changes = parsed.files.map((file: any) => ({
        filePath: file.path,
        changes: file.changes,
        newContent: this.unescapeContent(file.newContent),  // ✅ Unescape content
        summary: file.summary || parsed.summary
      }));
      
      // ✅ Validate that newContent is not a placeholder
      for (const change of changes) {
        if (this.isPlaceholderContent(change.newContent)) {
          console.error('❌ LLM returned placeholder instead of actual code:', {
            file: change.filePath,
            content: change.newContent?.substring(0, 100)
          });
          throw new Error(
            `LLM returned placeholder content for ${change.filePath}. ` +
            'This is a critical error - the model must provide complete, working code.'
          );
        }
      }
      
      console.log('📝 Changes details:');
      changes.forEach((change: CodeChange) => {
        console.log(`\n📄 File: ${change.filePath}`);
        console.log(`   Summary: ${change.summary}`);
        console.log(`   Content length: ${change.newContent?.length || 0} characters`);
        if (change.changes && change.changes.length > 0) {
          console.log(`   Changes:`);
          change.changes.forEach((c: any, idx: number) => {
            console.log(`     ${idx + 1}. ${c.type}: ${c.old} → ${c.new}`);
            console.log(`        Reason: ${c.reason}`);
          });
        }
      });
      
      return changes;
      
    } catch (error) {
      console.error('❌ Failed to parse LLM response:', error);
      
      // Preserve original error message if available
      const errorMessage = error instanceof Error ? error.message : 'Invalid LLM response format';
      throw new Error(`Failed to parse LLM response: ${errorMessage}`);
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
   * Detect if content is a placeholder/comment instead of actual code
   */
  private isPlaceholderContent(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return true;
    }
    
    const trimmed = content.trim();
    
    // Check for common placeholder patterns
    const placeholderPatterns = [
      /^\/\/\s*full\s+file\s+content/i,
      /^\/\/\s*complete\s+code/i,
      /^\/\/\s*.*code.*here/i,
      /^\/\/\s*valid\s+jsx\s+code/i,
      /^\/\*.*code.*\*\/$/s,
      /^\[.*code.*\]$/i,
      /^<.*code.*>$/i,
      /^\.\.\.$/,
      /^todo:/i,
      /^placeholder/i
    ];
    
    // If content is ONLY a comment or placeholder
    for (const pattern of placeholderPatterns) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }
    
    // If content is too short to be real code (less than 50 chars)
    // and contains only comments
    if (trimmed.length < 50 && (trimmed.startsWith('//') || trimmed.startsWith('/*'))) {
      return true;
    }
    
    return false;
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
      console.log(`💾 Starting database save for project ${projectId}...`);
      
      // 1. สร้าง Generation record
      console.log('📝 Creating Generation record...');
      const generation = await this.prisma.generation.create({
        data: {
          projectId,
          userId,
          model: 'gpt-5-nano',
          promptJson: { type: 'code_edit', changes },
          options: { editType: 'chat_edit' }
        }
      });
      console.log(`✅ Generation created: ${generation.id}`);
      
      // 2. อัปเดตไฟล์
      console.log(`📂 Updating ${changes.length} file(s)...`);
      for (const change of changes) {
        // อัปเดตไฟล์หลัก
        console.log(`   Updating file: ${change.filePath}`);
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
        console.log(`   ✅ ${change.filePath} updated`);
      }
      
      // 3. สร้าง Snapshot
      console.log('📸 Creating snapshot...');
      await this.createSnapshot(projectId, generation.id);
      console.log('✅ Snapshot created');
      
      // 4. อัปเดต project และ project context
      console.log('🔄 Updating project metadata...');
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
      console.log('✅ Project metadata updated');
      
      console.log(`✅ Code changes saved and preview will auto-update for project ${projectId}`);
      
    } catch (error) {
      console.error('❌ Failed to save code changes:', error);
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
    // Enhanced TypeScript validation
    try {
      // 1. Check for basic syntax errors
      if (content.includes('import') && !content.includes('from')) {
        console.warn('⚠️ Invalid import statement without "from"');
        return false;
      }
      
      // 2. Check for duplicate exports
      if (content.includes('export') && content.includes('export export')) {
        console.warn('⚠️ Duplicate export statement');
        return false;
      }
      
      // 3. Check for unclosed brackets/braces
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.warn('⚠️ Unmatched braces: {', openBraces, '} vs }', closeBraces);
        return false;
      }
      
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        console.warn('⚠️ Unmatched brackets');
        return false;
      }
      
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        console.warn('⚠️ Unmatched parentheses');
        return false;
      }
      
      // 4. Check for escaped quotes in JSX (common LLM error)
      if (content.includes('className=\\"') || content.includes('className=\\\'')) {
        console.warn('⚠️ Found escaped quotes in JSX - should use unescaped');
        return false;
      }
      
      // 5. Check for invalid JSX attribute syntax: src="{variable}" or href="{link}"
      const invalidJSXPattern = /\s(src|href|alt|className|style)="\{[^}]+\}"/g;
      const invalidMatches = content.match(invalidJSXPattern);
      if (invalidMatches) {
        console.warn('⚠️ Invalid JSX syntax found:', invalidMatches.join(', '));
        console.warn('   Should be: src={variable} or src="https://..."');
        console.warn('   Not: src="{variable}"');
        return false;
      }
      
      // 6. Check for image URLs with variables when they should be direct URLs
      const imageVarPattern = /(const|let|var)\s+\w+Image(s)?\s*=\s*/g;
      if (imageVarPattern.test(content)) {
        console.warn('⚠️ Found image variable declaration - consider using direct URL in src attribute');
        console.warn('   Prefer: <img src="https://images.unsplash.com/..." />');
        console.warn('   Over: const catImage = "..."; <img src={catImage} />');
        // This is a warning, not an error, so we don't return false
      }
      
      // 7. Check for React hooks used for image selection (useMemo, useState)
      const imageHooksPattern = /(useMemo|useState|useCallback).*[Ii]mage/g;
      if (imageHooksPattern.test(content)) {
        console.warn('⚠️ Found React hooks for image selection - use static URLs instead');
        console.warn('   Prefer: <img src="https://images.unsplash.com/..." />');
        console.warn('   Not: const img = useMemo(() => ..., []);');
        return false;
      }
      
      // 8. Check for random/dynamic image selection logic
      const randomPattern = /(Math\.random|Math\.floor.*random|getRandomImage|selectRandomImage)/gi;
      if (randomPattern.test(content)) {
        console.warn('⚠️ Found random image selection logic - use static URL instead');
        console.warn('   User wants ONE specific image, not random selection');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating TypeScript:', error);
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
    const changeCount = changes.reduce((sum, change) => {
      // ป้องกัน undefined - บาง LLM response อาจไม่มี changes array
      return sum + (change.changes?.length || 0);
    }, 0);
    
    // สร้าง summary จาก file summaries
    const summaries = changes
      .map(c => c.summary)
      .filter(s => s)
      .join('; ');
    
    if (summaries) {
      return `Modified ${fileCount} file(s): ${summaries}`;
    }
    
    return `Modified ${fileCount} file(s) with ${changeCount} change(s)`;
  }
}

// Export singleton instance
export const codeEditService = new CodeEditService();
