/**
 * Style Detection Service
 * วิเคราะห์สไตล์และโทนสีจาก user input
 */

export interface StylePreferences {
  style: 'modern' | 'classic' | 'minimal' | 'vintage' | 'default';
  colorTone: 'warm' | 'cool' | 'neutral' | 'default';
  colors: string[];
  mood: 'professional' | 'friendly' | 'elegant' | 'playful' | 'default';
  theme: 'dark' | 'light' | 'default';
  confidence: number;
  reasoning: string;
}

export class StyleDetectionService {
  private static instance: StyleDetectionService;

  static getInstance(): StyleDetectionService {
    if (!StyleDetectionService.instance) {
      StyleDetectionService.instance = new StyleDetectionService();
    }
    return StyleDetectionService.instance;
  }

  /**
   * วิเคราะห์สไตล์และโทนสีจาก user input
   */
  async detectStylePreferences(userInput: string): Promise<StylePreferences> {
    console.log('🎨 Detecting style preferences for:', userInput);

    try {
      // 1. Keyword-based detection (เร็ว)
      const keywordResult = this.detectByKeywords(userInput);
      if (keywordResult.confidence > 0.8) {
        console.log('✅ High confidence keyword match:', keywordResult);
        return keywordResult;
      }

      // 2. AI-based detection (ละเอียด)
      console.log('🤖 Using AI for style detection...');
      const aiResult = await this.detectByAI(userInput);
      
      // 3. Combine results
      const finalResult = this.combineResults(keywordResult, aiResult);
      
      console.log('🎯 Final style detection:', {
        style: finalResult.style,
        colorTone: finalResult.colorTone,
        colors: finalResult.colors,
        mood: finalResult.mood,
        confidence: finalResult.confidence
      });

      return finalResult;

    } catch (error) {
      console.error('❌ Style detection failed:', error);
      
      // Fallback to default
      return {
        style: 'default',
        colorTone: 'default',
        colors: [],
        mood: 'default',
        theme: 'default',
        confidence: 0.1,
        reasoning: 'Detection failed, using default preferences'
      };
    }
  }

  /**
   * Keyword-based detection (เร็ว)
   */
  private detectByKeywords(userInput: string): StylePreferences {
    const lowerInput = userInput.toLowerCase();
    
    // Style keywords
    const styleKeywords = {
      'modern': ['modern', 'โมเดิร์น', 'ทันสมัย', 'contemporary', 'สไตล์โมเดิร์น'],
      'classic': ['classic', 'คลาสสิก', 'ดั้งเดิม', 'traditional', 'สไตล์คลาสสิก'],
      'minimal': ['minimal', 'มินิมอล', 'เรียบง่าย', 'simple', 'สไตล์มินิมอล'],
      'vintage': ['vintage', 'วินเทจ', 'เก่า', 'retro', 'สไตล์วินเทจ']
    };

    // Color tone keywords
    const colorToneKeywords = {
      'warm': ['warm', 'อุ่น', 'โทนอุ่น', 'อบอุ่น', 'โทนอบอุ่น'],
      'cool': ['cool', 'เย็น', 'โทนเย็น', 'เย็นสบาย', 'โทนเย็น'],
      'neutral': ['neutral', 'กลาง', 'โทนกลาง', 'เป็นกลาง', 'โทนกลาง']
    };

    // Theme keywords
    const themeKeywords = {
      'dark': ['dark', 'ดำ', 'มืด', 'ธีม dark', 'ธีมมืด', 'halloween'],
      'light': ['light', 'สว่าง', 'ธีม light', 'ธีมสว่าง']
    };

    // Color keywords
    const colorKeywords = {
      'สีแดง': '#DC2626',
      'สีน้ำเงิน': '#3B82F6',
      'สีเขียว': '#10B981',
      'สีส้ม': '#F59E0B',
      'สีเหลือง': '#F59E0B',
      'สีม่วง': '#8B5CF6',
      'สีชมพู': '#EC4899',
      'สีเทา': '#6B7280',
      'สีดำ': '#000000',
      'สีขาว': '#FFFFFF'
    };

    // Mood keywords
    const moodKeywords = {
      'professional': ['professional', 'มืออาชีพ', 'ธุรกิจ', 'corporate'],
      'friendly': ['friendly', 'เป็นมิตร', 'อบอุ่น', 'warm'],
      'elegant': ['elegant', 'หรูหรา', 'สง่างาม', 'sophisticated'],
      'playful': ['playful', 'สนุก', 'น่ารัก', 'fun', 'cute']
    };

    // Extract preferences
    const detectedStyle = this.extractKeywords(lowerInput, styleKeywords) || 'default';
    const detectedTone = this.extractKeywords(lowerInput, colorToneKeywords) || 'default';
    const detectedColors = this.extractColors(lowerInput, colorKeywords);
    const detectedMood = this.extractKeywords(lowerInput, moodKeywords) || 'default';
    const detectedTheme = this.extractKeywords(lowerInput, themeKeywords) || 'default';

    const confidence = this.calculateConfidence(detectedStyle, detectedTone, detectedColors, detectedMood, detectedTheme);
    const reasoning = this.generateReasoning(detectedStyle, detectedTone, detectedColors, detectedMood, detectedTheme);

    return {
      style: detectedStyle as any,
      colorTone: detectedTone as any,
      colors: detectedColors,
      mood: detectedMood as any,
      theme: detectedTheme as any,
      confidence,
      reasoning
    };
  }

