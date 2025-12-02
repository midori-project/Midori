/**
 * Export Service สำหรับสร้างไฟล์ใหม่จาก template ที่เติม slots แล้ว
 */

// TODO: Re-implement TemplateService and SlotsFiller or remove this file
// import { TemplateService } from './template-service';
// import { SlotsFiller, FillSlotsResult } from './slots-filler';

// Temporary stub interfaces
interface TemplateService {
  getFiles(templateKey: string, version: number): Promise<Array<{ path: string; content: string }>>;
}

interface FillSlotsResult {
  filledSlots: Record<string, any>;
  summary: {
    totalSlots: number;
    filledSlots: number;
    mockedSlots: number;
  };
}

export interface ExportBundleInput {
  templateKey: string;
  version: number;
  filledSlots: Record<string, any>;
  format?: 'zip' | 'json';
  includeFiles?: boolean;
  fileName?: string;
  resolveExternal?: 'mock' | 'skip' | 'empty';
}

export interface ExportBundleResult {
  url: string;
  size: number;
  checksum: string;
  contentType: string;
  manifest: {
    template: { key: string; version: number };
    generatedAt: string;
    filledSlotsCount: number;
    mock: {
      used: boolean;
      profile?: string;
      mockedKeys: string[];
    };
    constraintsHash: string;
    filesCount: number;
  };
}

export class ExportService {
  private templateService: TemplateService | null;

  constructor(templateService?: TemplateService) {
    this.templateService = templateService || null;
  }

  /**
   * สร้าง bundle ไฟล์จาก template ที่เติม slots แล้ว
   */
  async exportBundle(input: ExportBundleInput): Promise<ExportBundleResult> {
    const {
      templateKey,
      version,
      filledSlots,
      format = 'zip',
      includeFiles = true,
      fileName = 'export',
      resolveExternal = 'mock'
    } = input;

    // สร้าง manifest
    const manifest = await this.createManifest(
      templateKey,
      version,
      filledSlots,
      format,
      includeFiles
    );

    if (format === 'json') {
      return await this.exportAsJson(manifest, filledSlots, fileName);
    } else {
      return await this.exportAsZip(manifest, filledSlots, templateKey, version, fileName, resolveExternal);
    }
  }

  /**
   * สร้าง manifest.json
   */
  private async createManifest(
    templateKey: string,
    version: number,
    filledSlots: Record<string, any>,
    format: string,
    includeFiles: boolean
  ) {
    const mockedKeys = Object.keys(filledSlots).filter(key => 
      key.startsWith('external.') || 
      key.startsWith('social.') || 
      key.startsWith('contact.') && !key.startsWith('slots.')
    );

    return {
      template: { key: templateKey, version },
      generatedAt: new Date().toISOString(),
      filledSlotsCount: Object.keys(filledSlots).length,
      mock: {
        used: mockedKeys.length > 0,
        profile: mockedKeys.length > 0 ? 'th-local-basic' : undefined,
        mockedKeys
      },
      constraintsHash: `sha256:${this.generateHash(templateKey + version)}`,
      filesCount: includeFiles ? await this.getFilesCount(templateKey, version) : 0
    };
  }

