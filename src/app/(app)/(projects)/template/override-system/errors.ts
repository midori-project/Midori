// Error Handling
// จัดการ errors และ exceptions ในระบบ Override

import {
  OverrideError,
  SchemaValidationError,
  TemplateRenderError,
  ManifestResolutionError
} from './types';

// ===== Custom Error Classes =====

export class ValidationError extends OverrideError {
  constructor(
    message: string,
    public field: string,
    public validationCode: string,
    public details?: any
  ) {
    super(message, 'VALIDATION_ERROR', { field, validationCode, details });
    this.name = 'ValidationError';
  }
}

export class AIResponseError extends OverrideError {
  constructor(
    message: string,
    public prompt: string,
    public response?: any
  ) {
    super(message, 'AI_RESPONSE_ERROR', { prompt, response });
    this.name = 'AIResponseError';
  }
}

export class FileGenerationError extends OverrideError {
  constructor(
    message: string,
    public fileName: string,
    public content?: string
  ) {
    super(message, 'FILE_GENERATION_ERROR', { fileName, content });
    this.name = 'FileGenerationError';
  }
}

export class ConfigurationError extends OverrideError {
  constructor(
    message: string,
    public configType: string,
    public configValue?: any
  ) {
    super(message, 'CONFIGURATION_ERROR', { configType, configValue });
    this.name = 'ConfigurationError';
  }
}

// ===== Error Factory =====

export class ErrorFactory {
  /**
   * สร้าง Validation Error
   */
  static createValidationError(
    field: string,
    message: string,
    validationCode: string,
    details?: any
  ): ValidationError {
    return new ValidationError(message, field, validationCode, details);
  }

  /**
   * สร้าง Schema Validation Error
   */
  static createSchemaValidationError(
    field: string,
    message: string,
    expected: any,
    actual: any
  ): SchemaValidationError {
    return new SchemaValidationError(message, field, expected, actual);
  }

  /**
   * สร้าง Template Render Error
   */
  static createTemplateRenderError(
    message: string,
    blockId: string,
    template: string
  ): TemplateRenderError {
    return new TemplateRenderError(message, blockId, template);
  }

  /**
   * สร้าง Manifest Resolution Error
   */
  static createManifestResolutionError(
    message: string,
    businessCategoryId: string,
    blockId?: string
  ): ManifestResolutionError {
    return new ManifestResolutionError(message, businessCategoryId, blockId);
  }

  /**
   * สร้าง AI Response Error
   */
  static createAIResponseError(
    message: string,
    prompt: string,
    response?: any
  ): AIResponseError {
    return new AIResponseError(message, prompt, response);
  }

  /**
   * สร้าง File Generation Error
   */
  static createFileGenerationError(
    message: string,
    fileName: string,
    content?: string
  ): FileGenerationError {
    return new FileGenerationError(message, fileName, content);
  }

  /**
   * สร้าง Configuration Error
   */
  static createConfigurationError(
    message: string,
    configType: string,
    configValue?: any
  ): ConfigurationError {
    return new ConfigurationError(message, configType, configValue);
  }
}

