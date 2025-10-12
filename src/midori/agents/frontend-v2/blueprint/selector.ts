/**
 * Blueprint Selector
 * Selects appropriate blueprint based on business category and requirements
 */

import type { Blueprint } from '@/midori/agents/orchestrator/types/enhancedProjectContext';
import type { SelectBlueprintInput } from './types';
import { ONEPAGER_BLUEPRINTS } from './layouts/onepager';

export class BlueprintSelector {
  
  /**
   * Select blueprint based on input criteria
   */
  static select(input: SelectBlueprintInput): Blueprint {
    
    // 1. Determine page type (onepager vs multipage)
    const pageType = this.determinePageType(input);
    
    // 2. Get blueprint based on category and page type
    let blueprint: Blueprint;
    
    if (pageType === 'onepager') {
      blueprint = this.selectOnepagerBlueprint(input);
    } else {
      // TODO: Implement multipage blueprints
      blueprint = this.selectOnepagerBlueprint(input);
    }
    
    // 3. Customize blueprint based on features
    blueprint = this.customizeBlueprint(blueprint, input);
    
    // Blueprint selected
    
    return blueprint;
  }
  
  /**
   * Determine whether to use onepager or multipage layout
   */
  private static determinePageType(input: SelectBlueprintInput): 'onepager' | 'multipage' {
    // If explicitly requesting multiple pages
    if (input.pageCount && input.pageCount > 1) {
      return 'multipage';
    }
    
    // If complexity is simple or moderate, default to onepager
    if (input.complexity === 'simple' || input.complexity === 'moderate') {
      return 'onepager';
    }
    
    // If many features, might need multipage
    if (input.features.length > 5) {
      return 'multipage';
    }
    
    // Default to onepager
    return 'onepager';
  }
  
  /**
   * Select onepager blueprint
   */
  private static selectOnepagerBlueprint(input: SelectBlueprintInput): Blueprint {
    const category = input.businessCategory.toLowerCase();
    
    // Map business categories to blueprint
    const categoryMap: Record<string, keyof typeof ONEPAGER_BLUEPRINTS> = {
      'restaurant': 'restaurant',
      'ecommerce': 'ecommerce',
      'portfolio': 'portfolio',
      'healthcare': 'ecommerce', // Use ecommerce as fallback
      'pharmacy': 'ecommerce',
      'business': 'ecommerce'
    };
    
    const blueprintKey = categoryMap[category] || 'ecommerce';
    
    // Clone blueprint to avoid mutation
    return JSON.parse(JSON.stringify(ONEPAGER_BLUEPRINTS[blueprintKey]));
  }
  
  /**
   * Customize blueprint based on features
   */
  private static customizeBlueprint(
    blueprint: Blueprint,
    input: SelectBlueprintInput
  ): Blueprint {
    
    const features = input.features.map(f => f.toLowerCase());
    const sections = blueprint.pages[0].sections;
    
    // Remove optional sections if not in features
    const customizedSections = sections.filter(section => {
      // Always keep required sections
      if (section.required) return true;
      
      // Keep optional sections only if feature is requested
      const sectionName = section.name.toLowerCase();
      return features.some(f => sectionName.includes(f));
    });
    
    // Reorder sections
    customizedSections.sort((a, b) => a.order - b.order);
    
    // Update blueprint
    blueprint.pages[0].sections = customizedSections;
    blueprint.layout.sections = customizedSections.map(s => s.id);
    
    return blueprint;
  }
  
  /**
   * Get blueprint by ID
   */
  static getById(id: string): Blueprint | null {
    // Search in all blueprint collections
    const allBlueprints = [
      ...Object.values(ONEPAGER_BLUEPRINTS)
    ];
    
    return allBlueprints.find(bp => bp.id === id) || null;
  }
  
  /**
   * Get all blueprints for a category
   */
  static getByCategory(category: string): Blueprint[] {
    const allBlueprints = [
      ...Object.values(ONEPAGER_BLUEPRINTS)
    ];
    
    return allBlueprints.filter(bp => 
      bp.category === category.toLowerCase()
    );
  }
  
  /**
   * List all available blueprints
   */
  static listAll(): Blueprint[] {
    return [
      ...Object.values(ONEPAGER_BLUEPRINTS)
    ];
  }
}

