/**
 * Component Selector
 * Smart algorithm for selecting optimal components based on context
 */

import { ComponentRegistryManager } from './registry';
import type {
  SelectionContext,
  ComponentSelection,
  SelectedComponent,
  ComponentScore,
  ComponentDefinition,
  ComponentVariant
} from './types';

export class ComponentSelector {
  private registry: ComponentRegistryManager;
  
  constructor() {
    this.registry = ComponentRegistryManager.getInstance();
  }
  
  /**
   * Select components based on context
   */
  async selectComponents(context: SelectionContext): Promise<ComponentSelection> {
    console.log('🎯 Starting component selection for:', context.businessCategory);
    
    // 1. Get all available components
    const allComponents = this.registry.getAllComponents();
    
    // 2. Score each component
    const scoredComponents = await this.scoreComponents(allComponents, context);
    
    // 3. Select best components for each slot
    const selectedComponents = this.selectBestComponents(scoredComponents, context);
    
    // 4. Generate alternatives
    const alternatives = this.generateAlternatives(scoredComponents, selectedComponents, context);
    
    // 5. Calculate total score
    const totalScore = selectedComponents.reduce((sum, c) => sum + c.score, 0) / selectedComponents.length;
    
    // 6. Generate reasoning
    const reasoning = this.generateReasoning(selectedComponents, context);
    
    return {
      selectedComponents,
      selectionCriteria: {
        businessCategory: context.businessCategory,
        style: context.style,
        tone: context.tone,
        features: context.features,
        userPreferences: context.preferences
      },
      totalScore,
      alternatives,
      reasoning
    };
  }
  
  /**
   * Score all components against context
   */
  private async scoreComponents(
    components: ComponentDefinition[],
    context: SelectionContext
  ): Promise<ComponentScore[]> {
    const scores: ComponentScore[] = [];
    
    for (const component of components) {
      for (const variant of component.variants) {
        const score = await this.calculateComponentScore(component, variant, context);
        scores.push(score);
      }
    }
    
    // Sort by score (descending)
    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }
  
  /**
   * Calculate score for a component variant
   */
  private async calculateComponentScore(
    component: ComponentDefinition,
    variant: ComponentVariant,
    context: SelectionContext
  ): Promise<ComponentScore> {
    
    // Domain matching score
    const domainMatch = this.calculateDomainMatch(component, context);
    
    // Style matching score
    const styleMatch = this.calculateStyleMatch(variant, context);
    
    // Tone matching score
    const toneMatch = this.calculateToneMatch(component, context);
    
    // Feature matching score
    const featureMatch = this.calculateFeatureMatch(component, context);
    
    // Popularity bonus
    const popularityBonus = this.calculatePopularityBonus(component);
    
    // Performance score
    const performanceScore = this.calculatePerformanceScore(component);
    
    // Calculate weighted total
    const weights = {
      domainMatch: 0.30,
      styleMatch: 0.25,
      toneMatch: 0.20,
      featureMatch: 0.15,
      popularityBonus: 0.05,
      performanceScore: 0.05
    };
    
    const totalScore = 
      domainMatch * weights.domainMatch +
      styleMatch * weights.styleMatch +
      toneMatch * weights.toneMatch +
      featureMatch * weights.featureMatch +
      popularityBonus * weights.popularityBonus +
      performanceScore * weights.performanceScore;
    
    // Generate reasoning
    const reasoning = this.generateScoreReasoning({
      domainMatch,
      styleMatch,
      toneMatch,
      featureMatch,
      popularityBonus,
      performanceScore
    }, component, variant, context);
    
    return {
      componentId: component.id,
      variantId: variant.id,
      totalScore,
      scores: {
        domainMatch,
        styleMatch,
        toneMatch,
        featureMatch,
        popularityBonus,
        performanceScore
      },
      reasoning
    };
  }
  
  /**
   * Calculate domain match score
   */
  private calculateDomainMatch(component: ComponentDefinition, context: SelectionContext): number {
    let score = 0;
    
    // Check if component tags match business category
    const categoryKeywords = this.getCategoryKeywords(context.businessCategory);
    const matchingTags = component.tags.filter(tag => 
      categoryKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );
    
    score = matchingTags.length / Math.max(categoryKeywords.length, 1);
    
    // Boost score if category matches
    if (component.category === this.mapBusinessCategoryToComponentCategory(context.businessCategory)) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }
  
