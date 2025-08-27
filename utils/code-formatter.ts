import { GeneratedFile } from '@/types/sitegen';

export class CodeFormatter {
  private static prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
  };

  /**
   * จัดรูปแบบโค้ดตาม file type
   */
  static async formatCode(file: GeneratedFile): Promise<GeneratedFile> {
    try {
      let formattedContent = file.content;

      switch (file.language) {
        case 'typescript':
        case 'javascript':
          formattedContent = await this.formatJavaScript(file.content);
          break;
        case 'css':
          formattedContent = await this.formatCSS(file.content);
          break;
        case 'html':
          formattedContent = await this.formatHTML(file.content);
          break;
        case 'json':
          formattedContent = await this.formatJSON(file.content);
          break;
      }

      return {
        ...file,
        content: formattedContent
      };
    } catch (error) {
      console.warn(`Formatting failed for ${file.path}:`, error);
      return file; // Return original if formatting fails
    }
  }

  /**
   * จัดรูปแบบ JavaScript/TypeScript
   */
  private static async formatJavaScript(code: string): Promise<string> {
    // ใช้ simple formatting rules เนื่องจากไม่มี prettier
    return this.formatJavaScriptManually(code);
  }

  /**
   * จัดรูปแบบ JavaScript แบบ manual
   */
  private static formatJavaScriptManually(code: string): string {
    let formatted = code;

    // แก้ไข indentation
    formatted = this.fixIndentation(formatted);

    // แก้ไข semicolons
    formatted = this.fixSemicolons(formatted);

    // แก้ไข quotes
    formatted = this.fixQuotes(formatted);

    // แก้ไข spacing
    formatted = this.fixSpacing(formatted);

    // แก้ไข line breaks
    formatted = this.fixLineBreaks(formatted);

    return formatted;
  }

  /**
   * แก้ไข indentation
   */
  private static fixIndentation(code: string): string {
    const lines = code.split('\n');
    const formattedLines: string[] = [];
    let indentLevel = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        formattedLines.push('');
        continue;
      }

      // ลด indent level สำหรับ closing braces
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // เพิ่ม indentation
      const indent = '  '.repeat(indentLevel);
      formattedLines.push(indent + trimmedLine);

      // เพิ่ม indent level สำหรับ opening braces
      if (trimmedLine.endsWith('{') || trimmedLine.startsWith('<') && !trimmedLine.startsWith('</')) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * แก้ไข semicolons
   */
  private static fixSemicolons(code: string): string {
    // เพิ่ม semicolons ที่หายไป
    return code
      .replace(/([^;{}])\n/g, '$1;\n')
      .replace(/;\s*;\s*/g, ';')
      .replace(/;\s*$/gm, ';');
  }

  /**
   * แก้ไข quotes
   */
  private static fixQuotes(code: string): string {
    // เปลี่ยน double quotes เป็น single quotes (ยกเว้น JSX attributes)
    return code
      .replace(/"([^"]*)"(?=\s*[=:])/g, "'$1'")
      .replace(/"([^"]*)"(?=\s*[,;])/g, "'$1'");
  }

  /**
   * แก้ไข spacing
   */
  private static fixSpacing(code: string): string {
    return code
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*\(\s*/g, ' ( ')
      .replace(/\s*\)\s*/g, ' ) ')
      .replace(/\s*=\s*/g, ' = ')
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*-\s*/g, ' - ')
      .replace(/\s*\*\s*/g, ' * ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*;\s*/g, '; ')
      .replace(/\s*:\s*/g, ': ')
      .replace(/\s*=>\s*/g, ' => ')
      .replace(/\s*<\s*/g, ' < ')
      .replace(/\s*>\s*/g, ' > ')
      .replace(/\s*&&\s*/g, ' && ')
      .replace(/\s*\|\|\s*/g, ' || ')
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s{2,}/g, ' ');
  }

  /**
   * แก้ไข line breaks
   */
  private static fixLineBreaks(code: string): string {
    return code
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/gm, '')
      .trim();
  }

  /**
   * จัดรูปแบบ CSS
   */
  private static async formatCSS(code: string): Promise<string> {
    return this.formatCSSManually(code);
  }

  /**
   * จัดรูปแบบ CSS แบบ manual
   */
  private static formatCSSManually(code: string): string {
    let formatted = code;

    // แก้ไข indentation
    formatted = this.fixIndentation(formatted);

    // แก้ไข spacing ใน CSS
    formatted = formatted
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*:\s*/g, ': ')
      .replace(/\s*;\s*/g, ';\n  ')
      .replace(/\s*,\s*/g, ', ');

    return formatted;
  }

  /**
   * จัดรูปแบบ HTML
   */
  private static async formatHTML(code: string): Promise<string> {
    return this.formatHTMLManually(code);
  }

  /**
   * จัดรูปแบบ HTML แบบ manual
   */
  private static formatHTMLManually(code: string): string {
    let formatted = code;

    // แก้ไข indentation
    formatted = this.fixIndentation(formatted);

    // แก้ไข spacing ใน HTML
    formatted = formatted
      .replace(/\s*<\s*/g, '<')
      .replace(/\s*>\s*/g, '>')
      .replace(/\s*=\s*/g, '="')
      .replace(/"\s*/g, '" ')
      .replace(/\s*\/\s*>/g, ' />');

    return formatted;
  }

  /**
   * จัดรูปแบบ JSON
   */
  private static async formatJSON(code: string): Promise<string> {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.warn('JSON parsing failed, returning original:', error);
      return code;
    }
  }

  /**
   * จัดรูปแบบไฟล์ทั้งหมด
   */
  static async formatAllFiles(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    console.log('🎨 Starting code formatting for', files.length, 'files');
    
    const formattedFiles = await Promise.all(
      files.map(file => this.formatCode(file))
    );

    console.log('✅ Code formatting completed');
    return formattedFiles;
  }

  /**
   * ตรวจสอบและแก้ไข common issues
   */
  static fixCommonIssues(code: string, fileType: string): string {
    let fixed = code;

    // แก้ไข any type (ตาม rule ของคุณ)
    if (fileType === 'typescript') {
      fixed = fixed
        .replace(/: any/g, ': unknown')
        .replace(/as any/g, 'as unknown');
    }

    // แก้ไข missing React import
    if (fileType === 'typescript' && fixed.includes('useState') && !fixed.includes('import React')) {
      fixed = `import React, { useState } from 'react';\n\n${fixed}`;
    }

    // แก้ไข missing key prop
    if (fixed.includes('.map(') && !fixed.includes('key=')) {
      fixed = fixed.replace(
        /\.map\(\(([^,]+)(?:,\s*([^)]+))?\)\s*=>\s*\(/g,
        '.map(($1, index) => ('
      );
    }

    return fixed;
  }
}
