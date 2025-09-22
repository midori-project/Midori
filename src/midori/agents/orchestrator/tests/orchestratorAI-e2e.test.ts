/**
 * OrchestratorAI E2E Tests
 * ทดสอบการทำงานแบบ end-to-end
 */

import { OrchestratorAI } from '../orchestratorAI';
import { ProjectContextOrchestratorService } from '../services/projectContextOrchestratorService';

// Mock dependencies
jest.mock('../services/projectContextOrchestratorService');
jest.mock('../adapters/llmAdapter');

const MockedProjectContextOrchestratorService = ProjectContextOrchestratorService as jest.Mocked<typeof ProjectContextOrchestratorService>;

describe('OrchestratorAI E2E', () => {
  let orchestrator: OrchestratorAI;

  beforeEach(() => {
    orchestrator = new OrchestratorAI();
    jest.clearAllMocks();
  });

  // ============================
  // Project Initialization Tests
  // ============================

  describe('initializeProject', () => {
    test('สร้างเว็ปร้านกาแฟสำเร็จ', async () => {
      const mockProjectContext = {
        id: 'context-123',
        projectId: 'project-123',
        specBundleId: 'spec-456',
        projectType: 'coffee_shop',
        status: 'created',
        components: [
          {
            id: 'comp-1',
            componentId: 'header_1',
            name: 'Default header',
            type: 'header',
            location: { page: 'home', section: 'main', position: 0 },
            props: { title: 'Website Title', showNavigation: true },
            styling: { colors: { background: '#FFFFFF', text: '#000000' } },
            metadata: { version: '1.0.0', createdBy: 'system' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'comp-2',
            componentId: 'hero_1',
            name: 'Default hero',
            type: 'hero',
            location: { page: 'home', section: 'main', position: 1 },
            props: { title: 'Welcome to Our Website', showButton: true },
            styling: { colors: { background: '#F3F4F6', text: '#000000' } },
            metadata: { version: '1.0.0', createdBy: 'system' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        pages: [
          {
            id: 'page-1',
            pageId: 'home_1',
            name: 'Default home',
            path: '/',
            type: 'home',
            components: ['header_1', 'hero_1'],
            layout: { type: 'grid', columns: 1 },
            metadata: { title: 'Default home', createdBy: 'system' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        styling: {
          id: 'styling-1',
          theme: { name: 'default', primary: '#3B82F6' },
          colors: { primary: { '500': '#3B82F6' } },
          fonts: { heading: { family: 'Inter' } },
          spacing: { base: 4 },
          breakpoints: { sm: '640px' },
          metadata: { version: '1.0.0' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        conversationHistory: {
          messages: [],
          currentContext: 'สร้างเว็บไซต์ร้านกาแฟ ABC',
          lastIntent: 'create_website',
          lastAction: 'initialize_project',
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

      MockedProjectContextOrchestratorService.initializeProject.mockResolvedValue(mockProjectContext);

      const result = await orchestrator.initializeProject(
        'project-123',
        'spec-456',
        'coffee_shop',
        'ร้านกาแฟ ABC',
        'สร้างเว็ปร้านกาแฟที่มีเมนูและข้อมูลติดต่อ'
      );

      expect(MockedProjectContextOrchestratorService.initializeProject).toHaveBeenCalledWith(
        'project-123',
        'spec-456',
        'coffee_shop',
        'ร้านกาแฟ ABC',
        'สร้างเว็ปร้านกาแฟที่มีเมนูและข้อมูลติดต่อ'
      );

      expect(result).toEqual(mockProjectContext);
      expect(result.projectType).toBe('coffee_shop');
      expect(result.components).toHaveLength(2);
      expect(result.pages).toHaveLength(1);
    });
  });

  // ============================
  // Component Management Tests
  // ============================

  describe('addComponent', () => {
    test('เพิ่มปุ่มสั่งซื้อในหน้า home', async () => {
      const mockComponent = {
        id: 'comp-3',
        componentId: 'button_1',
        name: 'ปุ่มสั่งซื้อ',
        type: 'button',
        location: { page: 'home', section: 'main', position: 2 },
        props: { text: 'สั่งซื้อ', variant: 'primary', size: 'medium' },
        styling: { colors: { primary: '#3B82F6', text: '#FFFFFF' } },
        metadata: { version: '1.0.0', createdBy: 'system' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedProjectContext = {
        id: 'context-123',
        projectId: 'project-123',
        components: [mockComponent],
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      MockedProjectContextOrchestratorService.addComponent.mockResolvedValue(mockComponent);
      MockedProjectContextOrchestratorService.getProjectContext.mockResolvedValue(mockUpdatedProjectContext);

      const result = await orchestrator.addComponent(
        'project-123',
        'button',
        'ปุ่มสั่งซื้อ',
        'home',
        'main',
        2,
        { text: 'สั่งซื้อ', variant: 'primary' }
      );

      expect(MockedProjectContextOrchestratorService.addComponent).toHaveBeenCalledWith(
        'project-123',
        'button',
        'ปุ่มสั่งซื้อ',
        'home',
        'main',
        2,
        { text: 'สั่งซื้อ', variant: 'primary' }
      );

      expect(result).toEqual(mockComponent);
      expect(result.name).toBe('ปุ่มสั่งซื้อ');
      expect(result.type).toBe('button');
    });
  });

  // ============================
  // Page Management Tests
  // ============================

  describe('addPage', () => {
    test('เพิ่มหน้าเมนูสำหรับร้านกาแฟ', async () => {
      const mockPage = {
        id: 'page-2',
        pageId: 'menu_1',
        name: 'Default menu',
        path: '/menu',
        type: 'menu',
        components: [],
        layout: { type: 'grid', columns: 1 },
        metadata: { title: 'Default menu', createdBy: 'system' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedProjectContext = {
        id: 'context-123',
        projectId: 'project-123',
        components: [],
        pages: [mockPage],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      MockedProjectContextOrchestratorService.addPage.mockResolvedValue(mockPage);
      MockedProjectContextOrchestratorService.getProjectContext.mockResolvedValue(mockUpdatedProjectContext);

      const result = await orchestrator.addPage(
        'project-123',
        'menu',
        'หน้าเมนู',
        '/menu'
      );

      expect(MockedProjectContextOrchestratorService.addPage).toHaveBeenCalledWith(
        'project-123',
        'menu',
        'หน้าเมนู',
        '/menu',
        undefined
      );

      expect(result).toEqual(mockPage);
      expect(result.name).toBe('Default menu');
      expect(result.path).toBe('/menu');
    });
  });

  // ============================
  // Styling Management Tests
  // ============================

  describe('updateStyling', () => {
    test('เปลี่ยนสีธีมเป็นสีน้ำเงิน', async () => {
      const mockStyling = {
        id: 'styling-1',
        theme: { name: 'blue', primary: '#1E40AF' },
        colors: { primary: { '500': '#1E40AF' } },
        fonts: { heading: { family: 'Inter' } },
        spacing: { base: 4 },
        breakpoints: { sm: '640px' },
        metadata: { version: '1.0.0' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedProjectContext = {
        id: 'context-123',
        projectId: 'project-123',
        components: [],
        pages: [],
        styling: mockStyling,
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      MockedProjectContextOrchestratorService.updateStyling.mockResolvedValue(mockStyling);
      MockedProjectContextOrchestratorService.getProjectContext.mockResolvedValue(mockUpdatedProjectContext);

      const result = await orchestrator.updateStyling(
        'project-123',
        {
          theme: { name: 'blue', primary: '#1E40AF' },
          colors: { primary: { '500': '#1E40AF' } }
        }
      );

      expect(MockedProjectContextOrchestratorService.updateStyling).toHaveBeenCalledWith(
        'project-123',
        {
          theme: { name: 'blue', primary: '#1E40AF' },
          colors: { primary: { '500': '#1E40AF' } }
        }
      );

      expect(result).toEqual(mockStyling);
      expect(result.theme.primary).toBe('#1E40AF');
    });
  });

  // ============================
  // Conversation Management Tests
  // ============================

  describe('addMessage', () => {
    test('เพิ่มข้อความใน conversation history', async () => {
      MockedProjectContextOrchestratorService.addMessage.mockResolvedValue(undefined);

      await orchestrator.addMessage('project-123', {
        role: 'user',
        content: 'แก้สีปุ่มเป็นสีแดง',
        metadata: { timestamp: new Date() }
      });

      expect(MockedProjectContextOrchestratorService.addMessage).toHaveBeenCalledWith(
        'project-123',
        {
          role: 'user',
          content: 'แก้สีปุ่มเป็นสีแดง',
          metadata: { timestamp: new Date() }
        }
      );
    });
  });

  describe('updateConversationContext', () => {
    test('อัปเดต conversation context', async () => {
      MockedProjectContextOrchestratorService.updateConversationContext.mockResolvedValue(undefined);

      await orchestrator.updateConversationContext(
        'project-123',
        'กำลังแก้ไขสีปุ่ม',
        'update_component',
        'change_button_color'
      );

      expect(MockedProjectContextOrchestratorService.updateConversationContext).toHaveBeenCalledWith(
        'project-123',
        'กำลังแก้ไขสีปุ่ม',
        'update_component',
        'change_button_color'
      );
    });
  });

  // ============================
  // Memory Cache Tests
  // ============================

  describe('getProjectContext with cache', () => {
    test('ดึง project context จาก cache', async () => {
      const mockProjectContext = {
        id: 'context-123',
        projectId: 'project-123',
        specBundleId: 'spec-456',
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

      // เก็บใน cache ก่อน
      (orchestrator as any).projectContexts.set('project-123', mockProjectContext);

      const result = await orchestrator.getProjectContext('project-123');

      expect(result).toEqual(mockProjectContext);
      // ไม่ควรเรียก database
      expect(MockedProjectContextOrchestratorService.getProjectContext).not.toHaveBeenCalled();
    });

    test('ดึง project context จาก database เมื่อไม่มีใน cache', async () => {
      const mockProjectContext = {
        id: 'context-456',
        projectId: 'project-456',
        specBundleId: 'spec-789',
        projectType: 'restaurant',
        status: 'created',
        components: [],
        pages: [],
        styling: {},
        conversationHistory: {},
        userPreferences: {},
        lastModified: new Date(),
        createdAt: new Date()
      };

      MockedProjectContextOrchestratorService.getProjectContext.mockResolvedValue(mockProjectContext);

      const result = await orchestrator.getProjectContext('project-456');

      expect(MockedProjectContextOrchestratorService.getProjectContext).toHaveBeenCalledWith('project-456');
      expect(result).toEqual(mockProjectContext);
    });
  });

  // ============================
  // Error Handling Tests
  // ============================

  describe('Error Handling', () => {
    test('จัดการ error เมื่อ project context ไม่มีอยู่', async () => {
      MockedProjectContextOrchestratorService.getProjectContext.mockResolvedValue(null);

      const result = await orchestrator.getProjectContext('non-existent-project');

      expect(result).toBeNull();
    });

    test('จัดการ error เมื่อ service ล้มเหลว', async () => {
      MockedProjectContextOrchestratorService.initializeProject.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        orchestrator.initializeProject(
          'project-123',
          'spec-456',
          'coffee_shop',
          'ร้านกาแฟ ABC'
        )
      ).rejects.toThrow('Database connection failed');
    });
  });
});
