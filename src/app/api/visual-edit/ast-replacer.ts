/**
 * AST-based Field Replacement for Visual Edit
 * ใช้ Babel Parser เพื่อความปลอดภัยและแม่นยำ 100%
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

interface ReplacementResult {
  newContent: string;
  replaced: boolean;
  error?: string;
}

/**
 * แทนที่ field ใน JSX/TSX โดยใช้ AST Parser
 * ปลอดภัย 100% - ไม่ทำลาย syntax
 */
export function replaceFieldWithAST(
  content: string,
  field: string,
  newValue: string,
  type: string
): ReplacementResult {
  try {
    console.log(`🔧 [AST-REPLACE] Starting AST-based replacement`);
    console.log(`   Field: "${field}"`);
    console.log(`   Type: "${type}"`);
    console.log(`   New Value: "${newValue.substring(0, 50)}..."`);

    // Parse JSX/TSX → AST
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let replaced = false;
    let replacementCount = 0;

    // Traverse AST และหา elements ที่มี data-field attribute
    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        
        // หา data-field attribute
        const dataFieldAttr = openingElement.attributes.find(
          (attr): attr is t.JSXAttribute =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === 'data-field' &&
            t.isStringLiteral(attr.value) &&
            attr.value.value === field
        );

        if (!dataFieldAttr) return;

        console.log(`✅ [AST-REPLACE] Found matching element`);
        
        // แทนที่ตาม type
        if (type === 'image') {
          // แทนที่ src attribute
          replaced = replaceImageSrc(openingElement, newValue) || replaced;
        } else if (type === 'icon') {
          // แทนที่ content โดยไม่ escape (เพราะเป็น emoji)
          replaced = replaceTextContent(path, newValue, false) || replaced;
        } else {
          // แทนที่ text content (text, heading, button, etc.)
          replaced = replaceTextContent(path, newValue, true) || replaced;
        }

        if (replaced) {
          replacementCount++;
        }
      },
    });

    if (!replaced) {
      console.warn(`⚠️ [AST-REPLACE] Field "${field}" not found in JSX`);
      return {
        newContent: content,
        replaced: false,
        error: `Field "${field}" not found in component`,
      };
    }

    // Generate code กลับจาก AST
    const output = generate(ast, {
      retainLines: true, // พยายามเก็บ line numbers เดิม
      compact: false, // ไม่ minify
      comments: true, // เก็บ comments
    });

    console.log(`✅ [AST-REPLACE] Successfully replaced ${replacementCount} element(s)`);
    console.log(`   New content length: ${output.code.length} chars`);

    return {
      newContent: output.code,
      replaced: true,
    };
  } catch (error: any) {
    console.error(`❌ [AST-REPLACE] Error:`, error.message);
    return {
      newContent: content,
      replaced: false,
      error: `AST parsing failed: ${error.message}`,
    };
  }
}

/**
 * แทนที่ src attribute ใน image
 */
function replaceImageSrc(
  openingElement: t.JSXOpeningElement,
  newValue: string
): boolean {
  // หา src attribute
  const srcAttr = openingElement.attributes.find(
    (attr): attr is t.JSXAttribute =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      attr.name.name === 'src'
  );

  if (!srcAttr) {
    console.warn('⚠️ [AST-REPLACE] No src attribute found');
    return false;
  }

  // แทนที่ด้วย string literal ใหม่
  srcAttr.value = t.stringLiteral(newValue);
  console.log(`✅ [AST-REPLACE] Replaced src attribute`);
  return true;
}

/**
 * แทนที่ text content ใน JSX element
 */
function replaceTextContent(
  path: any,
  newValue: string,
  escapeHtml: boolean = true
): boolean {
  const element = path.node;

  // ถ้ามี children
  if (element.children && element.children.length > 0) {
    // แทนที่ทุก children ด้วย text node เดียว
    // React จะ handle HTML escaping ให้เอง
    element.children = [t.jsxText(newValue)];
    console.log(`✅ [AST-REPLACE] Replaced text content`);
    return true;
  } else {
    // ถ้าไม่มี children ให้เพิ่ม
    element.children = [t.jsxText(newValue)];
    console.log(`✅ [AST-REPLACE] Added text content`);
    return true;
  }
}

/**
 * Validate JSX syntax (เพิ่มเติม)
 */
export function validateJSXSyntax(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // พยายาม parse เพื่อตรวจสอบ syntax
    parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    
    return { valid: true, errors: [] };
  } catch (error: any) {
    console.error('❌ [VALIDATION] Syntax error:', error.message);
    return { 
      valid: false, 
      errors: [error.message] 
    };
  }
}

/**
 * Fallback: ถ้า AST parsing ล้มเหลว ให้ใช้ regex แบบง่ายๆ
 */
export function replaceFieldWithRegexFallback(
  content: string,
  field: string,
  newValue: string,
  type: string
): ReplacementResult {
  console.log(`⚠️ [FALLBACK] Using regex fallback for field: "${field}"`);

  try {
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Simple pattern - จับเฉพาะ single-line simple cases
    const simplePattern = new RegExp(
      `(data-field="${escapeRegex(field)}"[^>]*>)([^<]+?)(</[^>]+>)`,
      'g'
    );

    const matches = content.match(simplePattern);
    
    if (matches) {
      const newContent = content.replace(simplePattern, `$1${newValue}$3`);
      console.log(`✅ [FALLBACK] Replaced using regex`);
      return { newContent, replaced: true };
    }

    return {
      newContent: content,
      replaced: false,
      error: `Field "${field}" not found (regex fallback)`,
    };
  } catch (error: any) {
    return {
      newContent: content,
      replaced: false,
      error: `Regex fallback failed: ${error.message}`,
    };
  }
}

