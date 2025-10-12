/**
 * Template Engine
 * Handles placeholder replacement and template rendering
 */

import type { ThemePack } from '../theme-pack/types';

export class TemplateEngine {
  
  /**
   * Replace all placeholders in template with actual values
   */
  static render(template: string, props: Record<string, any>, themePack?: ThemePack): string {
    let rendered = template;
    
    // 1. Replace simple props
    rendered = this.replaceSimplePlaceholders(rendered, props);
    
    // 2. Replace theme values
    if (themePack) {
      rendered = this.replaceThemePlaceholders(rendered, themePack);
    }
    
    // 3. Replace array/object props
    rendered = this.replaceComplexPlaceholders(rendered, props);
    
    return rendered;
  }
  
  /**
   * Replace simple {key} placeholders
   */
  private static replaceSimplePlaceholders(template: string, props: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(props)) {
      // Skip arrays and objects
      if (typeof value === 'object' && value !== null) {
        continue;
      }
      
      const placeholder = `{${key}}`;
      const stringValue = String(value || '');
      
      // Replace all occurrences
      result = result.split(placeholder).join(stringValue);
    }
    
    return result;
  }
  
  /**
   * Replace theme-related placeholders
   * Example: {theme.primary} -> #F97316
   */
  private static replaceThemePlaceholders(template: string, themePack: ThemePack): string {
    let result = template;
    
    // Color replacements
    const colorMap: Record<string, string> = {
      '{theme.primary}': themePack.colorPalette.primary[500],
      '{theme.primary.light}': themePack.colorPalette.primary[300],
      '{theme.primary.dark}': themePack.colorPalette.primary[700],
      '{theme.secondary}': themePack.colorPalette.secondary[500],
      '{theme.secondary.light}': themePack.colorPalette.secondary[300],
      '{theme.secondary.dark}': themePack.colorPalette.secondary[700],
      '{theme.accent}': themePack.colorPalette.accent[500],
      '{theme.neutral}': themePack.colorPalette.neutral[500],
      '{theme.success}': themePack.colorPalette.semantic.success,
      '{theme.warning}': themePack.colorPalette.semantic.warning,
      '{theme.error}': themePack.colorPalette.semantic.error,
      '{theme.info}': themePack.colorPalette.semantic.info
    };
    
    for (const [placeholder, color] of Object.entries(colorMap)) {
      result = result.split(placeholder).join(color);
    }
    
    // Font family replacements
    result = result.replace(/{theme\.font\.heading}/g, themePack.typography.fontFamily.heading);
    result = result.replace(/{theme\.font\.body}/g, themePack.typography.fontFamily.body);
    
    return result;
  }
  
  /**
   * Replace complex placeholders (arrays, objects)
   * Example: {#each menuItems} ... {/each}
   */
  private static replaceComplexPlaceholders(template: string, props: Record<string, any>): string {
    let result = template;
    
    // Handle array iteration: {#each items}...{/each}
    const eachPattern = /\{#each\s+(\w+)\}([\s\S]*?)\{\/each\}/g;
    result = result.replace(eachPattern, (match, arrayKey, itemTemplate) => {
      const array = props[arrayKey];
      
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map((item, index) => {
        let itemRendered = itemTemplate;
        
        // Replace {item.property} with actual values
        for (const [key, value] of Object.entries(item)) {
          const placeholder = `{item.${key}}`;
          itemRendered = itemRendered.split(placeholder).join(String(value || ''));
        }
        
        // Replace {index}
        itemRendered = itemRendered.split('{index}').join(String(index));
        
        return itemRendered;
      }).join('');
    });
    
    // Handle conditional rendering: {#if condition}...{/if}
    const ifPattern = /\{#if\s+(\w+)\}([\s\S]*?)\{\/if\}/g;
    result = result.replace(ifPattern, (match, conditionKey, content) => {
      const condition = props[conditionKey];
      return condition ? content : '';
    });
    
    return result;
  }
  
  /**
   * Extract all placeholders from a template
   */
  static extractPlaceholders(template: string): string[] {
    const placeholders: string[] = [];
    const pattern = /\{([^}]+)\}/g;
    let match;
    
    while ((match = pattern.exec(template)) !== null) {
      const placeholder = match[1];
      
      // Skip control flow placeholders
      if (placeholder.startsWith('#') || placeholder.startsWith('/')) {
        continue;
      }
      
      placeholders.push(placeholder);
    }
    
    return [...new Set(placeholders)]; // Remove duplicates
  }
  
  /**
   * Validate that all required placeholders have values
   */
  static validateProps(template: string, props: Record<string, any>): {
    isValid: boolean;
    missing: string[];
  } {
    const placeholders = this.extractPlaceholders(template);
    const missing: string[] = [];
    
    for (const placeholder of placeholders) {
      // Skip theme placeholders
      if (placeholder.startsWith('theme.')) {
        continue;
      }
      
      // Check if prop exists
      const keys = placeholder.split('.');
      let value: any = props;
      
      for (const key of keys) {
        if (value === undefined || value === null) {
          missing.push(placeholder);
          break;
        }
        value = value[key];
      }
      
      if (value === undefined || value === null) {
        missing.push(placeholder);
      }
    }
    
    return {
      isValid: missing.length === 0,
      missing
    };
  }
}