  /**
   * Export เป็น JSON
   */
  private async exportAsJson(
    manifest: any,
    filledSlots: Record<string, any>,
    fileName: string
  ): Promise<ExportBundleResult> {
    const exportData = {
      manifest,
      filledSlots
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');
    
    // ในสภาพแวดล้อมจริงจะต้องบันทึกลง storage
    const url = `/exports/${fileName}-${Date.now()}.json`;
    
    return {
      url,
      size: buffer.length,
      checksum: this.generateHash(jsonString),
      contentType: 'application/json',
      manifest
    };
  }

  /**
   * Export เป็น ZIP
   */
  private async exportAsZip(
    manifest: any,
    filledSlots: Record<string, any>,
    templateKey: string,
    version: number,
    fileName: string,
    resolveExternal: string
  ): Promise<ExportBundleResult> {
    if (!this.templateService) {
      throw new Error('TemplateService is not available');
    }
    const files = await this.templateService.getFiles(templateKey, version);
    
    // ประมวลผลไฟล์แต่ละไฟล์
    const processedFiles: Array<{ path: string; content: string }> = [];
    
    for (const file of files) {
      const processedContent = await this.processFileContent(
        file.content,
        filledSlots,
        resolveExternal
      );
      
      processedFiles.push({
        path: file.path,
        content: processedContent
      });
    }

    // เพิ่ม manifest.json
    processedFiles.push({
      path: 'manifest.json',
      content: JSON.stringify(manifest, null, 2)
    });

    // สร้าง ZIP (ในสภาพแวดล้อมจริงจะต้องใช้ library เช่น jszip)
    const zipSize = this.estimateZipSize(processedFiles);
    const url = `/exports/${fileName}-${Date.now()}.zip`;
    
    return {
      url,
      size: zipSize,
      checksum: this.generateHash(JSON.stringify(processedFiles)),
      contentType: 'application/zip',
      manifest
    };
  }

  /**
   * ประมวลผลเนื้อหาไฟล์ด้วย token replacement
   */
  private async processFileContent(
    content: string,
    filledSlots: Record<string, any>,
    resolveExternal: string
  ): Promise<string> {
    let processedContent = content;

    // แทนที่ tokens ทั้งหมด {{ key }}
    const tokenRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    
    processedContent = processedContent.replace(tokenRegex, (match, key) => {
      const trimmedKey = key.trim();
      
      // ถ้า resolveExternal = "skip" และเป็น external key ให้คง token ไว้
      if (resolveExternal === 'skip' && 
          (trimmedKey.startsWith('external.') || 
           trimmedKey.startsWith('social.') || 
           trimmedKey.startsWith('contact.'))) {
        return match; // คง token เดิมไว้
      }
      
      // ค้นหาค่าใน filledSlots
      if (trimmedKey in filledSlots) {
        const value = filledSlots[trimmedKey];
        return String(value);
      }
      
      // ถ้าไม่เจอและ resolveExternal = "empty" ให้ใส่ค่าว่าง
      if (resolveExternal === 'empty') {
        return '';
      }
      
      // ถ้าไม่เจอให้ใส่ fallback value
      return `[MISSING: ${trimmedKey}]`;
    });

    // เพิ่มคอมเมนต์สำหรับ mock data (เฉพาะไฟล์ HTML/CSS)
    if (processedContent.includes('external.') || 
        processedContent.includes('social.') || 
        processedContent.includes('contact.')) {
      
      const mockKeys = Object.keys(filledSlots).filter(key => 
        key.startsWith('external.') || 
        key.startsWith('social.') || 
        key.startsWith('contact.')
      );
      
      if (mockKeys.length > 0) {
        const mockComment = `<!-- MOCK DATA: ${mockKeys.join(', ')} -->\n`;
        
        // เพิ่มคอมเมนต์ที่ต้นไฟล์ (สำหรับ HTML)
        if (processedContent.trim().startsWith('<!DOCTYPE html>') || 
            processedContent.trim().startsWith('<html')) {
          processedContent = processedContent.replace(
            /(<!DOCTYPE html[^>]*>)/i,
            `$1\n${mockComment}`
          );
        }
        // เพิ่มคอมเมนต์สำหรับ CSS
        else if (processedContent.includes('{') && processedContent.includes('}')) {
          processedContent = `/* MOCK DATA: ${mockKeys.join(', ')} */\n${processedContent}`;
        }
      }
    }

    return processedContent;
  }

  /**
   * ประเมินขนาด ZIP file
   */
  private estimateZipSize(files: Array<{ path: string; content: string }>): number {
    // ประเมินขนาด ZIP โดยประมาณ
    let totalSize = 0;
    
    files.forEach(file => {
      // ขนาดเนื้อหาไฟล์
      totalSize += Buffer.byteLength(file.content, 'utf8');
      
      // ขนาด ZIP header และ metadata (ประมาณ 50 bytes ต่อไฟล์)
      totalSize += 50;
      
      // ขนาดชื่อไฟล์
      totalSize += Buffer.byteLength(file.path, 'utf8');
    });
    
    // ZIP compression ratio (ประมาณ 70% ของขนาดต้นฉบับ)
    return Math.round(totalSize * 0.7);
  }

  /**
   * นับจำนวนไฟล์ใน template version
   */
  private async getFilesCount(templateKey: string, version: number): Promise<number> {
    if (!this.templateService) {
      return 0;
    }
    const files = await this.templateService.getFiles(templateKey, version);
    return files.length;
  }

  /**
   * สร้าง hash สำหรับ checksum
   */
  private generateHash(input: string): string {
    // ใช้ simple hash function (ในสภาพแวดล้อมจริงควรใช้ crypto.createHash)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * สร้างตัวอย่างไฟล์สำหรับการทดสอบ
   */
  async createSampleExport(
    templateKey: string = 'restaurant-basic',
    version: number = 1,
    fileName: string = 'sample-export'
  ): Promise<ExportBundleResult> {
    // สร้างข้อมูลตัวอย่าง
    const sampleSlots = {
      'slots.brand.name': 'ร้านอาหารตัวอย่าง',
      'slots.hero.title': 'ยินดีต้อนรับสู่ร้านอาหารของเรา',
      'slots.hero.cta': 'จองโต๊ะ',
      'slots.theme.primary': '#22c55e',
      'slots.contact.phone': '+66-2-123-4567',
      'slots.contact.email': 'info@example.test',
      'slots.about.description': 'บริการอาหารไทยแท้ วัตถุดิบคุณภาพสูง',
      'slots.menu.highlight': 'ข้าวผัดกุ้ง, ต้มยำกุ้ง, ผัดไทย',
      'external.domain': 'restaurant.example.test',
      'external.address': '123 สุขุมวิท, กรุงเทพฯ 10110',
      'external.openHours': 'จันทร์-อาทิตย์ 08:00-20:00'
    };

    return await this.exportBundle({
      templateKey,
      version,
      filledSlots: sampleSlots,
      format: 'zip',
      includeFiles: true,
      fileName,
      resolveExternal: 'mock'
    });
  }
}
