/**
 * File Storage Service
 * Manages file storage and retrieval for the Component-Based System
 */

import { RenderedFiles, RenderedFile } from './renderer';
import { prisma } from '@/libs/prisma/prisma';

export interface FileStorageOptions {
  projectId: string;
  version?: string;
  overwrite?: boolean;
  backup?: boolean;
}

export interface FileStorageResult {
  success: boolean;
  filesStored: number;
  totalSize: number;
  storagePath: string;
  version: string;
  storedAt: string;
  errors?: string[];
}

export interface FileRetrievalOptions {
  projectId: string;
  version?: string;
  fileTypes?: string[];
  includeContent?: boolean;
}

export interface FileRetrievalResult {
  success: boolean;
  files: RenderedFile[];
  metadata: {
    totalFiles: number;
    totalSize: number;
    version: string;
    storedAt: string;
  };
  errors?: string[];
}

export class FileStorageService {
  private static instance: FileStorageService;

  private constructor() {}

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  /**
   * Store rendered files in database
   */
  async storeFiles(
    renderedFiles: RenderedFiles,
    options: FileStorageOptions
  ): Promise<FileStorageResult> {
    console.log('💾 Starting file storage...', {
      projectId: options.projectId,
      files: renderedFiles.metadata.totalFiles,
      size: `${Math.round(renderedFiles.metadata.totalSize / 1024)}KB`
    });

    try {
      const version = options.version || `v${Date.now()}`;
      const errors: string[] = [];
      let filesStored = 0;
      let totalSize = 0;

      // 1. Create or update project record
      await this.ensureProjectExists(options.projectId);

      // 2. Store files individually
      for (const file of renderedFiles.files) {
        try {
          await this.storeFile(file, options.projectId, version);
          filesStored++;
          totalSize += file.content.length;
        } catch (error) {
          const errorMsg = `Failed to store file ${file.path}: ${error}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      // 3. Store metadata
      await this.storeMetadata(renderedFiles.metadata, options.projectId, version, renderedFiles.files);

      // 4. Create snapshot for preview system
      await this.createSnapshot(options.projectId, renderedFiles, version);

      // 5. Update project status
      await this.updateProjectStatus(options.projectId, 'files_stored');

      const result: FileStorageResult = {
        success: errors.length === 0,
        filesStored,
        totalSize,
        storagePath: `projects/${options.projectId}/files/${version}`,
        version,
        storedAt: new Date().toISOString(),
        errors: errors.length > 0 ? errors : undefined
      };

      console.log('✅ File storage completed:', {
        success: result.success,
        files: result.filesStored,
        size: `${Math.round(result.totalSize / 1024)}KB`,
        errors: errors.length
      });

      return result;
    } catch (error) {
      console.error('❌ File storage failed:', error);
      return {
        success: false,
        filesStored: 0,
        totalSize: 0,
        storagePath: '',
        version: options.version || 'unknown',
        storedAt: new Date().toISOString(),
        errors: [String(error)]
      };
    }
  }

  /**
   * Retrieve stored files
   */
  async retrieveFiles(options: FileRetrievalOptions): Promise<FileRetrievalResult> {
    console.log('📁 Retrieving files...', {
      projectId: options.projectId,
      version: options.version || 'latest'
    });

    try {
      // 1. Get project files from File table
      const projectFiles = await prisma.file.findMany({
        where: {
          projectId: options.projectId
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (projectFiles.length === 0) {
        return {
          success: false,
          files: [],
          metadata: {
            totalFiles: 0,
            totalSize: 0,
            version: options.version || 'unknown',
            storedAt: new Date().toISOString()
          },
          errors: ['No files found for project']
        };
      }

      // 2. Filter by file types if specified
      let filteredFiles = projectFiles;
      if (options.fileTypes && options.fileTypes.length > 0) {
        filteredFiles = projectFiles.filter(file => 
          options.fileTypes!.includes(this.mapFileTypeToString(file.type))
        );
      }

      // 3. Convert to RenderedFile format
      const files: RenderedFile[] = filteredFiles.map(file => ({
        path: file.path,
        content: options.includeContent ? (file.content || '') : '',
        type: this.mapFileTypeToString(file.type) as any,
        language: this.getLanguageFromPath(file.path) as any,
        dependencies: []
      }));

      // 4. Get metadata
      const metadata = await this.getMetadata(options.projectId, options.version);

      const result: FileRetrievalResult = {
        success: true,
        files,
        metadata: {
          totalFiles: files.length,
          totalSize: files.reduce((sum, file) => sum + file.content.length, 0),
          version: metadata?.version || options.version || 'unknown',
          storedAt: metadata?.storedAt || new Date().toISOString()
        }
      };

      console.log('✅ File retrieval completed:', {
        files: result.metadata.totalFiles,
        size: `${Math.round(result.metadata.totalSize / 1024)}KB`
      });

      return result;
    } catch (error) {
      console.error('❌ File retrieval failed:', error);
      return {
        success: false,
        files: [],
        metadata: {
          totalFiles: 0,
          totalSize: 0,
          version: options.version || 'unknown',
          storedAt: new Date().toISOString()
        },
        errors: [String(error)]
      };
    }
  }

  /**
   * Get file by path
   */
  async getFile(projectId: string, filePath: string, version?: string): Promise<RenderedFile | null> {
    try {
      const file = await prisma.file.findFirst({
        where: {
          projectId,
          path: filePath
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!file) return null;

      return {
        path: file.path,
        content: file.content || '',
        type: this.mapFileTypeToString(file.type) as any,
        language: this.getLanguageFromPath(file.path) as any,
        dependencies: []
      };
    } catch (error) {
      console.error('❌ Failed to get file:', error);
      return null;
    }
  }

  /**
   * Update file content
   */
  async updateFile(
    projectId: string,
    filePath: string,
    content: string,
    version?: string
  ): Promise<boolean> {
    try {
      await prisma.file.updateMany({
        where: {
          projectId,
          path: filePath
        },
        data: {
          content,
          updatedAt: new Date()
        }
      });

      console.log('✅ File updated:', filePath);
      return true;
    } catch (error) {
      console.error('❌ Failed to update file:', error);
      return false;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(projectId: string, filePath: string, version?: string): Promise<boolean> {
    try {
      await prisma.file.deleteMany({
        where: {
          projectId,
          path: filePath
        }
      });

      console.log('✅ File deleted:', filePath);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      return false;
    }
  }

  /**
   * List all files for a project
   */
  async listFiles(projectId: string, version?: string): Promise<string[]> {
    try {
      const files = await prisma.file.findMany({
        where: {
          projectId
        },
        select: { path: true },
        orderBy: { updatedAt: 'desc' }
      });

      return files.map(file => file.path);
    } catch (error) {
      console.error('❌ Failed to list files:', error);
      return [];
    }
  }

  /**
   * Get project versions
   */
  async getProjectVersions(projectId: string): Promise<string[]> {
    try {
      // ใช้ Project.options แทน ProjectMetadata
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { options: true }
      });

      if (!project?.options) return ['v1.0.0'];
      
      const options = project.options as any;
      const componentSystem = options.componentSystem;
      
      if (componentSystem?.version) {
        return [componentSystem.version];
      }
      
      return ['v1.0.0'];
    } catch (error) {
      console.error('❌ Failed to get versions:', error);
      return ['v1.0.0'];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(projectId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    versions: number;
    lastUpdated: string;
  }> {
    try {
      const stats = await prisma.file.aggregate({
        where: { projectId },
        _count: { id: true }
      });

      const files = await prisma.file.findMany({
        where: { projectId },
        select: { content: true, updatedAt: true }
      });

      const totalSize = files.reduce((sum, file) => sum + (file.content?.length || 0), 0);
      const versions = await this.getProjectVersions(projectId);
      const lastFile = files.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];

      return {
        totalFiles: stats._count.id || 0,
        totalSize,
        versions: versions.length,
        lastUpdated: lastFile?.updatedAt.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        versions: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // ============================
  // Private Helper Methods
  // ============================

  private async ensureProjectExists(projectId: string): Promise<void> {
    console.log('🔍 Checking if project exists:', projectId);
    
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (existingProject) {
      console.log('✅ Project already exists:', {
        id: existingProject.id,
        name: existingProject.name,
        ownerId: existingProject.ownerId,
        createdAt: existingProject.createdAt
      });
      return;
    }

    console.log('📝 Creating new project:', projectId);

    // Find or create a default user for system projects
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'system@midori.ai' }
    });

    if (!defaultUser) {
      console.log('👤 Creating default system user...');
      defaultUser = await prisma.user.create({
        data: {
          email: 'system@midori.ai',
          displayName: 'System User',
          isActive: true
        }
      });
      console.log('✅ Created system user:', defaultUser.id);
    }

    const newProject = await prisma.project.create({
      data: {
        id: projectId,
        name: `Project ${projectId}`,
        ownerId: defaultUser.id,
        visibility: 'private',
        options: {},
        likeCount: 0
      }
    });
    
    console.log('✅ Created project record:', {
      id: newProject.id,
      name: newProject.name,
      ownerId: newProject.ownerId,
      createdAt: newProject.createdAt
    });
  }

  private async storeFile(
    file: RenderedFile,
    projectId: string,
    version: string
  ): Promise<void> {
    console.log('💾 Storing file to database:', {
      projectId,
      path: file.path,
      type: file.type,
      mappedType: this.mapFileType(file.type),
      contentLength: file.content.length,
      version
    });
    
    // ใช้ตาราง File เดิมแทน ProjectFile
    const result = await prisma.file.upsert({
      where: {
        projectId_path: {
          projectId,
          path: file.path
        }
      },
      update: {
        content: file.content,
        type: this.mapFileType(file.type),
        isBinary: false,
        updatedAt: new Date()
      },
      create: {
        projectId,
        path: file.path,
        content: file.content,
        type: this.mapFileType(file.type),
        isBinary: false
      }
    });
    
    console.log('✅ File stored successfully:', {
      id: result.id,
      projectId: result.projectId,
      path: result.path,
      type: result.type,
      contentLength: result.content?.length || 0,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    });
  }

  private async storeMetadata(
    metadata: RenderedFiles['metadata'],
    projectId: string,
    version: string,
    files?: RenderedFiles['files']
  ): Promise<void> {
    console.log('📊 Storing metadata to database:', {
      projectId,
      version,
      metadata: {
        totalFiles: metadata.totalFiles,
        totalSize: metadata.totalSize,
        componentsUsed: metadata.componentsUsed,
        variantsUsed: metadata.variantsUsed,
        themePack: metadata.themePack,
        blueprint: metadata.blueprint
      }
    });
    
    // สร้าง exportedJson สำหรับ Preview System (แบบใหม่ - ไม่มี wrapper)
    const exportedJson = this.buildExportedJson(metadata, files || []);
    
    // เก็บ metadata ใน Project.options แทน ProjectMetadata
    // ต้อง merge กับ options ที่มีอยู่แล้ว
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { options: true }
    });

    const existingOptions = project?.options as any || {};
    
    const result = await prisma.project.update({
      where: { id: projectId },
      data: {
        options: {
          ...existingOptions,
          componentSystem: {
            version,
            metadata,
            lastUpdated: new Date().toISOString()
          },
          exportedJson, // ใช้ JSON แบบใหม่ (ไม่มี wrapper)
          exportFormatVersion: 'v1'
        }
      }
    });
    
    console.log('✅ Metadata stored successfully:', {
      projectId: result.id,
      options: result.options,
      updatedAt: result.updatedAt
    });
  }

  private async getMetadata(projectId: string, version?: string): Promise<any> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { options: true }
    });

    if (!project?.options) return null;
    
    const options = project.options as any;
    return options.componentSystem?.metadata || null;
  }

  private async updateProjectStatus(projectId: string, status: string): Promise<void> {
    // Store status in options field since Project model doesn't have status field
    // ต้อง merge กับ options ที่มีอยู่แล้ว
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { options: true }
    });

    const existingOptions = project?.options as any || {};
    
    await prisma.project.update({
      where: { id: projectId },
      data: {
        options: {
          ...existingOptions,
          status: status,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }

  private buildExportedJson(metadata: RenderedFiles['metadata'], files: RenderedFiles['files']): any {
    const projectStructure = {
      name: `project-${Date.now()}`,
      type: 'vite-react-typescript',
      description: 'Generated by Component System'
    };

    const mapLanguage = (file: any): string | undefined => {
      const p: string = file.path || '';
      if (p.endsWith('.tsx')) return 'typescript';
      if (p.endsWith('.ts')) return 'typescript';
      if (p.endsWith('.js')) return 'javascript';
      if (p.endsWith('.cjs')) return 'javascript';
      if (p.endsWith('.jsx')) return 'javascript';
      if (p.endsWith('.css')) return 'css';
      if (p.endsWith('.html')) return 'html';
      if (p.endsWith('.json')) return 'json';
      if (p.endsWith('.md')) return 'markdown';
      return undefined;
    };

    const mapType = (file: any): string => {
      const p: string = file.path || '';
      if (p === 'index.html') return 'config';
      if (p === 'vite.config.ts') return 'config';
      if (p === 'tailwind.config.js') return 'config';
      if (p === 'postcss.config.cjs') return 'config';
      if (p === 'src/main.tsx') return 'page';
      if (p === 'src/App.tsx') return 'page';
      if (p.startsWith('src/pages/')) return 'page';
      if (file.type && !p.endsWith('.html')) return file.type;
      if (p.endsWith('.css')) return 'style';
      if (p.endsWith('.html')) return 'config';
      if (p.endsWith('.json')) return 'config';
      return 'component';
    };

    const exportedFiles = files.map((f: any) => ({
      path: f.path,
      content: f.content,
      type: mapType(f),
      language: mapLanguage(f)
    }));

    // ส่งคืน JSON แบบเดียวกับ test-cafe-complete.json (ไม่มี wrapper)
    return {
      projectStructure,
      files: exportedFiles
    };
  }

  private async createSnapshot(
    projectId: string,
    renderedFiles: RenderedFiles,
    version: string
  ): Promise<void> {
    console.log('📸 Creating snapshot for preview system:', {
      projectId,
      version,
      totalFiles: renderedFiles.metadata.totalFiles
    });

    try {
      // สร้าง snapshot files ในรูปแบบที่ Preview System ต้องการ
      const snapshotFiles = renderedFiles.files.map((file: any) => ({
        path: file.path,
        content: file.content,
        type: file.type || 'code'
      }));

      // สร้าง templateData สำหรับ snapshot (ใช้ exportedJson แบบใหม่)
      const exportedJson = this.buildExportedJson(renderedFiles.metadata, renderedFiles.files);
      
      const templateData = {
        businessCategory: 'restaurant', // TODO: รับจาก metadata
        blocksGenerated: renderedFiles.metadata.componentsUsed,
        aiContentGenerated: true,
        exportedJson: exportedJson, // ใช้ JSON แบบใหม่ (ไม่มี wrapper)
        componentSystem: {
          version,
          metadata: renderedFiles.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

      const snapshot = await prisma.snapshot.create({
        data: {
          projectId,
          label: `Component System - ${version} - ${new Date().toISOString()}`,
          files: snapshotFiles as any,
          templateData: templateData as any,
          fromGenerationId: null // Component System ไม่มี generation ID
        }
      });

      console.log('✅ Snapshot created successfully:', {
        snapshotId: snapshot.id,
        projectId: snapshot.projectId,
        label: snapshot.label,
        filesCount: snapshotFiles.length
      });

    } catch (error) {
      console.error('❌ Failed to create snapshot:', error);
      // Don't throw error, just log it - snapshot is not critical for file storage
    }
  }

  /**
   * Map RenderedFile type to Prisma FileType enum
   */
  private mapFileType(fileType: string): 'code' | 'text' | 'config' | 'asset' {
    switch (fileType) {
      case 'component':
      case 'page':
      case 'layout':
        return 'code';
      case 'style':
        return 'text';
      case 'config':
        return 'config';
      default:
        return 'code';
    }
  }

  /**
   * Map Prisma FileType enum to RenderedFile type
   */
  private mapFileTypeToString(fileType: 'code' | 'text' | 'config' | 'asset'): string {
    switch (fileType) {
      case 'code':
        return 'component';
      case 'text':
        return 'style';
      case 'config':
        return 'config';
      case 'asset':
        return 'asset';
      default:
        return 'component';
    }
  }

  /**
   * Get language from file path
   */
  private getLanguageFromPath(path: string): string {
    if (path.endsWith('.tsx')) return 'tsx';
    if (path.endsWith('.ts')) return 'ts';
    if (path.endsWith('.js')) return 'js';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.html')) return 'html';
    return 'tsx';
  }
}
