// Schema Validation
// ตรวจสอบว่า user data ตรงกับ concrete manifest schema

import {
  ConcreteManifest,
  ConcreteBlock,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSummary,
  SchemaValidationError
} from './types';

export class SchemaValidator {
  /**
   * ตรวจสอบ User Data กับ Concrete Manifest
   */
  validateUserData(
    userData: Record<string, any>,
    concreteManifest: ConcreteManifest
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let totalFields = 0;
    let validFields = 0;

    // Validate global settings
    this.validateGlobalSettings(userData.global, concreteManifest.globalSettings, errors, warnings);
    const globalFieldCount = this.countGlobalFields(concreteManifest.globalSettings);
    totalFields += globalFieldCount;
    validFields += this.countValidGlobalFields(userData.global, concreteManifest.globalSettings);

    // Validate each block
    for (const block of concreteManifest.blocks) {
      const blockData = userData[this.getBlockDataKey(block.id)];
      const blockValidation = this.validateBlock(block, blockData);
      
      errors.push(...blockValidation.errors);
      warnings.push(...blockValidation.warnings);
      totalFields += Object.keys(block.placeholders).length;
      validFields += blockValidation.validFields;
    }

    const errorFields = errors.length;
    const warningFields = warnings.length;
    const successRate = totalFields > 0 ? (validFields / totalFields) * 100 : 100;

    const summary: ValidationSummary = {
      totalFields,
      validFields,
      errorFields,
      warningFields,
      successRate
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };
  }

  /**
   * ตรวจสอบ Global Settings
   */
  private validateGlobalSettings(
    globalData: any,
    globalSettings: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!globalData) {
      errors.push({
        field: 'global',
        message: 'Global settings are required',
        code: 'MISSING_GLOBAL',
        severity: 'error'
      });
      return;
    }

    // Validate palette
    if (globalData.palette) {
      this.validatePalette(globalData.palette, errors, warnings);
    }

