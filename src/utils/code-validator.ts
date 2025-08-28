import { GeneratedFile } from '@/types/sitegen';

export class CodeValidator {
  
  /**
   * ตรวจสอบคุณภาพของโค้ด
   */
  static validateCodeQuality(files: GeneratedFile[]): {
    score: number;
    issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }>;
  } {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    files.forEach(file => {
      // ตรวจสอบ TypeScript errors
      if (file.language === 'typescript') {
        const tsIssues = this.validateTypeScript(file);
        issues.push(...tsIssues);
      }

      // ตรวจสอบ React best practices
      if (file.content.includes('React') || file.content.includes('useState')) {
        const reactIssues = this.validateReact(file);
        issues.push(...reactIssues);
      }

      // ตรวจสอบ accessibility
      const a11yIssues = this.validateAccessibility(file);
      issues.push(...a11yIssues);

      // ตรวจสอบ performance
      const perfIssues = this.validatePerformance(file);
      issues.push(...perfIssues);

      // ตรวจสอบ code structure
      const structureIssues = this.validateCodeStructure(file);
      issues.push(...structureIssues);
    });

    // คำนวณ score
    const totalIssues = issues.length;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 2));

    return { score, issues };
  }

  /**
   * ตรวจสอบ TypeScript
   */
  private static validateTypeScript(file: GeneratedFile): Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }> {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    // ตรวจสอบ any type (ตาม rule ของคุณ)
    if (file.content.includes(': any')) {
      issues.push({
        file: file.path,
        type: 'error',
        message: 'Avoid using "any" type. Use proper TypeScript types instead.',
        line: this.findLineNumber(file.content, ': any')
      });
    }

    // ตรวจสอบ missing types
    if (file.content.includes('function') && !file.content.includes(': ')) {
      issues.push({
        file: file.path,
        type: 'warning',
        message: 'Consider adding explicit return types to functions.',
        line: this.findLineNumber(file.content, 'function')
      });
    }

    // ตรวจสอบ unused imports
    const importMatches = file.content.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g);
    if (importMatches) {
      importMatches.forEach(importStatement => {
        const imports = importStatement.match(/import\s+{([^}]+)}\s+from/)?.[1];
        if (imports) {
          const importList = imports.split(',').map(i => i.trim());
          importList.forEach(importName => {
            if (!file.content.includes(importName) || file.content.indexOf(importName) === file.content.indexOf(importStatement)) {
              issues.push({
                file: file.path,
                type: 'warning',
                message: `Unused import: ${importName}`,
                line: this.findLineNumber(file.content, importStatement)
              });
            }
          });
        }
      });
    }

    return issues;
  }

  /**
   * ตรวจสอบ React Best Practices
   */
  private static validateReact(file: GeneratedFile): Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }> {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    // ตรวจสอบ missing key prop
    if (file.content.includes('.map(') && !file.content.includes('key=')) {
      issues.push({
        file: file.path,
        type: 'warning',
        message: 'Add "key" prop when mapping over arrays in React.',
        line: this.findLineNumber(file.content, '.map(')
      });
    }

    // ตรวจสอบ missing dependencies in useEffect
    if (file.content.includes('useEffect') && file.content.includes('[]')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Review useEffect dependencies array.',
        line: this.findLineNumber(file.content, 'useEffect')
      });
    }

    // ตรวจสอบ missing React import
    if (file.content.includes('useState') && !file.content.includes('import React')) {
      issues.push({
        file: file.path,
        type: 'error',
        message: 'Missing React import for useState hook.',
        line: this.findLineNumber(file.content, 'useState')
      });
    }

    // ตรวจสอบ component naming convention
    const componentMatches = file.content.match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const componentName = match.match(/function\s+([A-Z][a-zA-Z0-9]*)/)?.[1];
        if (componentName && !componentName.endsWith('Component') && componentName.length < 3) {
          issues.push({
            file: file.path,
            type: 'warning',
            message: `Component name "${componentName}" should be more descriptive.`,
            line: this.findLineNumber(file.content, match)
          });
        }
      });
    }

    return issues;
  }

  /**
   * ตรวจสอบ Accessibility
   */
  private static validateAccessibility(file: GeneratedFile): Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }> {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    // ตรวจสอบ missing alt attributes
    if (file.content.includes('<img') && !file.content.includes('alt=')) {
      issues.push({
        file: file.path,
        type: 'warning',
        message: 'Add "alt" attribute to images for accessibility.',
        line: this.findLineNumber(file.content, '<img')
      });
    }

    // ตรวจสอบ semantic HTML
    if (file.content.includes('<div') && file.content.includes('onClick')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider using semantic HTML elements like <button> instead of <div> with onClick.',
        line: this.findLineNumber(file.content, '<div')
      });
    }

    // ตรวจสอบ missing aria labels
    if (file.content.includes('aria-') && !file.content.includes('aria-label=')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider adding aria-label for better accessibility.',
        line: this.findLineNumber(file.content, 'aria-')
      });
    }

    return issues;
  }

  /**
   * ตรวจสอบ Performance
   */
  private static validatePerformance(file: GeneratedFile): Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }> {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    // ตรวจสอบ inline styles
    if (file.content.includes('style={{')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider using CSS classes instead of inline styles for better performance.',
        line: this.findLineNumber(file.content, 'style={{')
      });
    }

    // ตรวจสอบ missing memoization
    if (file.content.includes('useState') && file.content.includes('useEffect') && !file.content.includes('useMemo')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider using useMemo for expensive calculations.',
        line: this.findLineNumber(file.content, 'useState')
      });
    }

    // ตรวจสอบ large components
    const lines = file.content.split('\n').length;
    if (lines > 100) {
      issues.push({
        file: file.path,
        type: 'warning',
        message: `Component is quite large (${lines} lines). Consider breaking it into smaller components.`,
        line: 1
      });
    }

    return issues;
  }

  /**
   * ตรวจสอบ Code Structure
   */
  private static validateCodeStructure(file: GeneratedFile): Array<{
    file: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }> {
    const issues: Array<{
      file: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }> = [];

    // ตรวจสอบ file naming convention
    if (file.path.includes('.tsx') && !file.path.match(/[A-Z][a-zA-Z0-9]*\.tsx$/)) {
      issues.push({
        file: file.path,
        type: 'warning',
        message: 'Component files should use PascalCase naming convention.',
        line: 1
      });
    }

    // ตรวจสอบ missing exports
    if (file.content.includes('function') && !file.content.includes('export')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider adding export statement for reusable functions.',
        line: this.findLineNumber(file.content, 'function')
      });
    }

    // ตรวจสอบ comments
    if (file.content.length > 500 && !file.content.includes('//') && !file.content.includes('/*')) {
      issues.push({
        file: file.path,
        type: 'info',
        message: 'Consider adding comments to explain complex logic.',
        line: 1
      });
    }

    return issues;
  }

  /**
   * หา line number ของ pattern
   */
  private static findLineNumber(content: string, pattern: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * แก้ไข issues อัตโนมัติ
   */
  static autoFixIssues(files: GeneratedFile[]): GeneratedFile[] {
    return files.map(file => {
      let fixedContent = file.content;

      // แก้ไข any type
      fixedContent = fixedContent
        .replace(/: any/g, ': unknown')
        .replace(/as any/g, 'as unknown');

      // แก้ไข missing React import
      if (file.language === 'typescript' && fixedContent.includes('useState') && !fixedContent.includes('import React')) {
        fixedContent = `import React, { useState } from 'react';\n\n${fixedContent}`;
      }

      // แก้ไข missing key prop
      if (fixedContent.includes('.map(') && !fixedContent.includes('key=')) {
        fixedContent = fixedContent.replace(
          /\.map\(\(([^,]+)(?:,\s*([^)]+))?\)\s*=>\s*\(/g,
          '.map(($1, index) => ('
        );
      }

      return {
        ...file,
        content: fixedContent
      };
    });
  }
}
