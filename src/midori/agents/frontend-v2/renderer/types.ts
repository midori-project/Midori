/**
 * Component Renderer Types
 */

import type { Component, ComponentVariant } from '../component-library/types';
import type { ThemePack } from '../theme-pack/types';

export interface RenderInput {
  component: Component;
  variant?: ComponentVariant;
  props: Record<string, any>;
  themePack: ThemePack;
  globalData?: Record<string, any>;
}

export interface RenderOutput {
  code: string;
  imports: string[];
  fileName: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  metadata: {
    componentId: string;
    variantId?: string;
    linesOfCode: number;
    estimatedSize: number;
  };
}

export interface RenderBatchInput {
  components: RenderInput[];
  themePack: ThemePack;
  projectType: string;
}

export interface RenderBatchOutput {
  files: RenderOutput[];
  globalFiles: {
    fileName: string;
    code: string;
    language: string;
  }[];
  totalSize: number;
  totalComponents: number;
}

