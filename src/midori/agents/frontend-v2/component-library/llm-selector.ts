/**
 * LLM-Enhanced Component Selector
 * Uses AI to understand user intent and select optimal components
 */

import OpenAI from 'openai';
import { config } from 'dotenv';
import { ComponentRegistryManager } from './registry';
import type {
  SelectionContext,
  ComponentSelection,
  SelectedComponent,
  ComponentScore,
  ComponentDefinition,
  ComponentVariant
} from './types';

// Load environment variables
config({ path: "../../../../.env" });

export interface LLMAnalysisResult {
  businessCategory: string;
  style: string[];
  tone: string;
  features: string[];
  colorScheme?: string;
  layoutStyle?: string;
  complexity?: string;
  confidence: number;
  reasoning: string;
}

export interface LLMComponentRecommendation {
  componentId: string;
  variantId: string;
  slotId: string;
  score: number;
  reasoning: string;
}

export class LLMEnhancedSelector {
  private registry: ComponentRegistryManager;
  private openai: OpenAI | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.registry = ComponentRegistryManager.getInstance();
    this.initializeOpenAI();
  }

  /**
   * Initialize OpenAI client
   */
  private initializeOpenAI() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.log('⚠️ OPENAI_API_KEY not found, LLM features will be disabled');
        return;
      }

      this.openai = new OpenAI({ 
        apiKey,
        timeout: 300000,
      });
      
      this.isInitialized = true;
      console.log('✅ LLM-Enhanced Selector initialized');
    } catch (error) {
      console.error('❌ Failed to initialize LLM-Enhanced Selector:', error);
    }
  }

  /**
   * Analyze user input using LLM to extract intent
   */
  async analyzeUserIntent(userInput: string, keywords: string[]): Promise<LLMAnalysisResult | null> {
    if (!this.isInitialized || !this.openai) {
      console.log('⚠️ LLM not available, skipping intent analysis');
      return null;
    }

    try {
      const prompt = `วิเคราะห์ความต้องการของผู้ใช้จากข้อความต่อไปนี้:

Input: "${userInput}"
Keywords: ${keywords.join(', ')}

โปรดวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น:

{
  "businessCategory": "ประเภทธุรกิจ (restaurant/ecommerce/portfolio/healthcare/pharmacy)",
  "style": ["สไตล์ที่ต้องการ เช่น modern, minimal, luxury, classic, creative"],
  "tone": "โทนสี (friendly/professional/luxury/playful)",
  "features": ["ฟีเจอร์ที่ต้องการ เช่น menu, contact, about, gallery, products"],
  "colorScheme": "โทนสี (warm/cool/neutral/vibrant)",
  "layoutStyle": "รูปแบบ layout (modern/classic/minimal)",
  "complexity": "ความซับซ้อน (simple/moderate/complex)",
  "confidence": 0.0-1.0,
  "reasoning": "เหตุผลการวิเคราะห์"
}

ตัวอย่าง:
- "ร้านอาหารญี่ปุ่น สไตล์เรียบหรู" → style: ["luxury", "minimal"], tone: "professional"
- "ร้านขายหนังสือออนไลน์ โทนสีน้ำเงิน" → businessCategory: "ecommerce", colorScheme: "cool"
- "restaurant modern clean design" → style: ["modern", "minimal"], tone: "professional"

สำคัญ:
1. รองรับทั้งภาษาไทยและอังกฤษ
2. เข้าใจคำพ้อง เช่น "เรียบหรู" = "luxury", "ทันสมัย" = "modern"
3. วิเคราะห์ความหมายโดยรวม ไม่ใช่แค่คำที่ตรงกัน
4. ตอบกลับเป็น JSON ที่ valid เท่านั้น ไม่ต้องมี markdown`;

      console.log('🤖 Analyzing user intent with LLM...');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at understanding user requirements for website design. Respond ONLY with valid JSON, no markdown, no explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 16000,
        temperature: 1 // Low temperature for consistent results
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        console.log('⚠️ No content from LLM');
        return null;
      }

      // Remove markdown code blocks if present
      let jsonContent = content;
      if (content.startsWith('```')) {
        jsonContent = content.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
      }

      const analysis = JSON.parse(jsonContent) as LLMAnalysisResult;
      
      console.log('✅ LLM Analysis Result:', {
        businessCategory: analysis.businessCategory,
        style: analysis.style,
        tone: analysis.tone,
        features: analysis.features,
        confidence: analysis.confidence
      });

      return analysis;

    } catch (error) {
      console.error('❌ LLM intent analysis failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return null;
    }
  }

  /**
   * Get LLM recommendations for component selection
   */
  async getLLMRecommendations(
    context: SelectionContext,
    availableComponents: ComponentDefinition[]
  ): Promise<LLMComponentRecommendation[]> {
    if (!this.isInitialized || !this.openai) {
      console.log('⚠️ LLM not available, skipping recommendations');
      return [];
    }

    try {
      // Prepare component list for LLM
      const componentList = availableComponents.map(comp => ({
        id: comp.id,
        name: comp.name,
        category: comp.category,
        tags: comp.tags,
        variants: comp.variants.map(v => ({
          id: v.id,
          name: v.name,
          style: v.style
        }))
      }));

      const prompt = `เลือก components ที่เหมาะสมที่สุดสำหรับเว็บไซต์ตามข้อมูลต่อไปนี้:

User Context:
- Business: ${context.businessCategory}
- Input: "${context.userInput}"
- Style: ${context.style.join(', ')}
- Tone: ${context.tone}
- Features: ${context.features.join(', ')}

Available Components:
${JSON.stringify(componentList, null, 2)}

โปรดแนะนำ components ที่เหมาะสมในรูปแบบ JSON array:

[
  {
    "componentId": "component-id",
    "variantId": "variant-id",
    "slotId": "header/hero/section-1/footer",
    "score": 0.0-1.0,
    "reasoning": "เหตุผลที่เลือก component นี้"
  }
]

เกณฑ์การเลือก:
1. ความเหมาะสมกับประเภทธุรกิจ (30%)
2. ตรงกับสไตล์ที่ต้องการ (25%)
3. เหมาะสมกับโทนเสียง (20%)
4. รองรับฟีเจอร์ที่ต้องการ (15%)
5. ความนิยมและประสิทธิภาพ (10%)

สำคัญ:
- เลือกให้ครบทุก slot: header, hero, sections (ตาม features), footer
- ให้คะแนนที่สมเหตุสมผล
- อธิบายเหตุผลชัดเจน
- ตอบกลับเป็น JSON array ที่ valid เท่านั้น`;

      console.log('🤖 Getting LLM component recommendations...');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web designer. Respond ONLY with valid JSON array, no markdown, no explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 16000,
        temperature: 1
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        console.log('⚠️ No content from LLM');
        return [];
      }

      // Remove markdown code blocks if present
      let jsonContent = content;
      if (content.startsWith('```')) {
        jsonContent = content.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
      }

      const recommendations = JSON.parse(jsonContent) as LLMComponentRecommendation[];
      
      console.log(`✅ LLM Recommendations: ${recommendations.length} components`);

      return recommendations;

    } catch (error) {
      console.error('❌ LLM recommendations failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return [];
    }
  }

  /**
   * Enhanced component selection with LLM
   */
  async selectComponentsWithLLM(context: SelectionContext): Promise<ComponentSelection> {
    console.log('🎯 Starting LLM-enhanced component selection...');

    // Step 1: Analyze user intent with LLM (if available)
    const llmAnalysis = await this.analyzeUserIntent(context.userInput, context.keywords);
    
    // Step 2: Enhance context with LLM insights
    const enhancedContext = this.enhanceContextWithLLM(context, llmAnalysis);
    
    // Step 3: Get all available components
    const allComponents = this.registry.getAllComponents();
    
    // Step 4: Get LLM recommendations (if available)
    const llmRecommendations = await this.getLLMRecommendations(enhancedContext, allComponents);
    
    // Step 5: Combine traditional scoring with LLM recommendations
    const selectedComponents = this.combineSelections(
      enhancedContext,
      allComponents,
      llmRecommendations
    );
    
    // Step 6: Generate reasoning with LLM insights
    const reasoning = this.generateEnhancedReasoning(
      selectedComponents,
      enhancedContext,
      llmAnalysis
    );
    
    // Step 7: Calculate total score
    const totalScore = selectedComponents.reduce((sum, c) => sum + c.score, 0) / selectedComponents.length;
    
    return {
      selectedComponents,
      selectionCriteria: {
        businessCategory: enhancedContext.businessCategory,
        style: enhancedContext.style,
        tone: enhancedContext.tone,
        features: enhancedContext.features,
        ...(enhancedContext.preferences && { userPreferences: enhancedContext.preferences as Record<string, any> })
      },
      totalScore,
      alternatives: [],
      reasoning
    };
  }

  /**
   * Enhance context with LLM analysis
   */
  private enhanceContextWithLLM(
    originalContext: SelectionContext,
    llmAnalysis: LLMAnalysisResult | null
  ): SelectionContext {
    if (!llmAnalysis) {
      return originalContext;
    }

    return {
      ...originalContext,
      businessCategory: llmAnalysis.businessCategory || originalContext.businessCategory,
      style: llmAnalysis.style.length > 0 ? llmAnalysis.style : originalContext.style,
      tone: llmAnalysis.tone || originalContext.tone,
      features: llmAnalysis.features.length > 0 ? llmAnalysis.features : originalContext.features,
      preferences: {
        ...originalContext.preferences,
        colorScheme: (llmAnalysis.colorScheme as any) || originalContext.preferences?.colorScheme,
        layoutStyle: (llmAnalysis.layoutStyle as any) || originalContext.preferences?.layoutStyle,
        complexity: (llmAnalysis.complexity as any) || originalContext.preferences?.complexity
      }
    };
  }

  /**
   * Combine traditional scoring with LLM recommendations
   */
  private combineSelections(
    context: SelectionContext,
    allComponents: ComponentDefinition[],
    llmRecommendations: LLMComponentRecommendation[]
  ): SelectedComponent[] {
    const selected: SelectedComponent[] = [];

    // If we have LLM recommendations, use them
    if (llmRecommendations.length > 0) {
      console.log('✅ Using LLM recommendations');
      
      for (const rec of llmRecommendations) {
        selected.push({
          componentId: rec.componentId,
          variantId: rec.variantId,
          slotId: rec.slotId,
          score: rec.score,
          reason: rec.reasoning
        });
      }
      
      return selected;
    }

    // Fallback to traditional selection
    console.log('⚠️ Falling back to traditional selection');
    return this.traditionalSelection(context, allComponents);
  }

  /**
   * Traditional component selection (fallback)
   */
  private traditionalSelection(
    context: SelectionContext,
    allComponents: ComponentDefinition[]
  ): SelectedComponent[] {
    const selected: SelectedComponent[] = [];

    // Simple selection logic (simplified from original selector)
    const navbar = allComponents.find(c => c.id.includes('navbar'));
    if (navbar?.variants?.[0]) {
      selected.push({
        componentId: navbar.id,
        variantId: navbar.variants[0].id,
        slotId: 'header',
        score: 0.8,
        reason: 'Default navbar selection'
      });
    }

    const hero = allComponents.find(c => c.id.includes('hero'));
    if (hero?.variants?.[0]) {
      selected.push({
        componentId: hero.id,
        variantId: hero.variants[0].id,
        slotId: 'hero',
        score: 0.8,
        reason: 'Default hero selection'
      });
    }

    // Add feature-based sections
    context.features.forEach((feature, index) => {
      const component = allComponents.find(c => c.id.includes(feature.toLowerCase()));
      if (component?.variants?.[0]) {
        selected.push({
          componentId: component.id,
          variantId: component.variants[0].id,
          slotId: `section-${index + 1}`,
          score: 0.8,
          reason: `Section for ${feature}`
        });
      }
    });

    const footer = allComponents.find(c => c.id.includes('footer'));
    if (footer?.variants?.[0]) {
      selected.push({
        componentId: footer.id,
        variantId: footer.variants[0].id,
        slotId: 'footer',
        score: 0.8,
        reason: 'Default footer selection'
      });
    }

    return selected;
  }

  /**
   * Generate enhanced reasoning with LLM insights
   */
  private generateEnhancedReasoning(
    selectedComponents: SelectedComponent[],
    context: SelectionContext,
    llmAnalysis: LLMAnalysisResult | null
  ): any {
    const keyFactors = [];

    if (llmAnalysis) {
      keyFactors.push(`AI-analyzed user intent with ${(llmAnalysis.confidence * 100).toFixed(0)}% confidence`);
      if (llmAnalysis.reasoning) {
        keyFactors.push(llmAnalysis.reasoning);
      }
    }

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
      llmEnhanced: !!llmAnalysis,
      tradeoffs: [
        'AI-powered selection for better accuracy',
        'Balanced between user intent and best practices'
      ],
      recommendations: [
        'Review component selection reasoning',
        'Customize colors to match brand'
      ]
    };
  }
}

