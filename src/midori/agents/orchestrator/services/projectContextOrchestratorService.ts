/**
 * Project Context Orchestrator Service
 * เชื่อมต่อ Project Context กับ Orchestrator AI
 */

import { ProjectContextService } from './projectContextService';
import { ProjectContextFactory } from '../factories/projectContextFactory';
import { ProjectType, ProjectStatus, ComponentType, PageType } from '@prisma/client';
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
  UpdateStylingStateInput
} from '../types/projectContext';

export class ProjectContextOrchestratorService {
  // ============================
  // Project Context Management
  // ============================

  static async initializeProject(
    projectId: string,
    specBundleId: string,
    projectType: ProjectType,
    name: string,
    userInput?: string
  ): Promise<ProjectContextData> {
    // สร้าง default components
    const defaultComponents = await this.createDefaultComponents(projectId, projectType);
    
    // สร้าง default pages
    const defaultPages = await this.createDefaultPages(projectId, projectType);
    
    // สร้าง default styling
    const defaultStyling = await this.createDefaultStyling(projectId, projectType);
    
    // สร้าง conversation history
    const conversationHistory = ProjectContextFactory.createConversationHistory({
      currentContext: `สร้างเว็บไซต์${name}`,
      lastIntent: 'create_website',
      lastAction: 'initialize_project'
    });
    
    // สร้าง user preferences
    const userPreferences = ProjectContextFactory.createUserPreferences({
      language: 'th',
      theme: 'light'
    });

    // สร้าง project context
    const projectContext = await ProjectContextService.createProjectContext({
      projectId,
      specBundleId,
      projectType,
      status: 'created',
      components: defaultComponents,
      pages: defaultPages,
      styling: defaultStyling,
      conversationHistory,
      userPreferences
    });

    return projectContext;
  }

  static async getProjectContext(projectId: string): Promise<ProjectContextData | null> {
    return await ProjectContextService.getProjectContext(projectId);
  }

  static async updateProjectContext(
    projectId: string,
    updates: UpdateProjectContextInput['updates']
  ): Promise<ProjectContextData> {
    return await ProjectContextService.updateProjectContext({
      projectId,
      updates
    });
  }

  // ============================
  // Component Management
  // ============================

  static async addComponent(
    projectId: string,
    componentType: ComponentType,
    name: string,
    page: string,
    section: string = 'main',
    position: number = 0,
    customProps?: Record<string, any>
  ): Promise<ComponentStateData> {
    const componentId = this.generateComponentId(componentType, name);
    
    // สร้าง component location
    const location = ProjectContextFactory.createComponentLocation(page, section, position);
    
    // สร้าง component styling
    const styling = ProjectContextFactory.createComponentStyling(componentType);
    
    // สร้าง component props
    const props = {
      ...ProjectContextFactory.createDefaultComponentProps(componentType),
      ...customProps
    };

    // สร้าง component metadata
    const metadata = ProjectContextFactory.createComponentMetadata(componentType, {
      description: `Component ${name} of type ${componentType}`
    });

    // สร้าง component state
    const componentState = await ProjectContextService.addComponent({
      projectId,
      componentId,
      name,
      type: componentType,
      location,
      styling,
      props,
      metadata
    });

    return componentState;
  }

  static async updateComponent(
    projectId: string,
    componentId: string,
    updates: UpdateComponentStateInput['updates']
  ): Promise<ComponentStateData> {
    return await ProjectContextService.updateComponent({
      projectId,
      componentId,
      updates
    });
  }

  static async removeComponent(
    projectId: string,
    componentId: string
  ): Promise<void> {
    await ProjectContextService.removeComponent(projectId, componentId);
  }

  static async getProjectComponents(projectId: string): Promise<ComponentStateData[]> {
    return await ProjectContextService.getComponents({ projectId });
  }

  // ============================
  // Page Management
  // ============================

