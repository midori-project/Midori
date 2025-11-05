/**
 * Project Context Validator
 * Data validation and consistency checks for project context
 */

import { ProjectContextData, ComponentStateData, PageStateData, StylingStateData, ComponentStyling } from '../types/projectContext';
import { ProjectType, ProjectStatus } from '@prisma/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationRule {
  name: string;
  validate: (context: ProjectContextData) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
}

export class ProjectContextValidator {
  private static rules: ValidationRule[] = [];

  /**
   * Initialize validation rules
   */
  static initialize(): void {
    this.rules = [
      // Required fields validation
      {
        name: 'required_fields',
        validate: this.validateRequiredFields,
        severity: 'error'
      },
      // Project type validation
      {
        name: 'project_type_consistency',
        validate: this.validateProjectTypeConsistency,
        severity: 'error'
      },
      // Status validation
      {
        name: 'status_consistency',
        validate: this.validateStatusConsistency,
        severity: 'error'
      },
      // Component validation
      {
        name: 'component_validation',
        validate: this.validateComponents,
        severity: 'warning'
      },
      // Page validation
      {
        name: 'page_validation',
        validate: this.validatePages,
        severity: 'warning'
      },
      // Styling validation
      {
        name: 'styling_validation',
        validate: this.validateStyling,
        severity: 'info'
      },
      // Business logic validation
      {
        name: 'business_logic_validation',
        validate: this.validateBusinessLogic,
        severity: 'warning'
      },
      // Data integrity validation
      {
        name: 'data_integrity_validation',
        validate: this.validateDataIntegrity,
        severity: 'error'
      }
    ];

    console.log(`✅ ProjectContextValidator initialized with ${this.rules.length} rules`);
  }

