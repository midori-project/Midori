// Template Renderer
// รับผิดชอบการ render templates ด้วย user data

import {
  ConcreteManifest,
  ConcreteBlock,
  RendererConfig,
  RendererResult,
  ValidationResult,
  TemplateRenderError,
  ProcessingStats,
  ProcessingStep,
  FileMapping
} from './types';
import { SchemaValidator } from './validation';

export class TemplateRenderer {
  private validator: SchemaValidator;
  private processingStats: ProcessingStats;

  constructor() {
    this.validator = new SchemaValidator();
    this.processingStats = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      steps: []
    };
  }

  /**
   * Render templates ด้วย user data
   */
  render(config: RendererConfig): RendererResult {
    const startTime = Date.now();
    this.processingStats.startTime = startTime;

    try {
      // Step 1: Validate User Data (ถ้าเปิดใช้งาน)
      let validationResults: ValidationResult | undefined;
      if (config.validationEnabled !== false) {
        validationResults = this.validateUserData(config.concreteManifest, config.userData);
        if (!validationResults.isValid) {
          throw new Error(`Validation failed: ${validationResults.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Step 2: Render Each Block
      const files: Record<string, string> = {};
      const appliedOverrides: string[] = [];

      for (const block of config.concreteManifest.blocks) {
        try {
          const renderedTemplate = this.renderBlock(block, config.userData);
          const fileName = this.getFileNameForBlock(block.id);
          files[fileName] = renderedTemplate;
          appliedOverrides.push(...block.appliedOverrides);
        } catch (error) {
          throw new TemplateRenderError(
            `Failed to render block '${block.id}': ${error instanceof Error ? error.message : String(error)}`,
            block.id,
            block.template
          );
        }
      }

      this.processingStats.endTime = Date.now();
      this.processingStats.duration = this.processingStats.endTime - this.processingStats.startTime;

      return {
        files,
        appliedOverrides: [...new Set(appliedOverrides)],
        processingTime: this.processingStats.duration,
        validationResults: validationResults || {
          isValid: true,
          errors: [],
          warnings: [],
          summary: {
            totalFields: 0,
            validFields: 0,
            errorFields: 0,
            warningFields: 0,
            successRate: 100
          }
        }
      };

    } catch (error) {
      this.processingStats.endTime = Date.now();
      this.processingStats.duration = this.processingStats.endTime - this.processingStats.startTime;
      
      throw new TemplateRenderError(
        `Failed to render templates: ${error instanceof Error ? error.message : String(error)}`,
        'unknown',
        ''
      );
    }
  }

  /**
   * Render Block เดียว
   */
  private renderBlock(block: ConcreteBlock, userData: Record<string, any>): string {
    const stepStart = Date.now();
    
    let template = block.template;
    const appliedOverrides: string[] = [];
    
    // 🎯 OPTIMIZATION 1: Build all replacements first, then apply in batch
    const replacements: Record<string, string> = {};

    // Step 1: Collect all placeholder values
    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      // Skip special placeholders that are handled by applySpecialPlaceholders
      if (['menuItems', 'features', 'stats', 'socialLinks', 'quickLinks'].includes(placeholder)) {
        continue;
      }

      const value = this.getUserDataValue(placeholder, userData, config, block.id);
      
      if (value !== undefined) {
        replacements[placeholder] = this.escapeHtml(String(value));
        appliedOverrides.push(`placeholder-${placeholder}`);
      } else if (config.required) {
        const fallbackValue = this.getFallbackValue(placeholder, config);
        replacements[placeholder] = this.escapeHtml(String(fallbackValue));
        appliedOverrides.push(`fallback-${placeholder}`);
      }
    }

    // Step 2: Apply global color settings to replacements (pre-resolve colors)
    const colorMap = this.getColorMap(userData.global);
    
    // Step 3: Apply special placeholders with pre-resolved colors
    template = this.applySpecialPlaceholders(block.id, template, userData, colorMap);

    // Step 4: Batch replace all placeholders
    template = this.batchReplace(template, {
      ...replacements,
      ...colorMap
    });

    this.addProcessingStep(`renderBlock-${block.id}`, stepStart, true);
    return template;
  }

  /**
   * 🚀 NEW: Get color map once instead of applying multiple times
   */
  private getColorMap(globalData: any): Record<string, string> {
    const colorMap: Record<string, string> = {};
    
    if (!globalData) return colorMap;

    const thaiColorMap: Record<string, string> = {
      'ฟ้า': 'blue', 'น้ำเงิน': 'blue', 'เขียว': 'green', 'เขียวอ่อน': 'green',
      'ม่วง': 'purple', 'ม่วงอ่อน': 'purple', 'ชมพู': 'pink', 'โรส': 'pink',
      'ส้ม': 'orange', 'ส้มอ่อน': 'orange', 'แดง': 'red', 'แดงเข้ม': 'red',
      'เหลือง': 'yellow', 'เหลืองอ่อน': 'yellow', 'คราม': 'indigo', 'ครามอ่อน': 'indigo'
    };

    if (globalData.palette) {
      let { primary, secondary, bgTone } = globalData.palette;
      
      if (primary) {
        colorMap['primary'] = thaiColorMap[primary] || primary;
      }
      if (secondary) {
        const resolvedSecondary = thaiColorMap[secondary] || secondary;
        colorMap['secondary'] = resolvedSecondary;
        colorMap['accentColor'] = resolvedSecondary; // Support both
      }
      if (bgTone) {
        colorMap['bgTone'] = bgTone;
      }
    }

    if (globalData.tokens) {
      if (globalData.tokens.radius) colorMap['radius'] = globalData.tokens.radius;
      if (globalData.tokens.spacing) colorMap['spacing'] = globalData.tokens.spacing;
    }

    return colorMap;
  }

  /**
   * 🚀 NEW: Batch replace all placeholders in one pass
   */
  private batchReplace(template: string, replacements: Record<string, string>): string {
    // Build a single regex that matches all placeholders
    const placeholders = Object.keys(replacements);
    if (placeholders.length === 0) return template;
    
    const regex = new RegExp(`\\{(${placeholders.join('|')})\\}`, 'g');
    
    return template.replace(regex, (match, key) => {
      return replacements[key] || match;
    });
  }

  /**
   * ใช้ Global Settings
   * @deprecated This method is now replaced by getColorMap() + batchReplace()
   * Keeping for backward compatibility only
   */
  private applyGlobalSettings(template: string, globalData: any): string {
    // No-op: All color replacements are now done by getColorMap() + batchReplace()
    return template;
  }

  /**
   * Apply special placeholders that need custom handling
   * 🚀 OPTIMIZATION 2: Pre-resolve colors before generating HTML
   */
  private applySpecialPlaceholders(currentBlockId: string, template: string, userData: Record<string, any>, colorMap: Record<string, string>): string {
    let result = template;

    // 🎯 Generate special content WITHOUT color placeholders (pre-resolved)
    const specialReplacements: Record<string, string> = {};

    if (template.includes('{menuItems}')) {
      // Use navbar-specific renderer for navbar block; product cards for menu block
      if (currentBlockId === 'navbar-basic') {
        specialReplacements['menuItems'] = this.generateNavbarMenuItems(userData, colorMap);
      } else {
        specialReplacements['menuItems'] = this.generateMenuItems(userData, colorMap);
      }
    }

    if (template.includes('{features}')) {
      specialReplacements['features'] = this.generateFeatures(userData, colorMap);
    }

    if (template.includes('{stats}')) {
      specialReplacements['stats'] = this.generateStats(userData, colorMap);
    }

    // (duplicate menuItems handler removed)

    if (template.includes('{socialLinks}')) {
      specialReplacements['socialLinks'] = this.generateSocialLinks(userData, colorMap);
    }

    if (template.includes('{quickLinks}')) {
      specialReplacements['quickLinks'] = this.generateQuickLinks(userData, colorMap);
    }

    // Batch replace all special placeholders
    for (const [key, value] of Object.entries(specialReplacements)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    return result;
  }


  /**
   * Generate features HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   */
  private generateFeatures(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const features = userData['About-basic']?.features 
      || userData['about-basic']?.features 
      || [];
    
    if (!Array.isArray(features) || features.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return features.map((feature: any) => 
      `<div className="text-center">
        <div className="w-16 h-16 bg-${primary}-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-${primary}-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-${primary}-900 mb-2">${this.escapeHtml(feature.title || 'Feature')}</h3>
        <p className="text-${primary}-700">${this.escapeHtml(feature.description || 'Description')}</p>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate stats HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   */
  private generateStats(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const stats = userData['About-basic']?.stats 
      || userData['about-basic']?.stats 
      || [];
    
    if (!Array.isArray(stats) || stats.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return stats.map((stat: any) => 
      `<div className="text-center">
        <div className="text-3xl font-bold text-${primary}-600 mb-2">${this.escapeHtml(stat.number || '0')}</div>
        <div className="text-${primary}-700">${this.escapeHtml(stat.label || 'Label')}</div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate menu items HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   */
  private generateMenuItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const menuItems = userData['Menu-basic']?.menuItems 
      || userData['menu-basic']?.menuItems 
      || [];
    
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return menuItems.map((item: any) => 
      `<div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-${primary}-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-${primary}-900 group-hover:text-${primary}-700 transition-colors">${this.escapeHtml(item.name || 'Item')}</h3>
            <div className="w-12 h-12 bg-${primary}-100 rounded-full flex items-center justify-center group-hover:bg-${primary}-200 transition-colors">
              <span className="text-${primary}-600 text-lg">${this.getCategoryIcon(userData) }</span>
            </div>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">${this.escapeHtml(item.description || 'Description')}</p>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-${primary}-600 group-hover:text-${primary}-700 transition-colors">
              ${this.escapeHtml(item.price || '0')} บาท
            </div>
            <button className="px-4 py-2 bg-${primary}-500 text-white rounded-full hover:bg-${primary}-600 font-semibold text-sm group-hover:scale-105 transform transition-all duration-300">
              เลือก
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-${primary}-400 to-${primary}-600 group-hover:from-${primary}-500 group-hover:to-${primary}-700 transition-all"></div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate navbar menu links (simple <li><a>…)</a></li>
   */
  private generateNavbarMenuItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const items = userData['Navbar']?.menuItems
      || userData['navbar-basic']?.menuItems
      || [];

    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return items.map((item: any) =>
      `<li><a className="text-${primary}-700 hover:text-${primary}-900" href="${this.escapeHtml(item.href || '#')}">${this.escapeHtml(item.label || 'Menu')}</a></li>`
    ).join('\n                ');
  }

  /**
   * Choose icon by business category (used by menu cards)
   */
  private getCategoryIcon(userData: Record<string, any>): string {
    const category = (userData?.businessCategory || userData?.category || '').toLowerCase();
    const iconMap: Record<string, string> = {
      ecommerce: '📚',
      restaurant: '🍽️',
      healthcare: '🏥',
      pharmacy: '💊',
      portfolio: '💼'
    };
    return iconMap[category] || '📚';
  }

  /**
   * Generate social links HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   */
  private generateSocialLinks(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const socialLinks = userData.Footer?.socialLinks 
      || userData['footer-basic']?.socialLinks 
      || [];
    
    if (!Array.isArray(socialLinks) || socialLinks.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return socialLinks.map((link: any) => 
      `<a href="${this.escapeHtml(link.url || '#')}" className="text-${primary}-300 hover:text-white transition-colors">
        <span className="sr-only">${this.escapeHtml(link.name || 'Social')}</span>
        <span className="text-2xl">${this.escapeHtml(link.icon || '🔗')}</span>
      </a>`
    ).join('\n              ');
  }

  /**
   * Generate quick links HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   */
  private generateQuickLinks(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const quickLinks = userData.Footer?.quickLinks 
      || userData['footer-basic']?.quickLinks 
      || [];
    
    if (!Array.isArray(quickLinks) || quickLinks.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return quickLinks.map((link: any) => 
      `<li><a href="${this.escapeHtml(link.href || '#')}" className="text-${primary}-300 hover:text-white transition-colors">${this.escapeHtml(link.label || 'Link')}</a></li>`
    ).join('\n              ');
  }

  /**
   * ตรวจสอบ User Data
   */
  private validateUserData(
    concreteManifest: ConcreteManifest,
    userData: Record<string, any>
  ): ValidationResult {
    const stepStart = Date.now();
    
    const validationResult = this.validator.validateUserData(userData, concreteManifest);
    
    this.addProcessingStep('validateUserData', stepStart, validationResult.isValid);
    return validationResult;
  }

  /**
   * ดึงค่า User Data สำหรับ placeholder
   * 🚀 OPTIMIZATION 4: Reduced logging, cache block lookups
   */
  private getUserDataValue(
    placeholder: string,
    userData: Record<string, any>,
    config: any,
    currentBlockId?: string
  ): any {
    // Try to get value from user data
    let value = userData[placeholder];
    
    // If not found, try to find in block-specific data
    if (value === undefined) {
      const blockData = this.findBlockData(placeholder, userData, currentBlockId);
      if (blockData) {
        value = blockData[placeholder];
      }
    }

    // Apply default value if not provided
    if (value === undefined && config.defaultValue !== undefined) {
      value = config.defaultValue;
    }

    // Don't throw error for required fields here - let the caller handle it
    // This allows fallback values to be used

    // Handle special placeholders that need custom processing
    if (placeholder === 'menuItems' && Array.isArray(value)) {
      // For menuItems, return the array as-is and let applySpecialPlaceholders handle it
      return value;
    }

    // Validate string length
    if (typeof value === 'string') {
      if (config.maxLength && value.length > config.maxLength) {
        value = value.substring(0, config.maxLength);
      }
      if (config.minLength && value.length < config.minLength) {
        console.warn(`Placeholder '${placeholder}' is below minimum length, using fallback`);
        return undefined; // Let fallback handle it
      }
    }

    // Validate enum values
    if (config.enum && value !== undefined && !config.enum.includes(value)) {
      console.warn(`Placeholder '${placeholder}' has invalid enum value, using fallback`);
      return undefined; // Let fallback handle it
    }

    return value;
  }

  /**
   * Find block data based on placeholder name
   * 🚀 OPTIMIZATION 5: Streamlined lookup with early returns
   */
  private findBlockData(
    placeholder: string, 
    userData: Record<string, any>,
    currentBlockId?: string
  ): Record<string, any> | null {
    // Fast path: Direct block ID match
    if (currentBlockId) {
      // Try kebab-case first (e.g., 'contact-basic')
      if (userData[currentBlockId]?.[placeholder] !== undefined) {
        return userData[currentBlockId];
      }
      
      // Try Title-case variant (e.g., 'Contact-basic')
      const titleCaseId = currentBlockId.charAt(0).toUpperCase() + currentBlockId.slice(1);
      if (userData[titleCaseId]?.[placeholder] !== undefined) {
        return userData[titleCaseId];
      }
    }

    // Fallback: Legacy lookup using block mappings
    const blockMappings: Record<string, { placeholders: string[], keys: string[] }> = {
      'hero-basic': {
        placeholders: ['badge', 'heading', 'subheading', 'ctaLabel', 'secondaryCta', 'stat1', 'stat1Label', 'stat2', 'stat2Label', 'stat3', 'stat3Label'],
        keys: ['Hero', 'hero-basic']
      },
      'navbar-basic': {
        placeholders: ['brand', 'brandFirstChar', 'ctaButton', 'menuItems'],
        keys: ['Navbar', 'navbar-basic']
      },
      'about-basic': {
        placeholders: ['title', 'description', 'features', 'stats'],
        keys: ['About-basic', 'about-basic']
      },
      'contact-basic': {
        placeholders: ['title', 'subtitle', 'address', 'phone', 'email', 'businessHours'],
        keys: ['Contact-basic', 'contact-basic']
      },
      'footer-basic': {
        placeholders: ['companyName', 'description', 'socialLinks', 'quickLinks', 'address', 'phone', 'email'],
        keys: ['Footer', 'footer-basic']
      },
      'theme-basic': {
        placeholders: ['radius', 'spacing'],
        keys: ['Theme', 'theme-basic']
      }
    };

    // Search block mappings
    for (const [blockId, mapping] of Object.entries(blockMappings)) {
      if (mapping.placeholders.includes(placeholder)) {
        // Try all possible keys for this block
        for (const key of mapping.keys) {
          if (userData[key]?.[placeholder] !== undefined) {
            return userData[key];
          }
        }
      }
    }

    return null;
  }

  /**
   * Get fallback value for required placeholders
   */
  private getFallbackValue(placeholder: string, config: any): string {
    // Use default value if available
    if (config.defaultValue !== undefined) {
      return String(config.defaultValue);
    }

    // Generate fallback based on placeholder name and type
    const fallbackMap: Record<string, string> = {
      'brand': 'Brand Name',
      'brandFirstChar': 'B',
      'ctaButton': 'Click Here',
      'heading': 'Welcome',
      'subheading': 'This is a description',
      'badge': 'New',
      'ctaLabel': 'Get Started',
      'secondaryCta': 'Learn More',
      'stat1': '100+',
      'stat1Label': 'Happy Customers',
      'stat2': '50+',
      'stat2Label': 'Projects',
      'stat3': '24/7',
      'stat3Label': 'Support'
    };

    if (fallbackMap[placeholder]) {
      return fallbackMap[placeholder];
    }

    // Generic fallback based on type
    switch (config.type) {
      case 'string':
        return 'Default Value';
      case 'number':
        return '0';
      case 'boolean':
        return 'false';
      case 'array':
        return '[]';
      case 'object':
        return '{}';
      default:
        return 'Default';
    }
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * แปลง Block ID เป็น File Name
   */
  private getFileNameForBlock(blockId: string): string {
    const fileMap: Record<string, string> = {
      'hero-basic': 'Hero.tsx',
      'navbar-basic': 'Navbar.tsx',
      'theme-basic': 'theme.css',
      'footer-basic': 'Footer.tsx'
    };
    
    return fileMap[blockId] || `${blockId}.tsx`;
  }

  /**
   * สร้าง File Mappings
   */
  createFileMappings(files: Record<string, string>): FileMapping[] {
    const mappings: FileMapping[] = [];
    
    for (const [fileName, content] of Object.entries(files)) {
      const fileType = this.getFileType(fileName);
      const checksum = this.calculateChecksum(content);
      
      mappings.push({
        blockId: this.getBlockIdFromFileName(fileName),
        fileName,
        fileType,
        size: content.length,
        checksum
      });
    }
    
    return mappings;
  }

  /**
   * กำหนด File Type จาก File Name
   */
  private getFileType(fileName: string): 'tsx' | 'css' | 'json' | 'js' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx': return 'tsx';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'js': return 'js';
      default: return 'tsx';
    }
  }

  /**
   * คำนวณ Checksum
   */
  private calculateChecksum(content: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * แปลง File Name เป็น Block ID
   */
  private getBlockIdFromFileName(fileName: string): string {
    const nameWithoutExt = fileName.split('.')[0];
    const blockMap: Record<string, string> = {
      'Hero': 'hero-basic',
      'Navbar': 'navbar-basic',
      'theme': 'theme-basic',
      'Footer': 'footer-basic'
    };
    
    const safeName = nameWithoutExt || 'unknown';
    return blockMap[safeName] || safeName.toLowerCase();
  }

  /**
   * เพิ่ม Processing Step
   */
  private addProcessingStep(name: string, startTime: number, success: boolean, error?: string): void {
    const step: ProcessingStep = {
      name,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      success,
      error: error || ''
    };
    this.processingStats.steps.push(step);
  }

  /**
   * Get Processing Stats
   */
  getProcessingStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  /**
   * Reset Processing Stats
   */
  resetProcessingStats(): void {
    this.processingStats = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      steps: []
    };
  }

}