  /**
   * Calculate style match score
   */
  private calculateStyleMatch(variant: ComponentVariant, context: SelectionContext): number {
    if (!context.style || context.style.length === 0) return 0.5;
    
    let score = 0;
    
    // Check if variant style matches requested styles
    if (context.style.includes(variant.style)) {
      score = 1.0;
    } else {
      // Partial match based on style compatibility
      const compatibleStyles = this.getCompatibleStyles(variant.style);
      const matchingStyles = context.style.filter(s => compatibleStyles.includes(s));
      score = matchingStyles.length / context.style.length;
    }
    
    return score;
  }
  
  /**
   * Calculate tone match score
   */
  private calculateToneMatch(component: ComponentDefinition, context: SelectionContext): number {
    if (!context.tone) return 0.5;
    
    // Map tone to expected characteristics
    const toneCharacteristics: Record<string, string[]> = {
      'friendly': ['warm', 'casual', 'approachable'],
      'professional': ['clean', 'modern', 'corporate'],
      'luxury': ['elegant', 'premium', 'sophisticated'],
      'playful': ['creative', 'fun', 'colorful']
    };
    
    const expectedChars = toneCharacteristics[context.tone] || [];
    const matchingTags = component.tags.filter(tag => 
      expectedChars.some(char => tag.includes(char))
    );
    
    return matchingTags.length / Math.max(expectedChars.length, 1);
  }
  
  /**
   * Calculate feature match score
   */
  private calculateFeatureMatch(component: ComponentDefinition, context: SelectionContext): number {
    if (!context.features || context.features.length === 0) return 0.5;
    
    const matchingFeatures = context.features.filter(feature =>
      component.tags.some(tag => tag.toLowerCase().includes(feature.toLowerCase()))
    );
    
    return matchingFeatures.length / context.features.length;
  }
  
  /**
   * Calculate popularity bonus
   */
  private calculatePopularityBonus(component: ComponentDefinition): number {
    // Normalize popularity (0-1 scale)
    const maxPopularity = 100;
    return Math.min(component.metadata.popularity / maxPopularity, 1.0);
  }
  
  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(component: ComponentDefinition): number {
    // Simple heuristic: fewer dependencies = better performance
    const dependencyCount = component.dependencies?.length || 0;
    return Math.max(0, 1 - (dependencyCount / 10));
  }
  
  /**
   * Select best components for each slot
   */
  private selectBestComponents(
    scoredComponents: ComponentScore[],
    context: SelectionContext
  ): SelectedComponent[] {
    const selected: SelectedComponent[] = [];
    
    // Select header component (navbar)
    const headerComponent = scoredComponents.find(c => 
      c.componentId.includes('nav') || c.componentId.includes('header')
    );
    if (headerComponent) {
      selected.push({
        componentId: headerComponent.componentId,
        variantId: headerComponent.variantId,
        slotId: 'header',
        score: headerComponent.totalScore,
        reason: headerComponent.reasoning[0] || 'Best match for header'
      });
    }
    
    // Select hero component
    const heroComponent = scoredComponents.find(c => 
      c.componentId.includes('hero')
    );
    if (heroComponent) {
      selected.push({
        componentId: heroComponent.componentId,
        variantId: heroComponent.variantId,
        slotId: 'hero',
        score: heroComponent.totalScore,
        reason: heroComponent.reasoning[0] || 'Best match for hero section'
      });
    }
    
    // Select section components (based on features)
    const sectionComponents = context.features.map((feature, index) => {
      const component = scoredComponents.find(c => 
        c.componentId.includes(feature.toLowerCase()) &&
        !selected.some(s => s.componentId === c.componentId)
      );
      
      if (component) {
        return {
          componentId: component.componentId,
          variantId: component.variantId,
          slotId: `section-${index + 1}`,
          score: component.totalScore,
          reason: `Best match for ${feature} feature`
        };
      }
      return null;
    }).filter(Boolean) as SelectedComponent[];
    
    selected.push(...sectionComponents);
    
    // Select footer component
    const footerComponent = scoredComponents.find(c => 
      c.componentId.includes('footer')
    );
    if (footerComponent) {
      selected.push({
        componentId: footerComponent.componentId,
        variantId: footerComponent.variantId,
        slotId: 'footer',
        score: footerComponent.totalScore,
        reason: footerComponent.reasoning[0] || 'Best match for footer'
      });
    }
    
    return selected;
  }
  
