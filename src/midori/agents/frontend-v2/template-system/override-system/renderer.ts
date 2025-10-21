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
// Removed UnsplashService import - now handled in ai-service.ts

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
      // Step 0: Add fallback values for variant-specific placeholders
      const enhancedUserData = this.addVariantFallbacks(config.concreteManifest, config.userData);
      
      // Step 1: Validate User Data (ถ้าเปิดใช้งาน)
      let validationResults: ValidationResult | undefined;
      if (config.validationEnabled !== false) {
        validationResults = this.validateUserData(config.concreteManifest, enhancedUserData);
        if (!validationResults.isValid) {
          // แสดง warning แทน error สำหรับ variant-specific placeholders
          const criticalErrors = validationResults.errors.filter(e => 
            !this.isVariantSpecificPlaceholder(e.field)
          );
          
          if (criticalErrors.length > 0) {
            throw new Error(`Validation failed: ${criticalErrors.map(e => e.message).join(', ')}`);
          } else {
            console.warn('⚠️ Non-critical validation warnings:', validationResults.errors.map(e => e.message).join(', '));
          }
        }
      }

      // Step 2: Render Each Block
      const files: Record<string, string> = {};
      const appliedOverrides: string[] = [];

      for (const block of config.concreteManifest.blocks) {
        try {
          const renderedTemplate = this.renderBlock(block, enhancedUserData);
          const fileName = this.getFileNameForBlock(block.id);
          files[fileName] = renderedTemplate;
          appliedOverrides.push(...block.appliedOverrides);
        } catch (error) {
          console.error(`❌ Failed to render block '${block.id}':`, error);
          // Continue with other blocks instead of throwing
          const fileName = this.getFileNameForBlock(block.id);
          files[fileName] = `// Error rendering block '${block.id}': ${error instanceof Error ? error.message : String(error)}`;
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
      
      console.error('❌ Template rendering error:', error);
      
      // Return empty result instead of throwing to prevent crashes
      return {
        files: {},
        appliedOverrides: [],
        processingTime: this.processingStats.duration,
        validationResults: {
          isValid: false,
          errors: [{
            field: 'renderer',
            message: `Rendering failed: ${error instanceof Error ? error.message : String(error)}`,
            code: 'RENDER_ERROR',
            severity: 'error'
          }],
          warnings: [],
          summary: {
            totalFields: 0,
            validFields: 0,
            errorFields: 1,
            warningFields: 0,
            successRate: 0
          }
        }
      };
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

    // Step 1: Collect all placeholder values (🎨 WITH data attributes for visual editing!)
    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      // Skip special placeholders that are handled by applySpecialPlaceholders
      if (['menuItems', 'features', 'stats', 'socialLinks', 'quickLinks'].includes(placeholder)) {
        continue;
      }

      const value = this.getUserDataValue(placeholder, userData, config, block.id);
      
      if (value !== undefined) {
        // 🎨 VISUAL EDIT: Check if template already has data-editable attributes
        const hasDataAttributes = template.includes(`data-field="${placeholder}"`);
        
        if (this.isAttributeValue(placeholder)) {
          // For attribute values, just escape HTML (data attrs will be on element itself in template)
          replacements[placeholder] = this.escapeHtml(String(value));
        } else if (hasDataAttributes) {
          // ✨ Template already has data attributes - don't wrap!
          replacements[placeholder] = this.escapeHtml(String(value));
        } else {
          // For text content without pre-existing data attrs, wrap with span
          const wrappedValue = this.wrapWithDataAttributes(
            block.id,
            placeholder,
            String(value),
            this.inferFieldType(placeholder)
          );
          replacements[placeholder] = wrappedValue;
        }
        appliedOverrides.push(`placeholder-${placeholder}`);
      } else if (config.required) {
        const fallbackValue = this.getFallbackValue(placeholder, config);
        const hasDataAttributes = template.includes(`data-field="${placeholder}"`);
        
        if (this.isAttributeValue(placeholder)) {
          replacements[placeholder] = this.escapeHtml(String(fallbackValue));
        } else if (hasDataAttributes) {
          // ✨ Template already has data attributes - don't wrap!
          replacements[placeholder] = this.escapeHtml(String(fallbackValue));
        } else {
          const wrappedValue = this.wrapWithDataAttributes(
            block.id,
            placeholder,
            String(fallbackValue),
            this.inferFieldType(placeholder)
          );
          replacements[placeholder] = wrappedValue;
        }
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

    // Step 5: Localization pass for any residual static Thai strings inside templates
    template = this.localizeStaticStrings(template, userData);

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

    // Array fields for about variants
    if (template.includes('{teamMembers}')) {
      specialReplacements['teamMembers'] = this.generateTeamMembers(userData, colorMap);
    }

    if (template.includes('{timelineItems}')) {
      specialReplacements['timelineItems'] = this.generateTimelineItems(userData, colorMap);
    }

    if (template.includes('{storyItems}')) {
      specialReplacements['storyItems'] = this.generateStoryItems(userData, colorMap);
    }

    if (template.includes('{values}')) {
      specialReplacements['values'] = this.generateValues(userData, colorMap);
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
   * 🎨 VISUAL EDIT: Added data attributes for click-to-edit
   */
  private generateFeatures(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const features = userData['About-basic']?.features 
      || userData['about-basic']?.features 
      || [];
    
    if (!Array.isArray(features) || features.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return features.map((feature: any, index: number) => 
      `<div className="text-center"
        data-editable="true"
        data-block-id="about-basic"
        data-field="features"
        data-item-index="${index}"
        data-type="feature"
      >
        <div className="w-16 h-16 bg-${primary}-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-${primary}-600 text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-semibold text-${primary}-900 mb-2"
          data-editable="true"
          data-block-id="about-basic"
          data-field="features[${index}].title"
          data-type="heading"
        >
          ${this.escapeHtml(feature.title || 'Feature')}
        </h3>
        <p className="text-${primary}-700"
          data-editable="true"
          data-block-id="about-basic"
          data-field="features[${index}].description"
          data-type="text"
        >
          ${this.escapeHtml(feature.description || 'Description')}
        </p>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate stats HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   * 🎨 VISUAL EDIT: Added data attributes for click-to-edit
   */
  private generateStats(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const stats = userData['About-basic']?.stats 
      || userData['about-basic']?.stats 
      || [];
    
    if (!Array.isArray(stats) || stats.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return stats.map((stat: any, index: number) => 
      `<div className="text-center"
        data-editable="true"
        data-block-id="about-basic"
        data-field="stats"
        data-item-index="${index}"
        data-type="stat"
      >
        <div className="text-3xl font-bold text-${primary}-600 mb-2"
          data-editable="true"
          data-block-id="about-basic"
          data-field="stats[${index}].number"
          data-type="text"
        >
          ${this.escapeHtml(stat.number || '0')}
        </div>
        <div className="text-${primary}-700"
          data-editable="true"
          data-block-id="about-basic"
          data-field="stats[${index}].label"
          data-type="text"
        >
          ${this.escapeHtml(stat.label || 'Label')}
        </div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate menu items HTML with images
   * 🚀 OPTIMIZATION 3: Pre-resolved colors + Images
   * 🎨 VISUAL EDIT: Added data attributes for click-to-edit
   */
  private generateMenuItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const menuItems = userData['Menu-basic']?.menuItems 
      || userData['menu-basic']?.menuItems 
      || [];
    
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    const lang = this.getLanguage(userData);
    return menuItems.map((item: any, index: number) => 
      `<div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-${primary}-100"
        data-editable="true"
        data-block-id="menu-basic"
        data-field="menuItems"
        data-item-index="${index}"
        data-type="menu-item"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src="${this.escapeHtml(item.image || 'https://via.placeholder.com/400x300?text=Image+Not+Available')}" 
            alt="${this.escapeHtml(item.imageAlt || item.name || 'Food item')}"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            data-editable="true"
            data-block-id="menu-basic"
            data-field="menuItems[${index}].image"
            data-type="image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-${primary}-500 text-white text-xs font-semibold rounded-full"
              data-editable="true"
              data-block-id="menu-basic"
              data-field="menuItems[${index}].category"
              data-type="text"
            >
              ${this.escapeHtml(item.category || 'food')}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-${primary}-900 group-hover:text-${primary}-700 transition-colors"
              data-editable="true"
              data-block-id="menu-basic"
              data-field="menuItems[${index}].name"
              data-type="heading"
            >
              ${this.escapeHtml(item.name || 'Item')}
            </h3>
            <div className="w-12 h-12 bg-${primary}-100 rounded-full flex items-center justify-center group-hover:bg-${primary}-200 transition-colors">
              <span className="text-${primary}-600 text-lg">${this.getCategoryIcon(userData)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed"
            data-editable="true"
            data-block-id="menu-basic"
            data-field="menuItems[${index}].description"
            data-type="text"
          >
            ${this.escapeHtml(item.description || 'Description')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-${primary}-600 group-hover:text-${primary}-700 transition-colors"
              data-editable="true"
              data-block-id="menu-basic"
              data-field="menuItems[${index}].price"
              data-type="text"
            >
              ${this.formatPrice(item.price, lang)}
            </div>
            <button className="px-4 py-2 bg-${primary}-500 text-white rounded-full hover:bg-${primary}-600 font-semibold text-sm group-hover:scale-105 transform transition-all duration-300">
              ${this.getI18n(lang).select}
            </button>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-${primary}-400 to-${primary}-600 group-hover:from-${primary}-500 group-hover:to-${primary}-700 transition-all"></div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate navbar menu links (using React Router Link) - Simplified version
   * Now relies on business category data instead of hard-coded logic
   */
  private generateNavbarMenuItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const items = userData['Navbar']?.menuItems
      || userData['navbar-basic']?.menuItems
      || [];

    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';

    // Simply use the menu items from business category - no filtering or hard-coded logic
    return items.map((item: any) =>
      `<li><Link to="${this.escapeHtml(item.href)}" className="text-${primary}-700 hover:text-${primary}-900">${this.escapeHtml(item.label || 'Menu')}</Link></li>`
    ).join('\n                ');
  }

  /**
   * Choose icon by business category (used by menu cards)
   */
  private getCategoryIcon(userData: Record<string, any>): string {
    const category = (userData?.businessCategory || userData?.category || '').toLowerCase();
    const iconMap: Record<string, string> = {
      ecommerce: '🛒',
      restaurant: '🍽️',
      healthcare: '🏥',
      pharmacy: '💊',
      portfolio: '💼'
    };
    return iconMap[category] || '🛒';
  }

  /**
   * Generate social links HTML
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   * 🎨 VISUAL EDIT: Added data attributes for click-to-edit
   */
  private generateSocialLinks(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const socialLinks = userData.Footer?.socialLinks 
      || userData['footer-basic']?.socialLinks 
      || [];
    
    if (!Array.isArray(socialLinks) || socialLinks.length === 0) {
      return '';
    }

    const primary = colorMap['primary'] || 'blue';
    return socialLinks.map((link: any, index: number) => 
      `<a href="${this.escapeHtml(link.url || '#')}" 
         className="text-${primary}-300 hover:text-white transition-colors"
         data-editable="true"
         data-block-id="footer-basic"
         data-field="socialLinks[${index}].url"
         data-type="link"
      >
        <span className="sr-only">${this.escapeHtml(link.name || 'Social')}</span>
        <span className="text-2xl">${this.escapeHtml(link.icon || '🔗')}</span>
      </a>`
    ).join('\n              ');
  }

  /**
   * Generate quick links HTML (using React Router Link)
   * 🚀 OPTIMIZATION 3: Pre-resolved colors
   * 🎨 VISUAL EDIT: Added data attributes for click-to-edit
   */
  private generateQuickLinks(userData: Record<string, any>, colorMap: Record<string, string>): string {
    let quickLinks = userData.Footer?.quickLinks 
      || userData['footer-basic']?.quickLinks 
      || [];
    
    // Provide sensible defaults if none supplied
    if (!Array.isArray(quickLinks) || quickLinks.length === 0) {
      const lang = this.getLanguage(userData);
      const i18n = this.getI18n(lang);
      quickLinks = [
        { label: i18n.home, href: '/' },
        { label: i18n.menu, href: '/menu' },
        { label: i18n.about, href: '/about' },
        { label: i18n.contact, href: '/contact' }
      ];
    }

    const primary = colorMap['primary'] || 'blue';
    return quickLinks.map((link: any, index: number) => 
      `<li>
        <Link to="${this.escapeHtml(link.href || '#')}" 
              className="text-${primary}-300 hover:text-white transition-colors"
              data-editable="true"
              data-block-id="footer-basic"
              data-field="quickLinks[${index}].label"
              data-type="text"
        >
          ${this.escapeHtml(link.label || 'Link')}
        </Link>
      </li>`
    ).join('\n              ');
  }

  /**
   * Generate team members HTML
   */
  private generateTeamMembers(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const teamMembers = userData['about-basic']?.teamMembers 
      || userData['About-basic']?.teamMembers 
      || [];

    // Debug: Only log if no team members found
    if (teamMembers.length === 0) {
      console.log("⚠️ No team members found in generateTeamMembers");
    }

    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      console.log("⚠️ No team members found, using fallback");
      return '<div className="text-center text-gray-500">No team members available</div>';
    }

    const primary = colorMap['primary'] || 'blue';
    return teamMembers.map((member: any, index: number) => 
      `<div className="text-center group">
        <div className="relative mb-4">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
            <img 
              src="${this.escapeHtml(member.image || 'https://via.placeholder.com/128x128?text=Team+Member')}" 
              alt="${this.escapeHtml(member.name || 'Team Member')}"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h4 className="text-lg font-bold text-${primary}-900 mb-1">
          ${this.escapeHtml(member.name || 'Team Member')}
        </h4>
        <p className="text-sm text-${primary}-600 mb-2">
          ${this.escapeHtml(member.role || 'Role')}
        </p>
        <p className="text-xs text-${primary}-500 leading-relaxed">
          ${this.escapeHtml(member.bio || 'Team member description')}
        </p>
      </div>`
    ).join('\n            ');
  }

  /**
   * Generate timeline items HTML
   */
  private generateTimelineItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const timelineItems = userData['About-basic']?.timelineItems 
      || userData['about-basic']?.timelineItems 
      || [];

    if (!Array.isArray(timelineItems) || timelineItems.length === 0) {
      return '<div className="text-center text-gray-500">No timeline items available</div>';
    }

    const primary = colorMap['primary'] || 'blue';
    return timelineItems.map((item: any, index: number) => {
      const isEven = index % 2 === 0;
      const leftClasses = isEven ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8';
      const rightClasses = isEven ? 'lg:text-left lg:pl-8' : 'lg:text-right lg:pr-8';
      
      return `<div className="relative flex items-center">
        <div className="flex-1 lg:flex-none lg:w-1/2">
          <div className="${leftClasses}">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-${primary}-100 text-${primary}-700 text-sm font-semibold mb-4">
              ${this.escapeHtml(item.year || '2024')}
            </div>
            <h3 className="text-xl font-bold text-${primary}-900 mb-2">
              ${this.escapeHtml(item.title || 'Timeline Event')}
            </h3>
            <p className="text-${primary}-700 leading-relaxed">
              ${this.escapeHtml(item.description || 'Timeline event description')}
            </p>
          </div>
        </div>
        
        {/* Timeline Dot */}
        <div className="hidden lg:flex items-center justify-center w-8 h-8 bg-${primary}-500 rounded-full border-4 border-white shadow-lg z-10">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        
        <div className="flex-1 lg:flex-none lg:w-1/2">
          <div className="${rightClasses}">
            {/* Empty space for alternating layout */}
          </div>
        </div>
      </div>`;
    }).join('\n              ');
  }

  /**
   * Generate story items HTML
   */
  private generateStoryItems(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const storyItems = userData['About-basic']?.storyItems 
      || userData['about-basic']?.storyItems 
      || [];

    if (!Array.isArray(storyItems) || storyItems.length === 0) {
      return '<div className="text-center text-gray-500">No story items available</div>';
    }

    const primary = colorMap['primary'] || 'blue';
    return storyItems.map((item: any, index: number) => {
      const isEven = index % 2 === 0;
      const leftClasses = isEven ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8';
      const rightClasses = isEven ? 'lg:text-left lg:pl-8' : 'lg:text-right lg:pr-8';
      
      return `<div className="relative flex items-center">
        <div className="flex-1 lg:flex-none lg:w-1/2">
          <div className="${leftClasses}">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-${primary}-100 text-${primary}-700 text-sm font-semibold mb-4">
              ${this.escapeHtml(item.year || '2024')}
            </div>
            <h3 className="text-xl font-bold text-${primary}-900 mb-2">
              ${this.escapeHtml(item.title || 'Story Event')}
            </h3>
            <p className="text-${primary}-700 leading-relaxed">
              ${this.escapeHtml(item.description || 'Story event description')}
            </p>
          </div>
        </div>
        
        {/* Story Dot */}
        <div className="hidden lg:flex items-center justify-center w-8 h-8 bg-${primary}-500 rounded-full border-4 border-white shadow-lg z-10">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        
        <div className="flex-1 lg:flex-none lg:w-1/2">
          <div className="${rightClasses}">
            {/* Empty space for alternating layout */}
          </div>
        </div>
      </div>`;
    }).join('\n              ');
  }

  /**
   * Generate values HTML
   */
  private generateValues(userData: Record<string, any>, colorMap: Record<string, string>): string {
    const values = userData['About-basic']?.values 
      || userData['about-basic']?.values 
      || [];

    if (!Array.isArray(values) || values.length === 0) {
      return '<div className="text-center text-gray-500">No values available</div>';
    }

    const primary = colorMap['primary'] || 'blue';
    return values.map((value: any, index: number) => 
      `<div className="flex items-start space-x-4 p-4 rounded-lg bg-${primary}-50 hover:bg-${primary}-100 transition-colors">
        <div className="flex-shrink-0 w-8 h-8 bg-${primary}-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-${primary}-900 mb-1">
            ${this.escapeHtml(value.title || 'Value Title')}
          </h4>
          <p className="text-${primary}-700 text-sm leading-relaxed">
            ${this.escapeHtml(value.description || 'Value description')}
          </p>
        </div>
      </div>`
    ).join('\n            ');
  }

  /**
   * Determine language from user data
   */
  private getLanguage(userData: Record<string, any>): 'th' | 'en' {
    const pref = (userData?.global?.language || userData?.aiSettings?.language || '').toLowerCase();
    if (pref === 'en' || pref === 'th') return pref as 'th' | 'en';
    // Heuristic
    const text = JSON.stringify(userData || {});
    const hasThai = /[\u0E00-\u0E7F]/.test(text);
    return hasThai ? 'th' : 'en';
  }

  /**
   * Simple i18n dictionary
   */
  private getI18n(lang: 'th' | 'en') {
    if (lang === 'en') {
      return {
        select: 'Select',
        home: 'Home',
        menu: 'Menu',
        about: 'About',
        contact: 'Contact',
        newsletter: 'Subscribe for news and promotions',
        emailPlaceholder: 'Your email',
        subscribe: 'Subscribe'
      };
    }
    return {
      select: 'เลือก',
      home: 'หน้าแรก',
      menu: 'เมนู',
      about: 'เกี่ยวกับเรา',
      contact: 'ติดต่อเรา',
      newsletter: 'สมัครรับข่าวสารและโปรโมชั่น',
      emailPlaceholder: 'อีเมลของคุณ',
      subscribe: 'สมัคร'
    };
  }

  /**
   * Currency/price formatter by language
   */
  private formatPrice(price: any, lang: 'th' | 'en'): string {
    const raw = price ?? 0;
    let n = Number(raw);

    // Normalize common AI outputs like "$12", "1,200", "120 บาท"
    if (!Number.isFinite(n)) {
      const text = String(raw);
      const match = text.match(/[\d,.]+/);
      if (match) {
        const normalized = match[0].replace(/,/g, '');
        const parsed = Number(normalized);
        if (Number.isFinite(parsed)) {
          n = parsed;
        }
      }
    }

    if (!Number.isFinite(n)) n = 0;

    if (lang === 'en') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
    }
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);
  }

  /**
   * Replace common Thai static strings inside templates when language is English
   */
  private localizeStaticStrings(template: string, userData: Record<string, any>): string {
    const lang = this.getLanguage(userData);
    const i18n = this.getI18n(lang);
    let result = template;
    // Replace placeholder tokens
    result = result
      .replace(/\{quickLinksTitle\}/g, lang === 'en' ? 'Quick Links' : 'ลิงก์ด่วน')
      .replace(/\{contactTitle\}/g, i18n.contact)
      .replace(/\{newsletterTitle\}/g, lang === 'en' ? 'Newsletter' : 'รับข่าวสาร')
      .replace(/\{newsletterSubtitle\}/g, i18n.newsletter)
      .replace(/\{newsletterEmailPlaceholder\}/g, i18n.emailPlaceholder)
      .replace(/\{newsletterCta\}/g, i18n.subscribe)
      .replace(/\{privacyPolicy\}/g, lang === 'en' ? 'Privacy Policy' : 'นโยบายความเป็นส่วนตัว')
      .replace(/\{termsOfUse\}/g, lang === 'en' ? 'Terms of Use' : 'ข้อกำหนดการใช้งาน')
      .replace(/\{contactFormTitle\}/g, lang === 'en' ? 'Send a Message' : 'ส่งข้อความ')
      .replace(/\{contactFormCta\}/g, lang === 'en' ? 'Send' : 'ส่งข้อความ');

    // Replace common static Thai strings to English when needed
    if (lang === 'en') {
      result = result.replace(/ติดต่อเรา/g, i18n.contact)
                     .replace(/สมัครรับข่าวสารและโปรโมชั่น/g, i18n.newsletter)
                     .replace(/อีเมลของคุณ/g, i18n.emailPlaceholder)
                     .replace(/สมัคร(?![\w-])/g, i18n.subscribe)
                     .replace(/เกี่ยวกับเรา/g, i18n.about)
                     .replace(/หน้าแรก/g, i18n.home)
                     .replace(/เมนู(?![\w-])/g, i18n.menu)
                     .replace(/เลือก/g, i18n.select)
                     .replace(/ บาท/g, ' THB');
    }
    return result;
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

  private escapeHtml(text: any): string {
    // 🔧 แก้ไข: รองรับค่าที่ไม่ใช่ string
    if (text === null || text === undefined) {
      return '';
    }
    
    // ถ้าเป็น object หรือ array ให้แปลงเป็น JSON string
    if (typeof text === 'object') {
      console.warn(`⚠️ escapeHtml received object/array, converting to JSON:`, text);
      text = JSON.stringify(text);
    }
    
    // แปลงเป็น string
    const str = String(text);
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 🎨 VISUAL EDIT: Wrap placeholder value with data attributes for visual editing
   * NOTE: ใช้ได้เฉพาะ TEXT CONTENT เท่านั้น ไม่ใช่ attribute values (src, href, etc.)
   */
  private wrapWithDataAttributes(
    blockId: string,
    field: string,
    value: string,
    type: 'text' | 'heading' | 'subheading' | 'button' | 'badge'
  ): string {
    const tag = 'span'; // ใช้ span เพราะไม่รบกวน semantic HTML
    
    return `<${tag} 
      data-editable="true" 
      data-block-id="${blockId}" 
      data-field="${field}"
      data-type="${type}"
      class="midori-editable"
    >${this.escapeHtml(value)}</${tag}>`;
  }

  /**
   * 🎨 VISUAL EDIT: Infer field type from placeholder name
   */
  private inferFieldType(field: string): 'text' | 'heading' | 'subheading' | 'button' | 'badge' {
    if (field === 'heading') return 'heading';
    if (field === 'subheading') return 'subheading';
    if (field === 'badge') return 'badge';
    if (field.includes('cta') || field.includes('Cta') || field.includes('Button')) return 'button';
    return 'text';
  }

  /**
   * 🎨 VISUAL EDIT: ตรวจสอบว่า placeholder นี้เป็น attribute value หรือไม่
   * Attribute values (src, href, alt) ไม่สามารถ wrap ด้วย span ได้
   */
  private isAttributeValue(field: string): boolean {
    // Check if field ends with Image, ImageAlt, Url, or is a known attribute field
    if (field.endsWith('Image') || 
        field.endsWith('ImageAlt') || 
        field.endsWith('Url') ||
        field.endsWith('Alt')) {
      return true;
    }
    
    // Check specific attribute fields
    const attributeFields = [
      'src', 'href', 'url', 'alt',
      'image', 'icon', 'logo',
      'video', 'audio'
    ];
    
    return attributeFields.includes(field.toLowerCase());
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

  /**
   * แปลง Block ID เป็น Data Key
   */
  private getBlockDataKey(blockId: string): string {
    const keyMap: Record<string, string> = {
      "hero-basic": "Hero",
      "navbar-basic": "Navbar",
      "theme-basic": "Theme",
      "footer-basic": "Footer",
      "about-basic": "About-basic",
      "contact-basic": "Contact-basic",
      "menu-basic": "Menu-basic"
    };

    return keyMap[blockId] || blockId.charAt(0).toUpperCase() + blockId.slice(1);
  }

  /**
   * ✨ AUTO-DETECT: เพิ่ม fallback values สำหรับ variant-specific required placeholders
   * 
   * กฏ: ถ้า variant มี required placeholders พิเศษที่ไม่มีใน userData
   *      ระบบจะเพิ่ม fallback values อัตโนมัติ
   */
  private addVariantFallbacks(
    concreteManifest: ConcreteManifest,
    userData: Record<string, any>
  ): Record<string, any> {
    const enhanced = { ...userData };
    
    // วนลูปทุก block เพื่อเช็ค variant-specific placeholders
    for (const block of concreteManifest.blocks) {
      const variantId = block.metadata?.variantId;
      if (!variantId) continue;
      
      const blockKey = this.getBlockDataKey(block.id);
      const blockData = enhanced[blockKey] || {};
      
      // หา required placeholders ที่มาจาก variant
      const variantRequiredPlaceholders = this.getVariantSpecificRequiredPlaceholders(block);
      
      if (variantRequiredPlaceholders.length === 0) continue;
      
      // เช็คว่ามีค่าครบหรือไม่
      const missingPlaceholders = variantRequiredPlaceholders.filter(p => !(p in blockData));
      
      if (missingPlaceholders.length > 0) {
        console.log(`🔄 Adding fallback values for variant '${variantId}' (${missingPlaceholders.join(', ')})`);
        
        // เพิ่ม fallback values
        const fallbacks = this.generateFallbackValues(missingPlaceholders, block.id);
        
        enhanced[blockKey] = {
          ...blockData,
          ...fallbacks
        };
      }
    }
    
    return enhanced;
  }

  /**
   * หา variant-specific required placeholders
   */
  private getVariantSpecificRequiredPlaceholders(block: any): string[] {
    const basePlaceholders = [
      'badge', 'heading', 'subheading', 
      'ctaLabel', 'secondaryCta',
      'heroImage', 'heroImageAlt',
      // aboutImage, aboutImageAlt ต้องเป็น variant-specific เพื่อให้ใช้ dynamic generation
      'brand', 'brandFirstChar', 'ctaButton', 'menuItems',
      'title', 'description', 'features', 'stats',
      'address', 'phone', 'email', 'businessHours',
      'companyName', 'socialLinks', 'quickLinks',
      'radius', 'spacing'
    ];
    
    const variantSpecific: string[] = [];
    
    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      const configTyped = config as any;
      
      if (configTyped.required && !basePlaceholders.includes(placeholder)) {
        variantSpecific.push(placeholder);
      }
    }
    
    return variantSpecific;
  }

  // Removed dynamic image generation methods - now handled in ai-service.ts

  /**
   * Generate fallback values สำหรับ placeholders ที่หายไป
   */
  private generateFallbackValues(
    placeholders: string[], 
    blockId: string
  ): Record<string, any> {
    const fallbacks: Record<string, any> = {};
    
    // Fallback map สำหรับ placeholder patterns ต่างๆ
    const fallbackMap: Record<string, any> = {
      // Stats pattern
      'stat1': '15+',
      'stat1Label': 'ปีประสบการณ์',
      'stat2': '1000+',
      'stat2Label': 'ลูกค้าพึงพอใจ',
      'stat3': '50+',
      'stat3Label': 'เมนูหลากหลาย',
      'stat4': '24/7',
      'stat4Label': 'บริการ',
      
      // Testimonials
      'testimonials': [
        { name: 'สมชาย ใจดี', quote: 'อาหารอร่อยมาก', role: 'ลูกค้าประจำ' },
        { name: 'สมหญิง สบายดี', quote: 'บริการดีเยี่ยม', role: 'ลูกค้า' }
      ],
      
      // Video
      'videoUrl': 'https://via.placeholder.com/1920x1080/000/fff?text=Video',
      
      // Gallery
      'gallery': [
        { image: 'https://via.placeholder.com/800x600', alt: 'Gallery 1' },
        { image: 'https://via.placeholder.com/800x600', alt: 'Gallery 2' }
      ],
      
      // Team members
      'teamMembers': [
        { name: 'John Doe', role: 'Chef', image: 'https://via.placeholder.com/400x400', bio: 'Expert chef' }
      ],
      
      // About variants (handled by dynamic generation above)
      // 'aboutImage', 'aboutImageAlt', 'heroImage', 'heroImageAlt' are handled dynamically
      
      // Team variants
      'teamTitle': 'Our Team',
      'teamSubtitle': 'Meet our professional team members',
      
      // Timeline variants
      'timelineItems': [
        { year: '2020', title: 'Company Founded', description: 'Started our journey' },
        { year: '2021', title: 'First Milestone', description: 'Reached 100 customers' },
        { year: '2022', title: 'Expansion', description: 'Opened new locations' },
        { year: '2023', title: 'Award Winner', description: 'Best service award' }
      ],
      
      // Mission variants
      'missionTitle': 'Our Mission',
      'missionStatement': 'We are committed to delivering excellence in everything we do',
      
      // Story variants
      'storyItems': [
        { year: '2020', title: 'The Beginning', description: 'Our story started here' },
        { year: '2021', title: 'Growth', description: 'We expanded our services' },
        { year: '2022', title: 'Innovation', description: 'New technologies introduced' },
        { year: '2023', title: 'Future', description: 'Looking ahead to tomorrow' }
      ],
      
      // Values variants
      'values': [
        { title: 'Quality', description: 'We maintain the highest standards' },
        { title: 'Integrity', description: 'Honest and transparent in all dealings' },
        { title: 'Innovation', description: 'Always looking for better solutions' },
        { title: 'Service', description: 'Customer satisfaction is our priority' }
      ],
      
      // CTA variants
      'ctaLabel': 'Learn More',
      'secondaryCta': 'Contact Us',
      'badge': 'About Us'
    };
    
    for (const placeholder of placeholders) {
      if (placeholder in fallbackMap) {
        fallbacks[placeholder] = fallbackMap[placeholder];
      } else {
        // Generic fallback
        fallbacks[placeholder] = this.getGenericFallback(placeholder);
      }
    }
    
    return fallbacks;
  }

  /**
   * Get generic fallback สำหรับ placeholder ที่ไม่มีใน map
   */
  private getGenericFallback(placeholder: string): any {
    // ถ้าเป็น array (ลงท้ายด้วย s หรือมี Items/Links)
    if (placeholder.endsWith('s') || placeholder.includes('Items') || placeholder.includes('Links')) {
      return [];
    }
    
    // ถ้าเป็น Label
    if (placeholder.includes('Label')) {
      return 'Label';
    }
    
    // ถ้าเป็น URL
    if (placeholder.includes('Url') || placeholder.includes('url')) {
      return 'https://example.com';
    }
    
    // Default
    return 'Default Value';
  }

  /**
   * ✨ AUTO-DETECT: เช็คว่า placeholder เป็น variant-specific หรือไม่
   * 
   * กฏ: placeholder ที่ไม่ใช่ base placeholders = variant-specific
   */
  private isVariantSpecificPlaceholder(field: string): boolean {
    const basePlaceholders = [
      'badge', 'heading', 'subheading', 
      'ctaLabel', 'secondaryCta',
      // heroImage, heroImageAlt ต้องเป็น variant-specific เพื่อให้ใช้ dynamic generation
      // aboutImage, aboutImageAlt ต้องเป็น variant-specific เพื่อให้ใช้ dynamic generation
      'brand', 'brandFirstChar', 'ctaButton', 'menuItems',
      'title', 'description', 'features', 'stats',
      'address', 'phone', 'email', 'businessHours',
      'companyName', 'socialLinks', 'quickLinks',
      'radius', 'spacing'
    ];
    
    // Extract placeholder name from field (field อาจมีรูปแบบ "Hero.stat1" หรือ "stat1")
    const placeholderName = field.includes('.') ? field.split('.').pop() || '' : field;
    
    // ถ้าไม่ใช่ base placeholder → เป็น variant-specific
    return !basePlaceholders.includes(placeholderName);
  }

}
