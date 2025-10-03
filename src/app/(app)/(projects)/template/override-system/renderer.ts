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
        validationResults
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
    
    console.log(`Rendering block '${block.id}':`, {
      placeholders: Object.keys(block.placeholders),
      userDataKeys: Object.keys(userData),
      userData: userData
    });
    
    let template = block.template;
    const appliedOverrides: string[] = [];

    // Apply user data to placeholders
    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      // Skip special placeholders that are handled by applySpecialPlaceholders
      if (placeholder === 'menuItems' || placeholder === 'features' || placeholder === 'stats' || placeholder === 'socialLinks' || placeholder === 'quickLinks') {
        console.log(`Skipping special placeholder '${placeholder}' - will be handled by applySpecialPlaceholders`);
        continue;
      }

      const value = this.getUserDataValue(placeholder, userData, config);
      console.log(`Processing placeholder '${placeholder}':`, {
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : value,
        required: config.required,
        config: {
          type: config.type,
          required: config.required,
          description: config.description
        }
      });
      
      if (value !== undefined) {
        const escapedValue = this.escapeHtml(String(value));
        template = template.replace(
          new RegExp(`\\{${placeholder}\\}`, 'g'),
          escapedValue
        );
        appliedOverrides.push(`placeholder-${placeholder}`);
        console.log(`Applied placeholder '${placeholder}':`, escapedValue);
      } else if (config.required) {
        // Use fallback value for required fields
        const fallbackValue = this.getFallbackValue(placeholder, config);
        const escapedValue = this.escapeHtml(String(fallbackValue));
        template = template.replace(
          new RegExp(`\\{${placeholder}\\}`, 'g'),
          escapedValue
        );
        appliedOverrides.push(`fallback-${placeholder}`);
        console.log(`Applied fallback for '${placeholder}':`, escapedValue);
      } else {
        console.log(`Skipping optional placeholder '${placeholder}'`);
      }
    }

    // Apply special placeholders first
    template = this.applySpecialPlaceholders(template, userData);

    // Apply global settings (including color placeholders)
    template = this.applyGlobalSettings(template, userData.global);

    this.addProcessingStep(`renderBlock-${block.id}`, stepStart, true);
    return template;
  }

  /**
   * ใช้ Global Settings
   */
  private applyGlobalSettings(template: string, globalData: any): string {
    if (!globalData) return template;

    let result = template;
    console.log('Applying global settings:', globalData);

    // Convert Thai color names to English
    const thaiColorMap: Record<string, string> = {
      'ฟ้า': 'blue',
      'น้ำเงิน': 'blue',
      'เขียว': 'green',
      'เขียวอ่อน': 'green',
      'ม่วง': 'purple',
      'ม่วงอ่อน': 'purple',
      'ชมพู': 'pink',
      'โรส': 'pink',
      'ส้ม': 'orange',
      'ส้มอ่อน': 'orange',
      'แดง': 'red',
      'แดงเข้ม': 'red',
      'เหลือง': 'yellow',
      'เหลืองอ่อน': 'yellow',
      'คราม': 'indigo',
      'ครามอ่อน': 'indigo'
    };

    // Apply palette colors
    if (globalData.palette) {
      let { primary, secondary, bgTone } = globalData.palette;
      
      // Convert Thai colors to English
      if (primary && thaiColorMap[primary]) {
        primary = thaiColorMap[primary];
      }
      if (secondary && thaiColorMap[secondary]) {
        secondary = thaiColorMap[secondary];
      }
      
      console.log('Color palette:', { primary, secondary, bgTone });
      
      if (primary) {
        const beforeReplace = result.match(/\{primary\}/g);
        result = result.replace(/\{primary\}/g, primary);
        console.log(`Replaced {primary} (${beforeReplace?.length || 0} times) with:`, primary);
      }
      if (secondary) {
        const beforeReplace = result.match(/\{secondary\}/g);
        result = result.replace(/\{secondary\}/g, secondary);
        result = result.replace(/\{accentColor\}/g, secondary); // Support both placeholders
        console.log(`Replaced {secondary} (${beforeReplace?.length || 0} times) with:`, secondary);
      }
      if (bgTone) {
        const beforeReplace = result.match(/\{bgTone\}/g);
        result = result.replace(/\{bgTone\}/g, bgTone);
        console.log(`Replaced {bgTone} (${beforeReplace?.length || 0} times) with:`, bgTone);
      }
    }

    // Apply tokens
    if (globalData.tokens) {
      const { radius, spacing } = globalData.tokens;
      
      if (radius) {
        result = result.replace(/\{radius\}/g, radius);
      }
      if (spacing) {
        result = result.replace(/\{spacing\}/g, spacing);
      }
    }

    return result;
  }

  /**
   * Apply special placeholders that need custom handling
   */
  private applySpecialPlaceholders(template: string, userData: Record<string, any>): string {
    let result = template;

    // Handle menuItems specially
    if (template.includes('{menuItems}')) {
      const menuItems = this.generateMenuItems(userData);
      result = result.replace(/\{menuItems\}/g, menuItems);
    }

    // Handle features array
    if (template.includes('{features}')) {
      const features = this.generateFeatures(userData);
      result = result.replace(/\{features\}/g, features);
    }

    // Handle stats array
    if (template.includes('{stats}')) {
      const stats = this.generateStats(userData);
      result = result.replace(/\{stats\}/g, stats);
    }

    // Handle socialLinks array
    if (template.includes('{socialLinks}')) {
      const socialLinks = this.generateSocialLinks(userData);
      result = result.replace(/\{socialLinks\}/g, socialLinks);
    }

    // Handle quickLinks array
    if (template.includes('{quickLinks}')) {
      const quickLinks = this.generateQuickLinks(userData);
      result = result.replace(/\{quickLinks\}/g, quickLinks);
    }

    return result;
  }

  /**
   * Generate menu items HTML
   */
  private generateMenuItems(userData: Record<string, any>): string {
    // Try to get menu items from userData
    let menuItems = userData.Navbar?.menuItems || userData.menuItems;
    
    if (!menuItems || !Array.isArray(menuItems)) {
      // Use fallback menu items based on business category
      menuItems = [
        { label: 'หน้าแรก', href: '/' },
        { label: 'เกี่ยวกับเรา', href: '/about' },
        { label: 'ติดต่อ', href: '/contact' }
      ];
    }

    return menuItems.map((item: any) => 
      `<li><a className="text-{primary}-700 hover:text-{primary}-900" href="${this.escapeHtml(item.href || '#')}">${this.escapeHtml(item.label || 'Menu Item')}</a></li>`
    ).join('\n                ');
  }

  /**
   * Generate features HTML
   */
  private generateFeatures(userData: Record<string, any>): string {
    const features = userData['About-basic']?.features || [];
    
    if (!Array.isArray(features) || features.length === 0) {
      return '';
    }

    return features.map((feature: any) => 
      `<div className="text-center">
        <div className="w-16 h-16 bg-{primary}-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-{primary}-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-{primary}-900 mb-2">${this.escapeHtml(feature.title || 'Feature')}</h3>
        <p className="text-{primary}-700">${this.escapeHtml(feature.description || 'Description')}</p>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate stats HTML
   */
  private generateStats(userData: Record<string, any>): string {
    const stats = userData['About-basic']?.stats || [];
    
    if (!Array.isArray(stats) || stats.length === 0) {
      return '';
    }

    return stats.map((stat: any) => 
      `<div className="text-center">
        <div className="text-3xl font-bold text-{primary}-600 mb-2">${this.escapeHtml(stat.number || '0')}</div>
        <div className="text-{primary}-700">${this.escapeHtml(stat.label || 'Label')}</div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate social links HTML
   */
  private generateSocialLinks(userData: Record<string, any>): string {
    const socialLinks = userData.Footer?.socialLinks || [];
    
    if (!Array.isArray(socialLinks) || socialLinks.length === 0) {
      return '';
    }

    return socialLinks.map((link: any) => 
      `<a href="${this.escapeHtml(link.url || '#')}" className="text-{primary}-300 hover:text-white transition-colors">
        <span className="sr-only">${this.escapeHtml(link.name || 'Social')}</span>
        <span className="text-2xl">${this.escapeHtml(link.icon || '🔗')}</span>
      </a>`
    ).join('\n              ');
  }

  /**
   * Generate quick links HTML
   */
  private generateQuickLinks(userData: Record<string, any>): string {
    const quickLinks = userData.Footer?.quickLinks || [];
    
    if (!Array.isArray(quickLinks) || quickLinks.length === 0) {
      return '';
    }

    return quickLinks.map((link: any) => 
      `<li><a href="${this.escapeHtml(link.href || '#')}" className="text-{primary}-300 hover:text-white transition-colors">${this.escapeHtml(link.label || 'Link')}</a></li>`
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
   */
  private getUserDataValue(
    placeholder: string,
    userData: Record<string, any>,
    config: any
  ): any {
    // Try to get value from user data
    let value = userData[placeholder];
    
    // If not found, try to find in block-specific data
    if (value === undefined) {
      // Try to find in Hero, Navbar, etc. based on placeholder context
      const blockData = this.findBlockData(placeholder, userData);
      console.log(`Looking for '${placeholder}' in block data:`, { 
        blockData: blockData ? Object.keys(blockData) : null, 
        found: blockData ? blockData[placeholder] : 'not found' 
      });
      if (blockData) {
        value = blockData[placeholder];
        console.log(`Found '${placeholder}':`, typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
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
   */
  private findBlockData(placeholder: string, userData: Record<string, any>): Record<string, any> | null {
    // Common placeholders for each block
    const blockMappings: Record<string, string[]> = {
      'Hero': ['badge', 'heading', 'subheading', 'ctaLabel', 'secondaryCta', 'stat1', 'stat1Label', 'stat2', 'stat2Label', 'stat3', 'stat3Label'],
      'Navbar': ['brand', 'brandFirstChar', 'ctaButton', 'menuItems'],
      'About-basic': ['title', 'description', 'features', 'stats'],
      'Contact-basic': ['title', 'subtitle', 'address', 'phone', 'email', 'businessHours'],
      'Footer': ['companyName', 'description', 'socialLinks', 'quickLinks', 'address', 'phone', 'email'],
      'Theme': ['radius', 'spacing']
    };

    for (const [blockKey, placeholders] of Object.entries(blockMappings)) {
      if (placeholders.includes(placeholder)) {
        return userData[blockKey] || null;
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
    
    return blockMap[nameWithoutExt] || nameWithoutExt.toLowerCase();
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
      error
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
