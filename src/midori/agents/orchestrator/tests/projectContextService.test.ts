/**
 * Project Context Service Integration Tests
 * ทดสอบการทำงานกับ database
 */

import { ProjectContextService } from '../services/projectContextService';
import { ProjectContextFactory } from '../factories/projectContextFactory';
import { ComponentType, PageType } from '@prisma/client';

// Mock Prisma
jest.mock('@/libs/prisma/prisma', () => ({
  prisma: {
    projectContext: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProjectContextService Integration', () => {
  const mockPrisma = require('@/libs/prisma/prisma').prisma;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // Project Context Management Tests
  // ============================

  describe('createProjectContext', () => {
    test('สร้าง project context พื้นฐาน', async () => {
      const input = {
        projectId: 'test-project-123',
        specBundleId: 'test-spec-456',
        projectType: 'coffee_shop' as any,
        status: 'created' as any,
        components: [],
        pages: [],
        styling: ProjectContextFactory.createStylingMetadata(),
        conversationHistory: ProjectContextFactory.createConversationHistory(),
        userPreferences: ProjectContextFactory.createUserPreferences()
      };

      const mockProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        specBundleId: 'test-spec-456',
        projectType: 'coffee_shop',
        status: 'created',
        components: [],
        pages: [],
        styling: input.styling,
        conversationHistory: input.conversationHistory,
        userPreferences: input.userPreferences,
        lastModified: new Date(),
        createdAt: new Date()
      };

      mockPrisma.projectContext.create.mockResolvedValue(mockProjectContext);

      const result = await ProjectContextService.createProjectContext(input);

      expect(mockPrisma.projectContext.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'test-project-123',
          specBundleId: 'test-spec-456',
          projectType: 'coffee_shop',
          status: 'created'
        })
      });

      expect(result).toEqual(expect.objectContaining({
        id: 'context-123',
        projectId: 'test-project-123',
        projectType: 'coffee_shop'
      }));
    });

    test('สร้าง project context พร้อม default values', async () => {
      const input = {
        projectId: 'test-project-456',
        specBundleId: 'test-spec-789',
        projectType: 'restaurant' as any
      };

      const mockProjectContext = {
        id: 'context-456',
        projectId: 'test-project-456',
        specBundleId: 'test-spec-789',
        projectType: 'restaurant',
        status: 'created',
        components: [],
        pages: [],
        styling: {
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
        conversationHistory: {
          messages: [],
          currentContext: '',
          lastIntent: '',
          lastAction: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userPreferences: {
          language: 'th',
          theme: 'light',
          autoSave: true,
          notifications: true,
          customSettings: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        lastModified: new Date(),
        createdAt: new Date()
      };

      mockPrisma.projectContext.create.mockResolvedValue(mockProjectContext);

      const result = await ProjectContextService.createProjectContext(input);

      expect(result).toEqual(expect.objectContaining({
        projectId: 'test-project-456',
        projectType: 'restaurant',
        status: 'created'
      }));
    });
  });

  describe('getProjectContext', () => {
    test('ดึง project context ที่มีอยู่', async () => {
      const mockProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        specBundleId: 'test-spec-456',
        projectType: 'coffee_shop',
        status: 'created',
        components: [],
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      mockPrisma.projectContext.findUnique.mockResolvedValue(mockProjectContext);

      const result = await ProjectContextService.getProjectContext('test-project-123');

      expect(mockPrisma.projectContext.findUnique).toHaveBeenCalledWith({
        where: { projectId: 'test-project-123' }
      });

      expect(result).toEqual(expect.objectContaining({
        id: 'context-123',
        projectId: 'test-project-123'
      }));
    });

    test('ดึง project context ที่ไม่มีอยู่', async () => {
      mockPrisma.projectContext.findUnique.mockResolvedValue(null);

      const result = await ProjectContextService.getProjectContext('non-existent-project');

      expect(result).toBeNull();
    });
  });

  describe('updateProjectContext', () => {
    test('อัปเดต project context', async () => {
      const input = {
        projectId: 'test-project-123',
        updates: {
          status: 'in_progress' as any,
          components: [
            {
              id: 'comp-1',
              componentId: 'button-1',
              name: 'Test Button',
              type: ComponentType.button,
              location: { page: 'home', section: 'main', position: 0 },
              props: { text: 'Click me' },
              styling: {},
              metadata: {},
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        }
      };

      const mockUpdatedProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        specBundleId: 'test-spec-456',
        projectType: 'coffee_shop',
        status: 'in_progress',
        components: input.updates.components,
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      mockPrisma.projectContext.update.mockResolvedValue(mockUpdatedProjectContext);

      const result = await ProjectContextService.updateProjectContext(input);

      expect(mockPrisma.projectContext.update).toHaveBeenCalledWith({
        where: { projectId: 'test-project-123' },
        data: {
          status: 'in_progress',
          components: input.updates.components,
          lastModified: expect.any(Date)
        }
      });

      expect(result.status).toBe('in_progress');
      expect(result.components).toHaveLength(1);
    });
  });

  // ============================
  // Component Management Tests
  // ============================

  describe('addComponent', () => {
    test('เพิ่ม component ใหม่', async () => {
      const input = {
        projectId: 'test-project-123',
        componentId: 'button-1',
        name: 'Test Button',
        type: ComponentType.button,
        location: { page: 'home', section: 'main', position: 0 },
        props: { text: 'Click me', variant: 'primary' },
        styling: { colors: { primary: '#3B82F6' } },
        metadata: { version: '1.0.0', createdBy: 'test' }
      };

      const mockExistingProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        components: [],
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      const mockUpdatedProjectContext = {
        ...mockExistingProjectContext,
        components: [
          {
            id: 'comp-1',
            componentId: 'button-1',
            name: 'Test Button',
            type: ComponentType.button,
            location: input.location,
            props: input.props,
            styling: input.styling,
            metadata: input.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      // Mock getProjectContext
      mockPrisma.projectContext.findUnique.mockResolvedValue(mockExistingProjectContext);
      mockPrisma.projectContext.update.mockResolvedValue(mockUpdatedProjectContext);

      const result = await ProjectContextService.addComponent(input);

      expect(result).toEqual(expect.objectContaining({
        componentId: 'button-1',
        name: 'Test Button',
        type: ComponentType.button
      }));
    });

    test('เพิ่ม component ใน project ที่ไม่มีอยู่', async () => {
      const input = {
        projectId: 'non-existent-project',
        componentId: 'button-1',
        name: 'Test Button',
        type: ComponentType.button,
        location: { page: 'home', section: 'main', position: 0 }
      };

      mockPrisma.projectContext.findUnique.mockResolvedValue(null);

      await expect(ProjectContextService.addComponent(input))
        .rejects
        .toThrow('Project context not found');
    });
  });

  // ============================
  // Page Management Tests
  // ============================

  describe('addPage', () => {
    test('เพิ่ม page ใหม่', async () => {
      const input = {
        projectId: 'test-project-123',
        pageId: 'home-page-1',
        name: 'Home Page',
        path: '/',
        type: PageType.home,
        components: [],
        layout: { type: 'grid', columns: 1 },
        metadata: { title: 'Home Page', createdBy: 'test' }
      };

      const mockExistingProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        components: [],
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      const mockUpdatedProjectContext = {
        ...mockExistingProjectContext,
        pages: [
          {
            id: 'page-1',
            pageId: 'home-page-1',
            name: 'Home Page',
            path: '/',
            type: PageType.home,
            components: [],
            layout: input.layout,
            metadata: input.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      mockPrisma.projectContext.findUnique.mockResolvedValue(mockExistingProjectContext);
      mockPrisma.projectContext.update.mockResolvedValue(mockUpdatedProjectContext);

      const result = await ProjectContextService.addPage(input);

      expect(result).toEqual(expect.objectContaining({
        pageId: 'home-page-1',
        name: 'Home Page',
        path: '/',
        type: PageType.home
      }));
    });
  });

  // ============================
  // Styling Management Tests
  // ============================

  describe('updateStyling', () => {
    test('อัปเดต styling', async () => {
      const input = {
        projectId: 'test-project-123',
        updates: {
          theme: { name: 'dark', primary: '#000000' },
          colors: { primary: { '500': '#000000' } }
        }
      };

      const mockExistingProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        components: [],
        pages: [],
        styling: {
          theme: { name: 'default', primary: '#3B82F6' },
          colors: {},
          fonts: {},
          spacing: {},
          breakpoints: {}
        },
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      const mockUpdatedProjectContext = {
        ...mockExistingProjectContext,
        styling: {
          ...mockExistingProjectContext.styling,
          theme: { name: 'dark', primary: '#000000' },
          colors: { primary: { '500': '#000000' } },
          updatedAt: new Date()
        }
      };

      mockPrisma.projectContext.findUnique.mockResolvedValue(mockExistingProjectContext);
      mockPrisma.projectContext.update.mockResolvedValue(mockUpdatedProjectContext);

      const result = await ProjectContextService.updateStyling(input);

      expect(result.theme.name).toBe('dark');
      expect(result.theme.primary).toBe('#000000');
      expect(result.colors.primary['500']).toBe('#000000');
    });
  });

  // ============================
  // Conversation Management Tests
  // ============================

  describe('addMessage', () => {
    test('เพิ่ม message ใหม่', async () => {
      const projectId = 'test-project-123';
      const message = {
        role: 'user' as const,
        content: 'สร้างเว็ปร้านกาแฟ',
        metadata: { timestamp: new Date() }
      };

      const mockExistingProjectContext = {
        id: 'context-123',
        projectId: 'test-project-123',
        components: [],
        pages: [],
        styling: {},
        conversationHistory: {
          messages: [],
          currentContext: '',
          lastIntent: '',
          lastAction: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      const mockUpdatedProjectContext = {
        ...mockExistingProjectContext,
        conversationHistory: {
          ...mockExistingProjectContext.conversationHistory,
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'สร้างเว็ปร้านกาแฟ',
              timestamp: new Date(),
              metadata: { timestamp: new Date() }
            }
          ],
          updatedAt: new Date()
        }
      };

      mockPrisma.projectContext.findUnique.mockResolvedValue(mockExistingProjectContext);
      mockPrisma.projectContext.update.mockResolvedValue(mockUpdatedProjectContext);

      await ProjectContextService.addMessage(projectId, message);

      expect(mockPrisma.projectContext.update).toHaveBeenCalledWith({
        projectId: 'test-project-123',
        updates: {
          conversationHistory: expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                role: 'user',
                content: 'สร้างเว็ปร้านกาแฟ'
              })
            ])
          })
        }
      });
    });
  });
});