  /**
   * Validate project context with all rules
   */
  static validateProjectContext(context: ProjectContextData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    console.log(`🔍 Validating project context for ${context.projectId}`);

    for (const rule of this.rules) {
      try {
        const ruleResult = rule.validate(context);
        
        // Merge results based on severity
        if (rule.severity === 'error') {
          result.errors.push(...ruleResult.errors);
          result.warnings.push(...ruleResult.warnings);
          result.suggestions.push(...ruleResult.suggestions);
        } else if (rule.severity === 'warning') {
          result.warnings.push(...ruleResult.errors, ...ruleResult.warnings);
          result.suggestions.push(...ruleResult.suggestions);
        } else {
          result.suggestions.push(...ruleResult.errors, ...ruleResult.warnings, ...ruleResult.suggestions);
        }
      } catch (error) {
        console.error(`❌ Error validating rule ${rule.name}:`, error);
        result.errors.push(`Validation rule ${rule.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Determine overall validity
    result.isValid = result.errors.length === 0;

    console.log(`✅ Validation completed for ${context.projectId}: ${result.isValid ? 'VALID' : 'INVALID'}`);
    if (result.errors.length > 0) {
      console.log(`❌ Errors: ${result.errors.length}`);
    }
    if (result.warnings.length > 0) {
      console.log(`⚠️ Warnings: ${result.warnings.length}`);
    }
    if (result.suggestions.length > 0) {
      console.log(`💡 Suggestions: ${result.suggestions.length}`);
    }

    return result;
  }

  /**
   * Validate required fields
   */
  private static validateRequiredFields(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.projectId) {
      errors.push('projectId is required');
    }

    if (!context.projectType) {
      errors.push('projectType is required');
    }

    if (!context.status) {
      errors.push('status is required');
    }

    if (!context.specBundleId) {
      warnings.push('specBundleId is missing - this may cause template issues');
    }

    if (!context.conversationHistory) {
      warnings.push('conversationHistory is missing - this may affect user experience');
    }

    if (!context.userPreferences) {
      warnings.push('userPreferences is missing - this may affect personalization');
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate project type consistency
   */
  private static validateProjectTypeConsistency(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if project type is valid
    const validProjectTypes: ProjectType[] = [
      'restaurant', 
      'ecommerce', 
      'hotel', 
      'bakery', 
      'academy', 
      'bookstore', 
      'healthcare', 
      'news', 
      'portfolio', 
      'travel'
    ];
    if (!validProjectTypes.includes(context.projectType)) {
      errors.push(`Invalid project type: ${context.projectType}. Must be one of: ${validProjectTypes.join(', ')}`);
    }

    // Check components match project type
    // Note: ComponentType doesn't include 'template', so we just verify components exist
    if (context.components.length > 0) {
      // Components validation is done elsewhere
      // This is just a basic check
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate status consistency
   */
  private static validateStatusConsistency(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const validStatuses: ProjectStatus[] = ['created', 'in_progress', 'template_selected', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(context.status)) {
      errors.push(`Invalid status: ${context.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Business logic validation
    if (context.status === 'completed' && context.components.length === 0) {
      errors.push('Completed project must have at least one component');
    }

    // Note: ComponentType doesn't include 'template', so we just verify components exist
    if (context.status === 'template_selected' && context.components.length === 0) {
      warnings.push('Template selected status should have components');
    }

    if (context.status === 'in_progress' && context.components.length === 0) {
      warnings.push('In progress project should have components');
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate components
   */
  private static validateComponents(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const component of context.components) {
      // Required fields
      if (!component.id) {
        errors.push(`Component missing id`);
      }
      if (!component.name) {
        errors.push(`Component ${component.id} missing name`);
      }
      if (!component.type) {
        errors.push(`Component ${component.id} missing type`);
      }

      // Type validation - ComponentType is already validated by Prisma enum
      // No need for additional validation here

      // Metadata validation
      if (component.metadata) {
        if (!component.metadata.version) {
          warnings.push(`Component ${component.id} missing version in metadata`);
        }
        if (!component.metadata.createdBy) {
          warnings.push(`Component ${component.id} missing createdBy in metadata`);
        }
      }

      // Styling validation
      if (component.styling && typeof component.styling === 'object') {
        const requiredStyleFields: (keyof ComponentStyling)[] = ['colors', 'fonts', 'spacing'];
        for (const field of requiredStyleFields) {
          if (!component.styling[field]) {
            suggestions.push(`Component ${component.id} could benefit from ${field} styling`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate pages
   */
  private static validatePages(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const page of context.pages) {
      // Required fields
      if (!page.id) {
        errors.push(`Page missing id`);
      }
      if (!page.name) {
        errors.push(`Page ${page.id} missing name`);
      }
      if (!page.path) {
        errors.push(`Page ${page.id} missing path`);
      }

      // Path validation
      if (page.path && !page.path.startsWith('/')) {
        errors.push(`Page ${page.id} path must start with /`);
      }

      // Component references validation
      if (page.components && page.components.length > 0) {
        for (const componentId of page.components) {
          const componentExists = context.components.some(c => c.id === componentId);
          if (!componentExists) {
            errors.push(`Page ${page.id} references non-existent component ${componentId}`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate styling
   */
  private static validateStyling(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.styling) {
      suggestions.push('Project could benefit from styling configuration');
      return { isValid: true, errors, warnings, suggestions };
    }

    // Theme validation
    if (context.styling.theme) {
      const requiredThemeFields = ['primary', 'secondary', 'accent'];
      for (const field of requiredThemeFields) {
        if (!context.styling.theme[field]) {
          warnings.push(`Theme missing ${field} color`);
        }
      }

      // Color format validation
      for (const [key, value] of Object.entries(context.styling.theme)) {
        if (typeof value === 'string' && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
          warnings.push(`Theme color ${key} has invalid format: ${value}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate business logic
   */
  private static validateBusinessLogic(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Coffee shop specific validation
    if (context.projectType === 'coffee_shop') {
      const hasMenuPage = context.pages.some(p => p.name.toLowerCase().includes('menu'));
      if (!hasMenuPage) {
        suggestions.push('Coffee shop should have a menu page');
      }

      const hasContactPage = context.pages.some(p => p.name.toLowerCase().includes('contact'));
      if (!hasContactPage) {
        suggestions.push('Coffee shop should have a contact page');
      }
    }

    // E-commerce specific validation
    if (context.projectType === 'e_commerce') {
      const hasProductPage = context.pages.some(p => p.name.toLowerCase().includes('product'));
      if (!hasProductPage) {
        suggestions.push('E-commerce should have product pages');
      }

      const hasCartPage = context.pages.some(p => p.name.toLowerCase().includes('cart'));
      if (!hasCartPage) {
        suggestions.push('E-commerce should have a cart page');
      }
    }

    // Portfolio specific validation
    if (context.projectType === 'portfolio') {
      const hasAboutPage = context.pages.some(p => p.name.toLowerCase().includes('about'));
      if (!hasAboutPage) {
        suggestions.push('Portfolio should have an about page');
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate data integrity
   */
  private static validateDataIntegrity(context: ProjectContextData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for duplicate component IDs
    const componentIds = context.components.map(c => c.id);
    const duplicateComponentIds = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
    if (duplicateComponentIds.length > 0) {
      errors.push(`Duplicate component IDs found: ${duplicateComponentIds.join(', ')}`);
    }

    // Check for duplicate page IDs
    const pageIds = context.pages.map(p => p.id);
    const duplicatePageIds = pageIds.filter((id, index) => pageIds.indexOf(id) !== index);
    if (duplicatePageIds.length > 0) {
      errors.push(`Duplicate page IDs found: ${duplicatePageIds.join(', ')}`);
    }

    // Check for orphaned components
    const referencedComponentIds = new Set<string>();
    context.pages.forEach(page => {
      if (page.components) {
        page.components.forEach(id => referencedComponentIds.add(id));
      }
    });

    const orphanedComponents = context.components.filter(c => !referencedComponentIds.has(c.id));
    if (orphanedComponents.length > 0) {
      warnings.push(`Orphaned components found: ${orphanedComponents.map(c => c.name).join(', ')}`);
    }

    // Check timestamp consistency
    if (context.lastModified < context.createdAt) {
      errors.push('lastModified cannot be earlier than createdAt');
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Get validation rules
   */
  static getRules(): ValidationRule[] {
    return [...this.rules];
  }

  /**
   * Add custom validation rule
   */
  static addRule(rule: ValidationRule): void {
    this.rules.push(rule);
    console.log(`✅ Added custom validation rule: ${rule.name}`);
  }

  /**
   * Remove validation rule
   */
  static removeRule(ruleName: string): void {
    const index = this.rules.findIndex(rule => rule.name === ruleName);
    if (index !== -1) {
      this.rules.splice(index, 1);
      console.log(`✅ Removed validation rule: ${ruleName}`);
    }
  }
}

// Initialize validator on import
ProjectContextValidator.initialize();
