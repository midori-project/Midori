/**
 * Template Slots Tool สำหรับ Frontend Agent
 * Tool หลักที่เชื่อมต่อ Template Service, Slots Filler และ Export Service
 */

import { TemplateService } from './template-service';
import { SlotsFiller } from './slots-filler';
import { ExportService } from './export-service';

export interface TemplateSlotsToolInput {
  action: 'list_templates' | 'get_template' | 'fill_slots' | 'export_bundle' | 'complete_flow';
  params: any;
}

export interface TemplateSlotsToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    action: string;
    timestamp: string;
    duration?: number;
  };
}

export class TemplateSlotsTool {
  private templateService: TemplateService;
  private slotsFiller: SlotsFiller;
  private exportService: ExportService;

  constructor() {
    this.templateService = new TemplateService();
    this.slotsFiller = new SlotsFiller(this.templateService);
    this.exportService = new ExportService(this.templateService);
  }

  /**
   * เรียกใช้ tool ตาม action
   */
  async execute(input: TemplateSlotsToolInput): Promise<TemplateSlotsToolResult> {
    const startTime = Date.now();
    
    try {
      let data: any;
      
      switch (input.action) {
        case 'list_templates':
          data = await this.listTemplates(input.params);
          break;
          
        case 'get_template':
          data = await this.getTemplate(input.params);
          break;
          
        case 'fill_slots':
          data = await this.fillSlots(input.params);
          break;
          
        case 'export_bundle':
          data = await this.exportBundle(input.params);
          break;
          
        case 'complete_flow':
          data = await this.completeFlow(input.params);
          break;
          
        default:
          throw new Error(`Unknown action: ${input.action}`);
      }
      
      return {
        success: true,
        data,
        metadata: {
          action: input.action,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          action: input.action,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * รายการ templates ทั้งหมด
   */
  private async listTemplates(params: {
    category?: string;
    q?: string;
    status?: string;
  }) {
    const templates = await this.templateService.getTemplates(params);
    
    return {
      templates: templates.map(template => ({
        key: template.key,
        label: template.label,
        category: template.category,
        latestVersion: Math.max(...template.versions.map(v => v.version)),
        status: template.versions.find(v => v.status === 'published')?.status || 'draft'
      })),
      total: templates.length
    };
  }

  /**
   * ข้อมูล template และ slots
   */
  private async getTemplate(params: {
    key: string;
    version?: number;
  }) {
    const { key, version } = params;
    
    // ดึงเวอร์ชันทั้งหมด
    const versions = await this.templateService.getTemplateVersions(key);
    
    if (versions.length === 0) {
      throw new Error(`Template '${key}' not found`);
    }
    
    // เลือกเวอร์ชัน
    const targetVersion = version || Math.max(...versions.map(v => v.version));
    const templateVersion = versions.find(v => v.version === targetVersion);
    
    if (!templateVersion) {
      throw new Error(`Version ${targetVersion} of template '${key}' not found`);
    }
    
    // ดึง slots schema
    const { slots, constraints } = await this.templateService.getSlots(key, targetVersion);
    
    return {
      template: {
        key,
        version: targetVersion,
        label: `Template ${key} v${targetVersion}`,
        status: templateVersion.status
      },
      slots: {
        schema: slots,
        constraints,
        totalSlots: Object.keys(slots.slots).length,
        aliases: Object.keys(slots.aliases).length
      },
      availableVersions: versions.map(v => ({
        version: v.version,
        semver: v.semver,
        status: v.status
      }))
    };
  }

  /**
   * เติม slots ด้วยระบบสุ่ม
   */
  private async fillSlots(params: {
    templateKey: string;
    version: number;
    requirements?: Record<string, any>;
    overrides?: Record<string, any>;
    strict?: boolean;
    includeMock?: boolean;
    mockProfile?: string;
  }) {
    const {
      templateKey,
      version,
      requirements = {},
      overrides = {},
      strict = false, // ใช้ false เพื่อให้ระบบสุ่มทำงานได้
      includeMock = true,
      mockProfile = 'th-local-basic'
    } = params;

    const result = await this.slotsFiller.fillSlots({
      templateKey,
      version,
      requirements,
      overrides,
      strict,
      includeMock,
      mockProfile
    });

    return {
      filledSlots: result.filledSlots,
      mockedKeys: result.mockedKeys,
      validationReport: result.validationReport,
      metadata: result.metadata,
      summary: {
        totalSlots: result.metadata.totalSlots,
        filledSlots: result.metadata.filledSlotsCount,
        mockedSlots: result.mockedKeys.length,
        requirementsProvided: Object.keys(requirements).length,
        overridesApplied: Object.keys(overrides).length
      }
    };
  }

  /**
   * สร้าง bundle ไฟล์
   */
  private async exportBundle(params: {
    templateKey: string;
    version: number;
    filledSlots: Record<string, any>;
    format?: 'zip' | 'json';
    includeFiles?: boolean;
    fileName?: string;
    resolveExternal?: 'mock' | 'skip' | 'empty';
  }) {
    const result = await this.exportService.exportBundle(params);
    
    return {
      downloadUrl: result.url,
      size: result.size,
      checksum: result.checksum,
      contentType: result.contentType,
      manifest: result.manifest,
      summary: {
        format: params.format || 'zip',
        filesIncluded: result.manifest.filesCount,
        mockDataUsed: result.manifest.mock.used,
        mockedKeys: result.manifest.mock.mockedKeys
      }
    };
  }

  /**
   * Flow ครบวงจร: เลือก template → เติม slots → export
   */
  private async completeFlow(params: {
    templateKey: string;
    version?: number;
    requirements?: Record<string, any>;
    overrides?: Record<string, any>;
    mockProfile?: string;
    exportFormat?: 'zip' | 'json';
    fileName?: string;
  }) {
    const {
      templateKey,
      version,
      requirements = {},
      overrides = {},
      mockProfile = 'th-local-basic',
      exportFormat = 'zip',
      fileName = 'complete-export'
    } = params;

    // ขั้นตอนที่ 1: ดึงข้อมูล template
    const templateInfo = await this.getTemplate({ key: templateKey, version });
    
    // ขั้นตอนที่ 2: เติม slots
    const fillResult = await this.fillSlots({
      templateKey,
      version: templateInfo.template.version,
      requirements,
      overrides,
      includeMock: true,
      mockProfile
    });
    
    // ขั้นตอนที่ 3: export bundle
    const exportResult = await this.exportBundle({
      templateKey,
      version: templateInfo.template.version,
      filledSlots: fillResult.filledSlots,
      format: exportFormat,
      includeFiles: true,
      fileName,
      resolveExternal: 'mock'
    });

    return {
      template: templateInfo.template,
      slots: templateInfo.slots,
      fillResult: {
        summary: fillResult.summary,
        mockedKeys: fillResult.mockedKeys,
        validationReport: fillResult.validationReport
      },
      exportResult: {
        downloadUrl: exportResult.downloadUrl,
        summary: exportResult.summary,
        manifest: exportResult.manifest
      },
      flowSummary: {
        templateSelected: templateInfo.template.key,
        version: templateInfo.template.version,
        slotsFilled: fillResult.summary.filledSlots,
        mockDataUsed: fillResult.mockedKeys.length,
        filesGenerated: exportResult.summary.filesIncluded,
        exportFormat,
        totalDuration: 'N/A' // จะคำนวณใน execute method
      }
    };
  }
}

// Export function สำหรับใช้ใน agent
export async function template_slots_tool(input: TemplateSlotsToolInput): Promise<TemplateSlotsToolResult> {
  const tool = new TemplateSlotsTool();
  return await tool.execute(input);
}