  static async addPage(
    projectId: string,
    pageType: PageType,
    name: string,
    path: string,
    customLayout?: Partial<any>
  ): Promise<PageStateData> {
    const pageId = this.generatePageId(pageType, name);
    
    // สร้าง page layout
    const layout = ProjectContextFactory.createLayoutConfig('grid', customLayout);
    
    // สร้าง page metadata
    const metadata = ProjectContextFactory.createPageMetadata(pageType, name);

    // สร้าง page state
    const pageState = await ProjectContextService.addPage({
      projectId,
      pageId,
      name,
      path,
      type: pageType,
      layout,
      metadata
    });

    return pageState;
  }

  static async updatePage(
    projectId: string,
    pageId: string,
    updates: UpdatePageStateInput['updates']
  ): Promise<PageStateData> {
    return await ProjectContextService.updatePage({
      projectId,
      pageId,
      updates
    });
  }

  static async removePage(
    projectId: string,
    pageId: string
  ): Promise<void> {
    await ProjectContextService.removePage(projectId, pageId);
  }

  static async getProjectPages(projectId: string): Promise<PageStateData[]> {
    return await ProjectContextService.getPages({ projectId });
  }

  // ============================
  // Styling Management
  // ============================

  static async updateStyling(
    projectId: string,
    updates: UpdateStylingStateInput['updates']
  ): Promise<StylingStateData> {
    return await ProjectContextService.updateStyling({
      projectId,
      updates
    });
  }

  static async getProjectStyling(projectId: string): Promise<StylingStateData | null> {
    return await ProjectContextService.getStyling(projectId);
  }

  // ============================
  // Conversation Management
  // ============================

  static async addMessage(
    projectId: string,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await ProjectContextService.addMessage(projectId, message);
  }

  static async updateConversationContext(
    projectId: string,
    context: string,
    intent?: string,
    action?: string
  ): Promise<void> {
    await ProjectContextService.updateConversationContext(projectId, context, intent, action);
  }

  // ============================
  // User Preferences Management
  // ============================

  static async updateUserPreferences(
    projectId: string,
    updates: {
      language?: string;
      theme?: string;
      autoSave?: boolean;
      notifications?: boolean;
      customSettings?: Record<string, any>;
    }
  ): Promise<UserPreferencesData> {
    return await ProjectContextService.updateUserPreferences(projectId, updates);
  }

  // ============================
  // Helper Methods
  // ============================

