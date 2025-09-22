/**
 * Project Context Service
 * Service for managing project state and context
 * ใช้ร่วมกับ SpecBundle (template spec) และ UiTemplate (template structure)
 */

import { prisma } from '@/libs/prisma/prisma';
import { 
  ProjectType, 
  ProjectStatus, 
  ComponentType, 
  PageType 
} from '@prisma/client';
import type {
  ProjectContextData,
  ComponentStateData,
  PageStateData,
  StylingStateData,
  ConversationHistoryData,
  UserPreferencesData,
  CreateProjectContextInput,
  UpdateProjectContextInput,
  CreateComponentStateInput,
  UpdateComponentStateInput,
  CreatePageStateInput,
  UpdatePageStateInput,
  CreateStylingStateInput,
  UpdateStylingStateInput,
  CreateConversationHistoryInput,
  UpdateConversationHistoryInput,
  CreateUserPreferencesInput,
  UpdateUserPreferencesInput,
  ProjectContextQuery,
  ComponentStateQuery,
  PageStateQuery,
  ConversationHistoryQuery
} from '../types/projectContext';

export class ProjectContextService {
  // ============================
  // Project Context Management
  // ============================

  static async createProjectContext(input: CreateProjectContextInput): Promise<ProjectContextData> {
    const projectContext = await prisma.projectContext.create({
      data: {
        projectId: input.projectId,
        specBundleId: input.specBundleId,
        projectType: input.projectType,
        status: input.status || 'created',
        components: input.components || [],
        pages: input.pages || [],
        styling: input.styling || {
          theme: {
            name: 'default',
            primary: '#3B82F6',
            secondary: '#6B7280',
            accent: '#F59E0B',
            neutral: '#9CA3AF',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444'
          },
          colors: {},
          fonts: {},
          spacing: {},
          breakpoints: {}
        },
        conversationHistory: input.conversationHistory || {
          messages: [],
          currentContext: '',
          lastIntent: '',
          lastAction: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userPreferences: input.userPreferences || {
          language: 'th',
          theme: 'light',
          autoSave: true,
          notifications: true,
          customSettings: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    });

    return this.mapProjectContext(projectContext);
  }

  static async getProjectContext(projectId: string): Promise<ProjectContextData | null> {
    const projectContext = await prisma.projectContext.findUnique({
      where: { projectId }
    });

    return projectContext ? this.mapProjectContext(projectContext) : null;
  }

  static async updateProjectContext(input: UpdateProjectContextInput): Promise<ProjectContextData> {
    const projectContext = await prisma.projectContext.update({
      where: { projectId: input.projectId },
      data: {
        ...input.updates,
        lastModified: new Date()
      }
    });

    return this.mapProjectContext(projectContext);
  }

  static async deleteProjectContext(projectId: string): Promise<void> {
    await prisma.projectContext.delete({
      where: { projectId }
    });
  }

  // ============================
  // Component State Management
  // ============================

  static async addComponent(input: CreateComponentStateInput): Promise<ComponentStateData> {
    // หา project context
    const projectContext = await this.getProjectContext(input.projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    // สร้าง component state
    const componentState: ComponentStateData = {
      id: this.generateId(),
      componentId: input.componentId,
      name: input.name,
      type: input.type,
      location: input.location,
      props: input.props || {},
      styling: input.styling || {
        colors: {},
        fonts: {},
        spacing: {},
        borders: {},
        shadows: {}
      },
      metadata: input.metadata || {
        version: '1.0.0',
        lastModified: new Date(),
        createdBy: 'system',
        tags: [],
        description: `Component ${input.name} of type ${input.type}`
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // อัปเดต project context
    const updatedComponents = [...projectContext.components, componentState];
    await this.updateProjectContext({
      projectId: input.projectId,
      updates: {
        components: updatedComponents
      }
    });

    return componentState;
  }

  static async updateComponent(input: UpdateComponentStateInput): Promise<ComponentStateData> {
    const projectContext = await this.getProjectContext(input.projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const componentIndex = projectContext.components.findIndex(
      c => c.componentId === input.componentId
    );

    if (componentIndex === -1) {
      throw new Error('Component not found');
    }

    const updatedComponent = {
      ...projectContext.components[componentIndex],
      ...input.updates,
      updatedAt: new Date()
    };

    const updatedComponents = [...projectContext.components];
    updatedComponents[componentIndex] = updatedComponent;

    await this.updateProjectContext({
      projectId: input.projectId,
      updates: {
        components: updatedComponents
      }
    });

    return updatedComponent;
  }

  static async removeComponent(projectId: string, componentId: string): Promise<void> {
    const projectContext = await this.getProjectContext(projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const updatedComponents = projectContext.components.filter(
      c => c.componentId !== componentId
    );

    await this.updateProjectContext({
      projectId,
      updates: {
        components: updatedComponents
      }
    });
  }

  static async getComponents(query: ComponentStateQuery): Promise<ComponentStateData[]> {
    const projectContext = await this.getProjectContext(query.projectId!);
    if (!projectContext) {
      return [];
    }

    let components = projectContext.components;

    if (query.componentId) {
      components = components.filter(c => c.componentId === query.componentId);
    }

    if (query.type) {
      components = components.filter(c => c.type === query.type);
    }

    if (query.page) {
      components = components.filter(c => c.location.page === query.page);
    }

    return components;
  }

  // ============================
  // Page State Management
  // ============================

  static async addPage(input: CreatePageStateInput): Promise<PageStateData> {
    const projectContext = await this.getProjectContext(input.projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const pageState: PageStateData = {
      id: this.generateId(),
      pageId: input.pageId,
      name: input.name,
      path: input.path,
      type: input.type,
      components: input.components || [],
      layout: input.layout || {
        type: 'grid',
        columns: 1,
        gap: '1rem'
      },
      metadata: input.metadata || {
        title: input.name,
        lastModified: new Date(),
        createdBy: 'system'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedPages = [...projectContext.pages, pageState];
    await this.updateProjectContext({
      projectId: input.projectId,
      updates: {
        pages: updatedPages
      }
    });

    return pageState;
  }

  static async updatePage(input: UpdatePageStateInput): Promise<PageStateData> {
    const projectContext = await this.getProjectContext(input.projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const pageIndex = projectContext.pages.findIndex(
      p => p.pageId === input.pageId
    );

    if (pageIndex === -1) {
      throw new Error('Page not found');
    }

    const updatedPage = {
      ...projectContext.pages[pageIndex],
      ...input.updates,
      updatedAt: new Date()
    };

    const updatedPages = [...projectContext.pages];
    updatedPages[pageIndex] = updatedPage;

    await this.updateProjectContext({
      projectId: input.projectId,
      updates: {
        pages: updatedPages
      }
    });

    return updatedPage;
  }

  static async removePage(projectId: string, pageId: string): Promise<void> {
    const projectContext = await this.getProjectContext(projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const updatedPages = projectContext.pages.filter(p => p.pageId !== pageId);
    await this.updateProjectContext({
      projectId,
      updates: {
        pages: updatedPages
      }
    });
  }

  static async getPages(query: PageStateQuery): Promise<PageStateData[]> {
    const projectContext = await this.getProjectContext(query.projectId!);
    if (!projectContext) {
      return [];
    }

    let pages = projectContext.pages;

    if (query.pageId) {
      pages = pages.filter(p => p.pageId === query.pageId);
    }

    if (query.type) {
      pages = pages.filter(p => p.type === query.type);
    }

    if (query.path) {
      pages = pages.filter(p => p.path === query.path);
    }

    return pages;
  }

  // ============================
  // Styling State Management
  // ============================

  static async updateStyling(input: UpdateStylingStateInput): Promise<StylingStateData> {
    const projectContext = await this.getProjectContext(input.projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const updatedStyling = {
      ...projectContext.styling,
      ...input.updates,
      updatedAt: new Date()
    };

    await this.updateProjectContext({
      projectId: input.projectId,
      updates: {
        styling: updatedStyling
      }
    });

    return updatedStyling;
  }

  static async getStyling(projectId: string): Promise<StylingStateData | null> {
    const projectContext = await this.getProjectContext(projectId);
    return projectContext?.styling || null;
  }

  // ============================
  // Conversation History Management
  // ============================

  static async addMessage(
    projectId: string,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const projectContext = await this.getProjectContext(projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const newMessage = {
      id: this.generateId(),
      role: message.role,
      content: message.content,
      timestamp: new Date(),
      metadata: message.metadata
    };

    const updatedHistory = {
      ...projectContext.conversationHistory,
      messages: [...projectContext.conversationHistory.messages, newMessage],
      updatedAt: new Date()
    };

    await this.updateProjectContext({
      projectId,
      updates: {
        conversationHistory: updatedHistory
      }
    });
  }

  static async updateConversationContext(
    projectId: string,
    context: string,
    intent?: string,
    action?: string
  ): Promise<void> {
    const projectContext = await this.getProjectContext(projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const updatedHistory = {
      ...projectContext.conversationHistory,
      currentContext: context,
      lastIntent: intent || projectContext.conversationHistory.lastIntent,
      lastAction: action || projectContext.conversationHistory.lastAction,
      updatedAt: new Date()
    };

    await this.updateProjectContext({
      projectId,
      updates: {
        conversationHistory: updatedHistory
      }
    });
  }

  // ============================
  // User Preferences Management
  // ============================

  static async updateUserPreferences(
    projectId: string,
    updates: UpdateUserPreferencesInput['updates']
  ): Promise<UserPreferencesData> {
    const projectContext = await this.getProjectContext(projectId);
    if (!projectContext) {
      throw new Error('Project context not found');
    }

    const updatedPreferences = {
      ...projectContext.userPreferences,
      ...updates,
      updatedAt: new Date()
    };

    await this.updateProjectContext({
      projectId,
      updates: {
        userPreferences: updatedPreferences
      }
    });

    return updatedPreferences;
  }

  // ============================
  // Helper Methods
  // ============================

  private static mapProjectContext(projectContext: any): ProjectContextData {
    return {
      id: projectContext.id,
      projectId: projectContext.projectId,
      specBundleId: projectContext.specBundleId,
      projectType: projectContext.projectType,
      status: projectContext.status,
      components: projectContext.components,
      pages: projectContext.pages,
      styling: projectContext.styling,
      conversationHistory: projectContext.conversationHistory,
      userPreferences: projectContext.userPreferences,
      lastModified: projectContext.lastModified,
      createdAt: projectContext.createdAt
    };
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
