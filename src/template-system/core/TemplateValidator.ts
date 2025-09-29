/**
 * TemplateValidator - ตัวตรวจสอบ Template
 * รับผิดชอบในการตรวจสอบความถูกต้องของ template และผลลัพธ์ที่ได้
 */

import { ProcessedFile, TemplateConstraints, ValidationResult } from '../types/Template';

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (files: ProcessedFile[], constraints: TemplateConstraints) => Promise<ValidationIssue[]>;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export class TemplateValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * เริ่มต้น validation rules
   */
  private initializeValidationRules(): void {
    this.rules = [
      {
        name: 'accessibility-check',
        description: 'ตรวจสอบความสามารถในการเข้าถึง',
        severity: 'error',
        check: this.checkAccessibility.bind(this)
      },
      {
        name: 'performance-check',
        description: 'ตรวจสอบประสิทธิภาพ',
        severity: 'warning',
        check: this.checkPerformance.bind(this)
      },
      {
        name: 'content-check',
        description: 'ตรวจสอบเนื้อหา',
        severity: 'warning',
        check: this.checkContent.bind(this)
      },
      {
        name: 'asset-check',
        description: 'ตรวจสอบ assets',
        severity: 'warning',
        check: this.checkAssets.bind(this)
      },
      {
        name: 'security-check',
        description: 'ตรวจสอบความปลอดภัย',
        severity: 'error',
        check: this.checkSecurity.bind(this)
      },
      {
        name: 'code-quality-check',
        description: 'ตรวจสอบคุณภาพโค้ด',
        severity: 'info',
        check: this.checkCodeQuality.bind(this)
      },
      {
        name: 'placeholder-check',
        description: 'ตรวจสอบ placeholder ที่เหลือ',
        severity: 'warning',
        check: this.checkRemainingPlaceholders.bind(this)
      }
    ];
  }

  /**
   * ตรวจสอบ template หลัก
   */
  async validateTemplate(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationResult> {
    console.log(`🔍 [TemplateValidator] เริ่มตรวจสอบ template: ${files.length} ไฟล์`);
    
    const allIssues: ValidationIssue[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // รัน validation rules ทั้งหมด
    for (const rule of this.rules) {
      try {
        console.log(`  🔍 [TemplateValidator] ตรวจสอบ: ${rule.name}`);
        
        const issues = await rule.check(files, constraints);
        allIssues.push(...issues);
        
        // คำนวณคะแนน
        const ruleScore = this.calculateRuleScore(rule, issues);
        totalScore += ruleScore;
        maxScore += this.getMaxRuleScore(rule);
        
        console.log(`  ✅ [TemplateValidator] ตรวจสอบเสร็จ: ${rule.name} (${issues.length} issues)`);
        
      } catch (error) {
        console.error(`  ❌ [TemplateValidator] ข้อผิดพลาดในการตรวจสอบ ${rule.name}:`, error);
        allIssues.push({
          type: 'error',
          message: `Validation rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Please check the validation rule implementation'
        });
      }
    }

    // แยก issues ตามประเภท
    const errors = allIssues.filter(issue => issue.type === 'error');
    const warnings = allIssues.filter(issue => issue.type === 'warning');
    const infos = allIssues.filter(issue => issue.type === 'info');

    // คำนวณคะแนนรวม
    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const isValid = errors.length === 0;

    console.log(`🎉 [TemplateValidator] ตรวจสอบเสร็จสิ้น: ${isValid ? 'ผ่าน' : 'ไม่ผ่าน'} (คะแนน: ${finalScore}/100)`);
    
    return {
      isValid,
      errors: errors.map(issue => issue.message),
      warnings: warnings.map(issue => issue.message),
      score: finalScore
    };
  }

  /**
   * ตรวจสอบความสามารถในการเข้าถึง
   */
  private async checkAccessibility(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const a11yConstraints = constraints.a11y;

    if (!a11yConstraints) return issues;

    for (const file of files) {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx') || file.path.endsWith('.html')) {
        // ตรวจสอบ alt attributes
        if (!file.content.includes('alt=') && file.content.includes('<img')) {
          issues.push({
            type: 'error',
            message: 'Images missing alt attributes',
            file: file.path,
            suggestion: 'Add alt attributes to all images for accessibility'
          });
        }

        // ตรวจสอบ aria labels
        if (a11yConstraints.ariaRequired && !file.content.includes('aria-') && file.content.includes('<button')) {
          issues.push({
            type: 'error',
            message: 'Interactive elements missing aria labels',
            file: file.path,
            suggestion: 'Add aria labels to buttons and interactive elements'
          });
        }

        // ตรวจสอบ heading structure
        const h1Count = (file.content.match(/<h1/g) || []).length;
        if (h1Count === 0 && file.path.includes('Home')) {
          issues.push({
            type: 'error',
            message: 'Missing H1 heading',
            file: file.path,
            suggestion: 'Add an H1 heading to the main page'
          });
        }

        // ตรวจสอบ font size
        if (file.content.includes('text-xs') && a11yConstraints.minFontSizePx > 12) {
          issues.push({
            type: 'warning',
            message: 'Font size may be too small for accessibility',
            file: file.path,
            suggestion: `Use font size at least ${a11yConstraints.minFontSizePx}px`
          });
        }
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบประสิทธิภาพ
   */
  private async checkPerformance(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const perfConstraints = constraints.performance;

    if (!perfConstraints) return issues;

    // ตรวจสอบขนาดไฟล์
    for (const file of files) {
      if (file.path.endsWith('.css') && file.size > perfConstraints.maxCriticalCssKb * 1024) {
        issues.push({
          type: 'warning',
          message: `CSS file too large: ${Math.round(file.size / 1024)}KB (max: ${perfConstraints.maxCriticalCssKb}KB)`,
          file: file.path,
          suggestion: 'Consider splitting CSS or removing unused styles'
        });
      }

      if (file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i) && file.size > perfConstraints.maxImageKb * 1024) {
        issues.push({
          type: 'warning',
          message: `Image file too large: ${Math.round(file.size / 1024)}KB (max: ${perfConstraints.maxImageKb}KB)`,
          file: file.path,
          suggestion: 'Optimize image size or use WebP format'
        });
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบเนื้อหา
   */
  private async checkContent(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const contentConstraints = constraints.content;

    if (!contentConstraints) return issues;

    for (const file of files) {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        // ตรวจสอบ title length
        const titleMatch = file.content.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          const title = titleMatch[1];
          if (title.length > contentConstraints.seo.titleMaxLen) {
            issues.push({
              type: 'warning',
              message: `Title too long: ${title.length} characters (max: ${contentConstraints.seo.titleMaxLen})`,
              file: file.path,
              suggestion: 'Shorten the title for better SEO'
            });
          }
        }

        // ตรวจสอบ meta description
        const descMatch = file.content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (descMatch) {
          const description = descMatch[1];
          if (description.length > contentConstraints.seo.descMaxLen) {
            issues.push({
              type: 'warning',
              message: `Meta description too long: ${description.length} characters (max: ${contentConstraints.seo.descMaxLen})`,
              file: file.path,
              suggestion: 'Shorten the meta description for better SEO'
            });
          }
        }

        // ตรวจสอบ required meta tags
        for (const metaTag of contentConstraints.seo.metaTags) {
          if (!file.content.includes(metaTag)) {
            issues.push({
              type: 'warning',
              message: `Missing required meta tag: ${metaTag}`,
              file: file.path,
              suggestion: `Add ${metaTag} meta tag for better social sharing`
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบ assets
   */
  private async checkAssets(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const assetConstraints = constraints.assets;

    if (!assetConstraints) return issues;

    for (const file of files) {
      if (file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // ตรวจสอบขนาดรูปภาพตาม constraints
        for (const [constraintKey, constraint] of Object.entries(assetConstraints)) {
          if (constraintKey.includes(file.path) || file.path.includes(constraintKey)) {
            if (constraint.minWidth) {
              // ในความเป็นจริงต้องตรวจสอบขนาดจริงของรูปภาพ
              // ที่นี่เราจะตรวจสอบจากชื่อไฟล์หรือ metadata
              issues.push({
                type: 'info',
                message: `Image constraint check: ${constraintKey}`,
                file: file.path,
                suggestion: `Ensure image meets minimum width of ${constraint.minWidth}px`
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบความปลอดภัย
   */
  private async checkSecurity(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const securityConstraints = constraints.security;

    if (!securityConstraints) return issues;

    for (const file of files) {
      // ตรวจสอบ inline scripts
      if (securityConstraints.disallowInlineScript) {
        if (file.content.includes('<script>') && !file.content.includes('src=')) {
          issues.push({
            type: 'error',
            message: 'Inline scripts detected',
            file: file.path,
            suggestion: 'Move inline scripts to external files for better security'
          });
        }
      }

      // ตรวจสอบ dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/g,
        /innerHTML\s*=/g,
        /document\.write/g,
        /javascript:/g
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(file.content)) {
          issues.push({
            type: 'warning',
            message: 'Potentially dangerous code pattern detected',
            file: file.path,
            suggestion: 'Review and sanitize user input to prevent XSS attacks'
          });
        }
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบคุณภาพโค้ด
   */
  private async checkCodeQuality(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const codeConstraints = constraints.code;

    if (!codeConstraints) return issues;

    for (const file of files) {
      if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        // ตรวจสอบ TypeScript
        if (codeConstraints.tsc) {
          // ตรวจสอบ any types
          if (file.content.includes(': any')) {
            issues.push({
              type: 'info',
              message: 'TypeScript any type detected',
              file: file.path,
              suggestion: 'Consider using more specific types instead of any'
            });
          }

          // ตรวจสอบ unused imports
          const importLines = file.content.match(/^import.*from.*$/gm) || [];
          for (const importLine of importLines) {
            const importedItems = importLine.match(/import\s*\{([^}]+)\}/);
            if (importedItems) {
              const items = importedItems[1].split(',').map(item => item.trim());
              for (const item of items) {
                if (!file.content.includes(item) && !item.includes(' as ')) {
                  issues.push({
                    type: 'info',
                    message: `Unused import: ${item}`,
                    file: file.path,
                    suggestion: `Remove unused import: ${item}`
                  });
                }
              }
            }
          }
        }
      }

      // ตรวจสอบ console.log
      if (file.content.includes('console.log')) {
        issues.push({
          type: 'info',
          message: 'Console.log statements found',
          file: file.path,
          suggestion: 'Remove console.log statements before production'
        });
      }
    }

    return issues;
  }

  /**
   * ตรวจสอบ placeholder ที่เหลือ
   */
  private async checkRemainingPlaceholders(files: ProcessedFile[], constraints: TemplateConstraints): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    for (const file of files) {
      // ตรวจสอบ placeholder patterns
      const placeholderPatterns = [
        /<tw\/>/g,
        /<text\/>/g,
        /<img\/>/g,
        /<data\s+key="[^"]+"\/>/g,
        /\{\{\s*[^}]+\s*\}\}/g
      ];

      for (const pattern of placeholderPatterns) {
        const matches = file.content.match(pattern);
        if (matches) {
          issues.push({
            type: 'warning',
            message: `Unreplaced placeholders found: ${matches.length} instances`,
            file: file.path,
            suggestion: 'Ensure all placeholders are properly replaced with actual content'
          });
        }
      }
    }

    return issues;
  }

  /**
   * คำนวณคะแนนของ rule
   */
  private calculateRuleScore(rule: ValidationRule, issues: ValidationIssue[]): number {
    const errorCount = issues.filter(issue => issue.type === 'error').length;
    const warningCount = issues.filter(issue => issue.type === 'warning').length;
    const infoCount = issues.filter(issue => issue.type === 'info').length;

    // คะแนนเริ่มต้น
    let score = 100;

    // ลบคะแนนตาม severity
    score -= errorCount * 20;    // error ลบ 20 คะแนน
    score -= warningCount * 10;  // warning ลบ 10 คะแนน
    score -= infoCount * 5;      // info ลบ 5 คะแนน

    return Math.max(0, score);
  }

  /**
   * คะแนนสูงสุดของ rule
   */
  private getMaxRuleScore(rule: ValidationRule): number {
    return 100; // ทุก rule มีคะแนนสูงสุด 100
  }

  /**
   * ตรวจสอบไฟล์เดียว
   */
  async validateFile(file: ProcessedFile, constraints: TemplateConstraints): Promise<ValidationResult> {
    return this.validateTemplate([file], constraints);
  }

  /**
   * ตรวจสอบ constraints เฉพาะ
   */
  async validateConstraints(files: ProcessedFile[], constraintType: keyof TemplateConstraints): Promise<ValidationResult> {
    const constraints: TemplateConstraints = {};
    constraints[constraintType] = (constraints as any)[constraintType];
    
    return this.validateTemplate(files, constraints);
  }

  /**
   * เพิ่ม validation rule ใหม่
   */
  addValidationRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * ลบ validation rule
   */
  removeValidationRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  /**
   * รายการ validation rules
   */
  getValidationRules(): ValidationRule[] {
    return [...this.rules];
  }
}