  private static async createDefaultComponents(
    projectId: string,
    projectType: ProjectType
  ): Promise<ComponentStateData[]> {
    const components: ComponentStateData[] = [];
    
    // กำหนด default components ตาม project type
    const defaultComponentTypes = this.getDefaultComponentTypes(projectType);
    
    for (let i = 0; i < defaultComponentTypes.length; i++) {
      const componentType = defaultComponentTypes[i];
      const componentId = this.generateComponentId(componentType, `default_${componentType}`);
      
      const location = ProjectContextFactory.createComponentLocation('home', 'main', i);
      const styling = ProjectContextFactory.createComponentStyling(componentType);
      const props = ProjectContextFactory.createDefaultComponentProps(componentType);
      const metadata = ProjectContextFactory.createComponentMetadata(componentType);

      components.push({
        id: this.generateId(),
        componentId,
        name: `Default ${componentType}`,
        type: componentType,
        location,
        props,
        styling,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return components;
  }

  private static async createDefaultPages(
    projectId: string,
    projectType: ProjectType
  ): Promise<PageStateData[]> {
    const pages: PageStateData[] = [];
    
    // กำหนด default pages ตาม project type
    const defaultPageTypes = this.getDefaultPageTypes(projectType);
    
    for (const pageType of defaultPageTypes) {
      const pageId = this.generatePageId(pageType, `default_${pageType}`);
      const layout = ProjectContextFactory.createLayoutConfig('grid');
      const metadata = ProjectContextFactory.createPageMetadata(pageType, `Default ${pageType}`);

      pages.push({
        id: this.generateId(),
        pageId,
        name: `Default ${pageType}`,
        path: this.getDefaultPath(pageType),
        type: pageType,
        components: [],
        layout,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return pages;
  }

  private static async createDefaultStyling(
    projectId: string,
    projectType: ProjectType
  ): Promise<StylingStateData> {
    const theme = ProjectContextFactory.createThemeConfig('default');
    const colors = ProjectContextFactory.createColorPalette(theme);
    const fonts = ProjectContextFactory.createFontConfig();
    const spacing = ProjectContextFactory.createSpacingConfig();
    const breakpoints = ProjectContextFactory.createBreakpointConfig();
    const metadata = ProjectContextFactory.createStylingMetadata();

    return {
      id: this.generateId(),
      theme,
      colors,
      fonts,
      spacing,
      breakpoints,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static getDefaultComponentTypes(projectType: ProjectType): ComponentType[] {
    const componentMap = {
      [ProjectType.coffee_shop]: [ComponentType.header, ComponentType.hero, ComponentType.menu, ComponentType.footer],
      [ProjectType.restaurant]: [ComponentType.header, ComponentType.hero, ComponentType.menu, ComponentType.footer],
      [ProjectType.e_commerce]: [ComponentType.header, ComponentType.hero, ComponentType.card, ComponentType.footer],
      [ProjectType.portfolio]: [ComponentType.header, ComponentType.hero, ComponentType.card, ComponentType.footer],
      [ProjectType.blog]: [ComponentType.header, ComponentType.content, ComponentType.sidebar, ComponentType.footer],
      [ProjectType.landing_page]: [ComponentType.header, ComponentType.hero, ComponentType.card, ComponentType.footer],
      [ProjectType.business]: [ComponentType.header, ComponentType.hero, ComponentType.content, ComponentType.footer],
      [ProjectType.personal]: [ComponentType.header, ComponentType.hero, ComponentType.content, ComponentType.footer]
    };

    return componentMap[projectType] || [ComponentType.header, ComponentType.content, ComponentType.footer];
  }

  private static getDefaultPageTypes(projectType: ProjectType): PageType[] {
    const pageMap = {
      [ProjectType.coffee_shop]: [PageType.home, PageType.menu, PageType.about, PageType.contact],
      [ProjectType.restaurant]: [PageType.home, PageType.menu, PageType.about, PageType.contact],
      [ProjectType.e_commerce]: [PageType.home, PageType.products, PageType.about, PageType.contact],
      [ProjectType.portfolio]: [PageType.home, PageType.about, PageType.gallery, PageType.contact],
      [ProjectType.blog]: [PageType.home, PageType.blog, PageType.about, PageType.contact],
      [ProjectType.landing_page]: [PageType.home],
      [ProjectType.business]: [PageType.home, PageType.about, PageType.services, PageType.contact],
      [ProjectType.personal]: [PageType.home, PageType.about, PageType.gallery, PageType.contact]
    };

    return pageMap[projectType] || [PageType.home, PageType.about, PageType.contact];
  }

  private static getDefaultPath(pageType: PageType): string {
    const pathMap = {
      [PageType.home]: '/',
      [PageType.about]: '/about',
      [PageType.contact]: '/contact',
      [PageType.menu]: '/menu',
      [PageType.products]: '/products',
      [PageType.services]: '/services',
      [PageType.blog]: '/blog',
      [PageType.gallery]: '/gallery',
      [PageType.custom]: '/custom'
    };

    return pathMap[pageType] || '/';
  }

  private static generateComponentId(componentType: ComponentType, name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${componentType}_${name}_${timestamp}_${random}`.toLowerCase();
  }

  private static generatePageId(pageType: PageType, name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${pageType}_${name}_${timestamp}_${random}`.toLowerCase();
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