    // Validate tokens
    if (globalData.tokens) {
      this.validateTokens(globalData.tokens, errors, warnings);
    }
  }

  /**
   * ตรวจสอบ Palette
   */
  private validatePalette(
    palette: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const validColors = ['blue', 'green', 'purple', 'pink', 'orange', 'red', 'yellow', 'indigo'];
    const validTones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

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

    // Convert Thai colors to English
    if (palette.primary && thaiColorMap[palette.primary]) {
      palette.primary = thaiColorMap[palette.primary];
    }
    if (palette.secondary && thaiColorMap[palette.secondary]) {
      palette.secondary = thaiColorMap[palette.secondary];
    }

    // Convert color names to bgTone numbers
    if (palette.bgTone && validColors.includes(palette.bgTone)) {
      const colorToToneMap: Record<string, string> = {
        'blue': '100',
        'green': '100', 
        'purple': '100',
        'pink': '100',
        'orange': '100',
        'red': '100',
        'yellow': '100',
        'indigo': '100'
      };
      palette.bgTone = colorToToneMap[palette.bgTone] || '100';
    }

    if (palette.primary) {
      if (!validColors.includes(palette.primary)) {
        errors.push({
          field: 'global.palette.primary',
          message: `Invalid primary color '${palette.primary}'. Must be one of: ${validColors.join(', ')}`,
          code: 'INVALID_COLOR',
          expected: validColors,
          actual: palette.primary,
          severity: 'error'
        });
      }
    } else {
      errors.push({
        field: 'global.palette.primary',
        message: 'Primary color is required',
        code: 'MISSING_REQUIRED',
        severity: 'error'
      });
    }

    if (palette.secondary && !validColors.includes(palette.secondary)) {
      errors.push({
        field: 'global.palette.secondary',
        message: `Invalid secondary color '${palette.secondary}'. Must be one of: ${validColors.join(', ')}`,
        code: 'INVALID_COLOR',
        expected: validColors,
        actual: palette.secondary,
        severity: 'error'
      });
    }

    if (palette.bgTone && !validTones.includes(palette.bgTone)) {
      errors.push({
        field: 'global.palette.bgTone',
        message: `Invalid background tone '${palette.bgTone}'. Must be one of: ${validTones.join(', ')}`,
        code: 'INVALID_TONE',
        expected: validTones,
        actual: palette.bgTone,
        severity: 'error'
      });
    }
  }

  /**
   * ตรวจสอบ Tokens
   */
  private validateTokens(
    tokens: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const validRadius = ['6px', '8px', '10px', '12px', '16px'];
    const validSpacing = ['0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem'];

    if (tokens.radius && !validRadius.includes(tokens.radius)) {
      errors.push({
        field: 'global.tokens.radius',
        message: `Invalid radius '${tokens.radius}'. Must be one of: ${validRadius.join(', ')}`,
        code: 'INVALID_RADIUS',
        expected: validRadius,
        actual: tokens.radius,
        severity: 'error'
      });
    }

    if (tokens.spacing && !validSpacing.includes(tokens.spacing)) {
      errors.push({
        field: 'global.tokens.spacing',
        message: `Invalid spacing '${tokens.spacing}'. Must be one of: ${validSpacing.join(', ')}`,
        code: 'INVALID_SPACING',
        expected: validSpacing,
        actual: tokens.spacing,
        severity: 'error'
      });
    }
  }

  /**
   * ตรวจสอบ Block
   */
  private validateBlock(
    block: ConcreteBlock,
    blockData: any
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; validFields: number } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validFields = 0;

    if (!blockData) {
      errors.push({
        field: block.id,
        message: `Block data for '${block.id}' is required`,
        code: 'MISSING_BLOCK_DATA',
        severity: 'error'
      });
      return { errors, warnings, validFields };
    }

    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      const value = this.getValueFromBlockData(placeholder, blockData);
      const validation = this.validatePlaceholder(placeholder, value, config);
      
      if (validation.isValid) {
        validFields++;
      } else {
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }
    }

    return { errors, warnings, validFields };
  }

  /**
   * ตรวจสอบ Placeholder
   */
  private validatePlaceholder(
    placeholder: string,
    value: any,
    config: any
  ): { isValid: boolean; errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required
    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: placeholder,
        message: `Required placeholder '${placeholder}' is missing`,
        code: 'MISSING_REQUIRED',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      return { isValid: true, errors, warnings };
    }

    // Check type
    if (config.type && !this.validateType(value, config.type)) {
      errors.push({
        field: placeholder,
        message: `Invalid type for '${placeholder}'. Expected ${config.type}, got ${typeof value}`,
        code: 'INVALID_TYPE',
        expected: config.type,
        actual: typeof value,
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Check string length
    if (typeof value === 'string') {
      if (config.maxLength && value.length > config.maxLength) {
        errors.push({
          field: placeholder,
          message: `'${placeholder}' exceeds maximum length of ${config.maxLength} characters`,
          code: 'EXCEEDS_MAX_LENGTH',
          expected: `<= ${config.maxLength}`,
          actual: value.length,
          severity: 'error'
        });
        return { isValid: false, errors, warnings };
      }

      if (config.minLength && value.length < config.minLength) {
        errors.push({
          field: placeholder,
          message: `'${placeholder}' is below minimum length of ${config.minLength} characters`,
          code: 'BELOW_MIN_LENGTH',
          expected: `>= ${config.minLength}`,
          actual: value.length,
          severity: 'error'
        });
        return { isValid: false, errors, warnings };
      }
    }

    // Check enum values
    if (config.enum && !config.enum.includes(value)) {
      errors.push({
        field: placeholder,
        message: `'${placeholder}' must be one of: ${config.enum.join(', ')}`,
        code: 'INVALID_ENUM',
        expected: config.enum,
        actual: value,
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Add warnings for potential issues
    if (typeof value === 'string' && config.maxLength && value.length > config.maxLength * 0.8) {
      warnings.push({
        field: placeholder,
        message: `'${placeholder}' is close to maximum length`,
        suggestion: `Consider shortening to avoid truncation`
      });
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * ตรวจสอบ Type
   */
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'enum':
        return true; // Enum validation is handled separately
      default:
        return true;
    }
  }

  /**
   * ดึงค่าจาก Block Data
   */
  private getValueFromBlockData(placeholder: string, blockData: any): any {
    // Try direct access first
    if (placeholder in blockData) {
      return blockData[placeholder];
    }

    // Try nested access (e.g., "Hero.heading")
    const parts = placeholder.split('.');
    let current = blockData;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * แปลง Block ID เป็น Data Key
   */
  private getBlockDataKey(blockId: string): string {
    // ใช้ block ID โดยตรง เพราะเราได้ส่ง data ด้วย block ID แล้ว
    return blockId;
  }

  /**
   * นับจำนวน Global Fields
   */
  private countGlobalFields(globalSettings: any): number {
    if (!globalSettings) return 0;
    
    let count = 0;
    // Count palette fields
    if (globalSettings.palette) {
      count += Object.keys(globalSettings.palette).length;
    }
    // Count tokens fields
    if (globalSettings.tokens) {
      count += Object.keys(globalSettings.tokens).length;
    }
    return count;
  }

  /**
   * นับจำนวน Global Fields ที่ Valid
   */
  private countValidGlobalFields(data: any, globalSettings: any): number {
    if (!data || !globalSettings) return 0;
    
    let validCount = 0;
    
    // Count valid palette fields
    if (data.palette && globalSettings.palette) {
      for (const key of Object.keys(globalSettings.palette)) {
        if (data.palette[key] !== undefined && data.palette[key] !== null && data.palette[key] !== '') {
          validCount++;
        }
      }
    }
    
    // Count valid tokens fields
    if (data.tokens && globalSettings.tokens) {
      for (const key of Object.keys(globalSettings.tokens)) {
        if (data.tokens[key] !== undefined && data.tokens[key] !== null && data.tokens[key] !== '') {
          validCount++;
        }
      }
    }
    
    return validCount;
  }

  /**
   * นับจำนวน Fields ที่ Valid
   */
  private countValidFields(data: any, schema: any): number {
    if (!data || !schema) return 0;
    
    let validCount = 0;
    for (const key of Object.keys(schema)) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        validCount++;
      }
    }
    return validCount;
  }

  /**
   * สร้าง Validation Summary
   */
  createValidationSummary(result: ValidationResult): string {
    const { summary, errors, warnings } = result;
    
    let summaryText = `Validation Summary:\n`;
    summaryText += `- Total Fields: ${summary.totalFields}\n`;
    summaryText += `- Valid Fields: ${summary.validFields}\n`;
    summaryText += `- Error Fields: ${summary.errorFields}\n`;
    summaryText += `- Warning Fields: ${summary.warningFields}\n`;
    summaryText += `- Success Rate: ${summary.successRate.toFixed(1)}%\n`;
    
    if (errors.length > 0) {
      summaryText += `\nErrors:\n`;
      errors.forEach(error => {
        summaryText += `- ${error.field}: ${error.message}\n`;
      });
    }
    
    if (warnings.length > 0) {
      summaryText += `\nWarnings:\n`;
      warnings.forEach(warning => {
        summaryText += `- ${warning.field}: ${warning.message}\n`;
      });
    }
    
    return summaryText;
  }
}