  /**
   * Generate alternative selections
   */
  private generateAlternatives(
    scoredComponents: ComponentScore[],
    selected: SelectedComponent[],
    context: SelectionContext
  ): any[] {
    // Get next best alternatives for each slot
    const alternatives = [];
    
    for (const component of selected) {
      const alternativeScores = scoredComponents.filter(c =>
        c.componentId !== component.componentId &&
        c.totalScore >= 0.6 * component.score
      ).slice(0, 2);
      
      if (alternativeScores.length > 0) {
        alternatives.push({
          components: alternativeScores.map(alt => ({
            componentId: alt.componentId,
            variantId: alt.variantId,
            slotId: component.slotId,
            score: alt.totalScore,
            reason: `Alternative for ${component.componentId}`
          })),
          score: alternativeScores[0].totalScore,
          reason: 'High-scoring alternative',
          differences: [`Different ${component.slotId} style`]
        });
      }
    }
    
    return alternatives.slice(0, 3); // Return top 3 alternatives
  }
  
  /**
   * Generate selection reasoning
   */
  private generateReasoning(
    selectedComponents: SelectedComponent[],
    context: SelectionContext
  ): any {
    const keyFactors = [];
    
    if (context.businessCategory) {
      keyFactors.push(`Optimized for ${context.businessCategory} business`);
    }
    
    if (context.style.length > 0) {
      keyFactors.push(`Matches ${context.style.join(', ')} style`);
    }
    
    if (context.tone) {
      keyFactors.push(`Aligned with ${context.tone} tone`);
    }
    
    const avgScore = selectedComponents.reduce((sum, c) => sum + c.score, 0) / selectedComponents.length;
    
    return {
      summary: `Selected ${selectedComponents.length} components with average score of ${(avgScore * 100).toFixed(1)}%`,
      keyFactors,
      tradeoffs: [
        'Balanced between popularity and innovation',
        'Optimized for performance and visual appeal'
      ],
      recommendations: [
        'Review alternatives for different styles',
        'Customize colors to match brand'
      ]
    };
  }
  
  /**
   * Generate score reasoning
   */
  private generateScoreReasoning(
    scores: any,
    component: ComponentDefinition,
    variant: ComponentVariant,
    context: SelectionContext
  ): string[] {
    const reasoning = [];
    
    if (scores.domainMatch > 0.7) {
      reasoning.push(`Strong match for ${context.businessCategory} domain`);
    }
    
    if (scores.styleMatch > 0.8) {
      reasoning.push(`Perfect ${variant.style} style match`);
    }
    
    if (scores.popularityBonus > 0.8) {
      reasoning.push('Highly popular component');
    }
    
    if (scores.performanceScore > 0.9) {
      reasoning.push('Excellent performance');
    }
    
    if (reasoning.length === 0) {
      reasoning.push('Good overall match');
    }
    
    return reasoning;
  }
  
  // ============================
  // Helper Methods
  // ============================
  
  private getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      'restaurant': ['food', 'menu', 'dining', 'restaurant', 'culinary'],
      'ecommerce': ['shop', 'product', 'cart', 'checkout', 'store'],
      'portfolio': ['work', 'project', 'showcase', 'creative', 'design'],
      'healthcare': ['medical', 'health', 'clinic', 'doctor', 'patient'],
      'pharmacy': ['medicine', 'drug', 'pharmacy', 'prescription', 'health']
    };
    
    return keywords[category] || [];
  }
  
  private mapBusinessCategoryToComponentCategory(businessCategory: string): string {
    const mapping: Record<string, string> = {
      'restaurant': 'content',
      'ecommerce': 'content',
      'portfolio': 'visual',
      'healthcare': 'content',
      'pharmacy': 'content'
    };
    
    return mapping[businessCategory] || 'content';
  }
  
  private getCompatibleStyles(style: string): string[] {
    const compatibility: Record<string, string[]> = {
      'modern': ['minimal', 'clean'],
      'classic': ['traditional', 'elegant'],
      'minimal': ['modern', 'clean'],
      'luxury': ['elegant', 'sophisticated'],
      'creative': ['playful', 'unique']
    };
    
    return compatibility[style] || [];
  }
}