// ===== Error Handler =====

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{
    timestamp: string;
    error: OverrideError;
    context?: any;
  }> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * จัดการ Error
   */
  handleError(error: Error, context?: any): void {
    const timestamp = new Date().toISOString();
    
    // Log error
    this.errorLog.push({
      timestamp,
      error: error as OverrideError,
      context
    });

    // Log to console
    console.error(`[${timestamp}] Error:`, {
      name: error.name,
      message: error.message,
      code: (error as OverrideError).code,
      details: (error as OverrideError).details,
      context
    });

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  /**
   * สร้าง Error Message ที่เป็นมิตรกับผู้ใช้
   */
  createUserFriendlyMessage(error: OverrideError): string {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return `Validation failed for field '${(error as ValidationError).field}': ${error.message}`;
      
      case 'SCHEMA_VALIDATION_ERROR':
        return `Schema validation failed: ${error.message}`;
      
      case 'TEMPLATE_RENDER_ERROR':
        return `Failed to render template: ${error.message}`;
      
      case 'MANIFEST_RESOLUTION_ERROR':
        return `Failed to resolve manifest: ${error.message}`;
      
      case 'AI_RESPONSE_ERROR':
        return `AI response error: ${error.message}`;
      
      case 'FILE_GENERATION_ERROR':
        return `Failed to generate file: ${error.message}`;
      
      case 'CONFIGURATION_ERROR':
        return `Configuration error: ${error.message}`;
      
      default:
        return `An error occurred: ${error.message}`;
    }
  }

  /**
   * ตรวจสอบว่า Error สามารถ Retry ได้หรือไม่
   */
  canRetry(error: OverrideError): boolean {
    const retryableCodes = [
      'AI_RESPONSE_ERROR',
      'TEMPLATE_RENDER_ERROR',
      'FILE_GENERATION_ERROR'
    ];
    
    return retryableCodes.includes(error.code);
  }

  /**
   * สร้าง Retry Strategy
   */
  createRetryStrategy(error: OverrideError): {
    maxRetries: number;
    delayMs: number;
    backoffMultiplier: number;
  } {
    switch (error.code) {
      case 'AI_RESPONSE_ERROR':
        return { maxRetries: 3, delayMs: 1000, backoffMultiplier: 2 };
      
      case 'TEMPLATE_RENDER_ERROR':
        return { maxRetries: 2, delayMs: 500, backoffMultiplier: 1.5 };
      
      case 'FILE_GENERATION_ERROR':
        return { maxRetries: 1, delayMs: 200, backoffMultiplier: 1 };
      
      default:
        return { maxRetries: 0, delayMs: 0, backoffMultiplier: 1 };
    }
  }

  /**
   * ดึง Error Log
   */
  getErrorLog(): Array<{
    timestamp: string;
    error: OverrideError;
    context?: any;
  }> {
    return [...this.errorLog];
  }

  /**
   * ล้าง Error Log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * ดึง Errors ตาม Code
   */
  getErrorsByCode(code: string): Array<{
    timestamp: string;
    error: OverrideError;
    context?: any;
  }> {
    return this.errorLog.filter(entry => entry.error.code === code);
  }

  /**
   * ดึง Errors ตาม Time Range
   */
  getErrorsByTimeRange(startTime: string, endTime: string): Array<{
    timestamp: string;
    error: OverrideError;
    context?: any;
  }> {
    return this.errorLog.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }
}

// ===== Error Recovery =====

export class ErrorRecovery {
  /**
   * พยายามแก้ไข Error อัตโนมัติ
   */
  static async attemptRecovery(error: OverrideError, context?: any): Promise<boolean> {
    const errorHandler = ErrorHandler.getInstance();
    
    if (!errorHandler.canRetry(error)) {
      return false;
    }

    const strategy = errorHandler.createRetryStrategy(error);
    
    for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
      try {
        await this.delay(strategy.delayMs * Math.pow(strategy.backoffMultiplier, attempt - 1));
        
        // Attempt recovery based on error type
        const recovered = await this.performRecovery(error, context, attempt);
        if (recovered) {
          console.log(`Error recovered on attempt ${attempt}`);
          return true;
        }
      } catch (recoveryError) {
        console.warn(`Recovery attempt ${attempt} failed:`, recoveryError);
      }
    }

    return false;
  }

  /**
   * ทำการ Recovery ตาม Error Type
   */
  private static async performRecovery(
    error: OverrideError,
    context: any,
    attempt: number
  ): Promise<boolean> {
    switch (error.code) {
      case 'AI_RESPONSE_ERROR':
        // Retry AI call with modified prompt
        return await this.retryAICall(context, attempt);
      
      case 'TEMPLATE_RENDER_ERROR':
        // Retry template rendering with fallback
        return await this.retryTemplateRender(context, attempt);
      
      case 'FILE_GENERATION_ERROR':
        // Retry file generation
        return await this.retryFileGeneration(context, attempt);
      
      default:
        return false;
    }
  }

  /**
   * Retry AI Call
   */
  private static async retryAICall(context: any, attempt: number): Promise<boolean> {
    // Implementation would depend on the AI service
    // This is a placeholder
    return false;
  }

  /**
   * Retry Template Render
   */
  private static async retryTemplateRender(context: any, attempt: number): Promise<boolean> {
    // Implementation would retry template rendering
    // This is a placeholder
    return false;
  }

  /**
   * Retry File Generation
   */
  private static async retryFileGeneration(context: any, attempt: number): Promise<boolean> {
    // Implementation would retry file generation
    // This is a placeholder
    return false;
  }

  /**
   * Delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== Export All =====

export {
  OverrideError,
  SchemaValidationError,
  TemplateRenderError,
  ManifestResolutionError
} from './types';
