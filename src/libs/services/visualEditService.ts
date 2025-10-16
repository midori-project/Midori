/**
 * Visual Edit Service
 * จัดการการอัปเดต visual edit และ override management
 */

import { OverrideConfig } from '@/midori/agents/frontend-v2/template-system/override-system/types';

export interface VisualEditUpdate {
  projectId: string;
  blockId: string;
  field: string;
  value: any;
  type?: 'text' | 'heading' | 'subheading' | 'button' | 'image';
  itemIndex?: number; // สำหรับ array items
}

export interface PatchOperation {
  type: 'insert' | 'delete' | 'replace';
  line: number;
  content: string;
  oldContent?: string;
}

export interface ParsedFieldPath {
  field: string;
  index?: number;
  subfield?: string;
}

export class VisualEditService {
  
  /**
   * อัปเดตค่า placeholder - ใช้ Visual Edit API
   * อ่านจาก Daytona → แก้ไข → เขียนกลับ Daytona (HMR) → บันทึก DB
   */
  async updateField(
    update: VisualEditUpdate, 
    sandboxId: string
  ): Promise<boolean> {
    try {
      console.log('🎨 [VISUAL-EDIT-SERVICE] Calling Visual Edit API...');
      console.log('   Project:', update.projectId);
      console.log('   Sandbox:', sandboxId);
      console.log('   Block:', update.blockId);
      console.log('   Field:', update.field);
      console.log('   Value:', update.value?.substring?.(0, 50) || update.value);
      
      const response = await fetch('/api/visual-edit/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandboxId,
          projectId: update.projectId,
          blockId: update.blockId,
          field: update.field,
          value: update.value,
          type: update.type || 'text'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [ERROR] Visual Edit API failed:', error);
        return false;
      }
      
      const result = await response.json();
      console.log('✅ [SUCCESS] Visual edit applied!');
      console.log('   Component:', result.componentPath);
      console.log('   Field:', result.field);
      console.log('   Saved to DB:', result.savedToDatabase);
      console.log('   Message:', result.message);
      
      return result.success;
      
    } catch (error) {
      console.error('❌ [ERROR] Exception:', error);
      return false;
    }
  }
  
  /**
   * Merge overrides
   * รวม override ใหม่เข้ากับ override เดิม
   */
  mergeOverrides(
    existing: OverrideConfig[],
    newOverride: OverrideConfig
  ): OverrideConfig[] {
    // Ensure existing overrides have customizations field
    const normalizedExisting = existing.map(o => ({
      blockId: o.blockId,
      customizations: o.customizations || {},
      variantId: o.variantId,
      templateOverrides: o.templateOverrides,
      placeholderOverrides: o.placeholderOverrides,
      priority: o.priority
    }));
    
    const merged = [...normalizedExisting];
    
    const existingIndex = merged.findIndex(
      o => o.blockId === newOverride.blockId
    );
    
    if (existingIndex >= 0) {
      // Merge with existing
      merged[existingIndex] = {
        blockId: newOverride.blockId,
        customizations: {
          ...merged[existingIndex].customizations,
          ...newOverride.customizations
        },
        variantId: newOverride.variantId || merged[existingIndex].variantId,
        templateOverrides: {
          ...merged[existingIndex].templateOverrides,
          ...newOverride.templateOverrides
        },
        placeholderOverrides: {
          ...merged[existingIndex].placeholderOverrides,
          ...newOverride.placeholderOverrides
        },
        priority: newOverride.priority || merged[existingIndex].priority
      };
    } else {
      // Add new
      merged.push(newOverride);
    }
    
    return merged;
  }

  /**
   * Parse field path สำหรับ array items
   * เช่น "menuItems[0].name" → { field: "menuItems", index: 0, subfield: "name" }
   */
  parseFieldPath(field: string): ParsedFieldPath {
    // Pattern: arrayName[index].subfield
    const arrayMatch = field.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
    if (arrayMatch) {
      return {
        field: arrayMatch[1],
        index: parseInt(arrayMatch[2]),
        subfield: arrayMatch[3]
      };
    }
    
    // Simple field
    return { field };
  }

  /**
   * สร้าง override value สำหรับ array item
   */
  createArrayItemOverride(
    existingArray: any[],
    index: number,
    subfield: string,
    value: any
  ): any[] {
    // Clone array
    const updatedArray = [...existingArray];
    
    // อัปเดต item
    if (!updatedArray[index]) {
      updatedArray[index] = {};
    }
    
    if (typeof updatedArray[index] === 'object') {
      updatedArray[index] = {
        ...updatedArray[index],
        [subfield]: value
      };
    }
    
    return updatedArray;
  }

  /**
   * Validate update data
   */
  validateUpdate(update: VisualEditUpdate): { valid: boolean; error?: string } {
    if (!update.projectId) {
      return { valid: false, error: 'Missing projectId' };
    }
    
    if (!update.blockId) {
      return { valid: false, error: 'Missing blockId' };
    }
    
    if (!update.field) {
      return { valid: false, error: 'Missing field' };
    }
    
    if (update.value === undefined || update.value === null) {
      return { valid: false, error: 'Missing value' };
    }
    
    return { valid: true };
  }
}

// Singleton instance
export const visualEditService = new VisualEditService();