  /**
   * AI-based detection (ละเอียด)
   */
  private async detectByAI(userInput: string): Promise<StylePreferences> {
    try {
      console.log('🤖 Using AI for advanced style detection...');
      
      // Import LLM adapter
      const { LLMAdapter } = await import('../adapters/llmAdapter');
      const llm = new LLMAdapter();
      
      // Initialize LLM adapter
      await llm.initialize();
      
      const prompt = this.buildAIStyleDetectionPrompt(userInput);
      const response = await llm.callLLM(prompt, {
        model: 'gpt-5-nano',
        temperature: 0.7,
        maxCompletionTokens: 4000  // เพิ่ม token limit
      });
      
      // Parse AI response
      const aiResult = this.parseAIResponse(response.content);
      
      console.log('🤖 AI detection result:', aiResult);
      return aiResult;
      
    } catch (error) {
      console.error('❌ AI detection failed:', error);
      
      // Fallback to default
      return {
        style: 'default',
        colorTone: 'default',
        colors: [],
        mood: 'default',
        theme: 'default',
        confidence: 0.1,
        reasoning: 'AI detection failed, using default'
      };
    }
  }

  /**
   * Build AI prompt for style detection
   */
  private buildAIStyleDetectionPrompt(userInput: string): string {
    return `Analyze style for: "${userInput}"

Return JSON only:
{
  "style": "modern|classic|minimal|vintage|default",
  "colorTone": "warm|cool|neutral|default",
  "colors": ["#3B82F6", "#10B981"],
  "mood": "professional|friendly|elegant|playful|default",
  "theme": "dark|light|default",
  "confidence": 0.8,
  "reasoning": "Brief explanation"
}`;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): StylePreferences {
    try {
      const parsed = JSON.parse(response);
      
      return {
        style: parsed.style || 'default',
        colorTone: parsed.colorTone || 'default',
        colors: parsed.colors || [],
        mood: parsed.mood || 'default',
        theme: parsed.theme || 'default',
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'AI analysis completed'
      };
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      return {
        style: 'default',
        colorTone: 'default',
        colors: [],
        mood: 'default',
        theme: 'default',
        confidence: 0.1,
        reasoning: 'Failed to parse AI response'
      };
    }
  }

  /**
   * Combine keyword and AI results
   */
  private combineResults(keywordResult: StylePreferences, aiResult: StylePreferences): StylePreferences {
    // Prefer keyword result if confidence is high
    if (keywordResult.confidence > 0.7) {
      return keywordResult;
    }

    // Otherwise, combine results
    return {
      style: keywordResult.style !== 'default' ? keywordResult.style : aiResult.style,
      colorTone: keywordResult.colorTone !== 'default' ? keywordResult.colorTone : aiResult.colorTone,
      colors: [...keywordResult.colors, ...aiResult.colors],
      mood: keywordResult.mood !== 'default' ? keywordResult.mood : aiResult.mood,
      theme: keywordResult.theme !== 'default' ? keywordResult.theme : aiResult.theme,
      confidence: Math.max(keywordResult.confidence, aiResult.confidence),
      reasoning: `Combined: ${keywordResult.reasoning} | ${aiResult.reasoning}`
    };
  }

  /**
   * Extract keywords from input
   */
  private extractKeywords(input: string, keywordMap: Record<string, string[]>): string | null {
    for (const [key, keywords] of Object.entries(keywordMap)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          return key;
        }
      }
    }
    return null;
  }

  /**
   * Extract colors from input
   */
  private extractColors(input: string, colorMap: Record<string, string>): string[] {
    const colors: string[] = [];
    for (const [keyword, color] of Object.entries(colorMap)) {
      if (input.includes(keyword)) {
        colors.push(color);
      }
    }
    return colors;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(style: string, tone: string, colors: string[], mood: string, theme: string): number {
    let score = 0;
    if (style !== 'default') score += 0.25;
    if (tone !== 'default') score += 0.25;
    if (colors.length > 0) score += 0.2;
    if (mood !== 'default') score += 0.15;
    if (theme !== 'default') score += 0.15;
    return Math.min(score, 1.0);
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(style: string, tone: string, colors: string[], mood: string, theme: string): string {
    const parts: string[] = [];
    
    if (style !== 'default') parts.push(`สไตล์: ${style}`);
    if (tone !== 'default') parts.push(`โทนสี: ${tone}`);
    if (colors.length > 0) parts.push(`สี: ${colors.join(', ')}`);
    if (mood !== 'default') parts.push(`อารมณ์: ${mood}`);
    if (theme !== 'default') parts.push(`ธีม: ${theme}`);
    
    return parts.length > 0 ? parts.join(', ') : 'ไม่พบข้อมูลสไตล์เฉพาะ';
  }
}
