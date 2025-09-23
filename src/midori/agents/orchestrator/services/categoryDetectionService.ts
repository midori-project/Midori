/**
 * AI-Powered Category Detection Service
 * ใช้ AI ในการจับคู่ประเภทเว็บไซต์จาก user input
 */

import { LLMAdapter } from '../adapters/llmAdapter';
import { WEBSITE_CATEGORIES, WebsiteCategory } from '../categories/websiteCategories';

export interface CategoryDetectionResult {
  category: WebsiteCategory;
  confidence: number;
  reasoning: string;
  matchedKeywords: string[];
  alternativeCategories: Array<{
    category: WebsiteCategory;
    confidence: number;
  }>;
}

export class CategoryDetectionService {
  private llmAdapter: LLMAdapter;
  private initialized: boolean = false;

  constructor() {
    this.llmAdapter = new LLMAdapter();
  }

  /**
   * Initialize the LLM adapter
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.llmAdapter.initialize();
      this.initialized = true;
    }
  }

  /**
   * Detect website category from user input using AI
   */
  async detectCategory(userInput: string): Promise<CategoryDetectionResult> {
    console.log('🔍 Detecting website category for:', userInput);

    try {
      // Initialize if not already done
      await this.initialize();

      // 1. First, try keyword-based matching for quick results
      const keywordResult = this.detectByKeywords(userInput);
      if (keywordResult.confidence > 0.8) {
        console.log('✅ High confidence keyword match:', keywordResult.category.name);
        return keywordResult;
      }

      // 2. Use AI for complex cases
      console.log('🤖 Using AI for category detection...');
      const aiResult = await this.detectByAI(userInput);
      
      // 3. Combine results
      const finalResult = this.combineResults(keywordResult, aiResult);
      
      console.log('🎯 Final category detection:', {
        category: finalResult.category.name,
        confidence: finalResult.confidence,
        reasoning: finalResult.reasoning
      });

      return finalResult;

    } catch (error) {
      console.error('❌ Category detection failed:', error);
      
      // Fallback to default category
      return {
        category: WEBSITE_CATEGORIES.find((c: WebsiteCategory) => c.id === 'e_commerce_general') || WEBSITE_CATEGORIES[0],
        confidence: 0.1,
        reasoning: 'Detection failed, using default category',
        matchedKeywords: [],
        alternativeCategories: []
      };
    }
  }

  /**
   * Keyword-based detection (fast)
   */
  private detectByKeywords(userInput: string): CategoryDetectionResult {
    const lowerInput = userInput.toLowerCase();
    let bestMatch: WebsiteCategory | null = null;
    let bestScore = 0;
    let matchedKeywords: string[] = [];

    for (const category of WEBSITE_CATEGORIES) {
      let score = 0;
      const categoryMatchedKeywords: string[] = [];

      for (const keyword of category.keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          score += 1;
          categoryMatchedKeywords.push(keyword);
        }
      }

      // Weight by priority
      score *= (category.priority / 10);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
        matchedKeywords = categoryMatchedKeywords;
      }
    }

    const confidence = Math.min(bestScore / 3, 1); // Normalize to 0-1

    return {
      category: bestMatch || WEBSITE_CATEGORIES[0],
      confidence,
      reasoning: `Matched ${matchedKeywords.length} keywords: ${matchedKeywords.join(', ')}`,
      matchedKeywords,
      alternativeCategories: []
    };
  }

  /**
   * AI-based detection (accurate but slower)
   */
  private async detectByAI(userInput: string): Promise<CategoryDetectionResult> {
    const categoriesInfo = WEBSITE_CATEGORIES.map((cat: WebsiteCategory) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      keywords: cat.keywords.slice(0, 10), // Limit keywords for prompt
      examples: cat.examples.slice(0, 3)   // Limit examples for prompt
    }));

    const prompt = `
Analyze the following user input and determine the most appropriate website category.

User Input: "${userInput}"

Available Categories:
    ${categoriesInfo.map((cat: any) => `
- ${cat.id}: ${cat.name}
  Description: ${cat.description}
  Keywords: ${cat.keywords.join(', ')}
  Examples: ${cat.examples.join(', ')}
`).join('\n')}

Please respond with a JSON object containing:
{
  "categoryId": "the_best_matching_category_id",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of why this category was chosen",
  "matchedKeywords": ["keyword1", "keyword2"],
  "alternativeCategories": [
    {
      "categoryId": "alternative_category_id",
      "confidence": 0.0-1.0
    }
  ]
}

CRITICAL REQUIREMENTS:
- Respond ONLY with valid JSON
- No markdown formatting (no backticks)
- No additional text before or after
- Ensure all strings are properly quoted and closed
- Ensure all brackets and braces are properly closed
- Complete the JSON object fully
- Use double quotes for all strings
- End with closing brace
`;

    try {
      const response = await this.llmAdapter.callLLM(prompt, {
        useSystemPrompt: false,
        temperature: 1, // GPT-5 models only support temperature = 1
        maxTokens: 3000 // เพิ่ม maxTokens
      });

      // Parse JSON with error handling
      let result;
      try {
        result = JSON.parse(response.content);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.error('❌ Raw AI response:', response.content);
        
        // Try to extract JSON from markdown code blocks
        let cleanedContent = response.content.trim();
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to extract JSON object
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }
        
        // Fix common JSON issues
        cleanedContent = cleanedContent
          .replace(/"categoryId[^"]*$/, '"categoryId": "e_commerce_general"') // Fix unterminated string
          .replace(/,\s*$/, '') // Remove trailing comma
          .replace(/,(\s*[}\]])/g, '$1') // Remove comma before closing bracket
          .replace(/\n\s*$/, '') // Remove trailing newlines
          .trim();
        
        // If JSON is incomplete, try to complete it
        if (!cleanedContent.endsWith('}')) {
          console.log('🔧 Incomplete JSON detected, attempting to complete...');
          
          // Check if we have opening brace
          if (cleanedContent.startsWith('{')) {
            // Try to extract what we have and complete it
            const lines = cleanedContent.split('\n').filter(line => line.trim());
            const lastLine = lines[lines.length - 1];
            
            // If last line ends with comma, remove it
            if (lastLine.endsWith(',')) {
              lines[lines.length - 1] = lastLine.slice(0, -1);
            }
            
            // Add missing properties if needed
            let completedJson = lines.join('\n');
            
            // Check if we have required properties
            if (!completedJson.includes('"categoryId"')) {
              completedJson += '\n  "categoryId": "e_commerce_general",';
            }
            if (!completedJson.includes('"confidence"')) {
              completedJson += '\n  "confidence": 0.8,';
            }
            if (!completedJson.includes('"reasoning"')) {
              completedJson += '\n  "reasoning": "Auto-completed due to incomplete response",';
            }
            if (!completedJson.includes('"alternativeCategories"')) {
              completedJson += '\n  "alternativeCategories": []';
            }
            
            // Remove trailing comma and add closing brace
            completedJson = completedJson.replace(/,\s*$/, '') + '\n}';
            
            // Fix missing comma between properties
            completedJson = completedJson.replace(/(\d+)\n  "reasoning"/, '$1,\n  "reasoning"');
            completedJson = completedJson.replace(/(\d+)\n  "alternativeCategories"/, '$1,\n  "alternativeCategories"');
            
            cleanedContent = completedJson;
            console.log('🔧 Completed JSON:', cleanedContent);
          }
        }
        
        try {
          result = JSON.parse(cleanedContent);
          console.log('✅ Successfully parsed cleaned JSON:', result);
        } catch (secondParseError) {
          console.error('❌ Second parse attempt failed:', secondParseError);
          console.error('❌ Cleaned content that failed to parse:', cleanedContent);
          console.log('🔄 Creating fallback result due to parsing failure');
          
          // Create fallback result instead of throwing error
          result = {
            categoryId: 'e_commerce_general',
            confidence: 0.1,
            reasoning: 'Detection failed, using default category',
            alternativeCategories: []
          };
        }
      }
      const category = WEBSITE_CATEGORIES.find((c: WebsiteCategory) => c.id === result.categoryId) || WEBSITE_CATEGORIES[0];
      
      const alternativeCategories = result.alternativeCategories?.map((alt: any) => ({
        category: WEBSITE_CATEGORIES.find((c: WebsiteCategory) => c.id === alt.categoryId) || WEBSITE_CATEGORIES[0],
        confidence: alt.confidence || 0
      })) || [];

      return {
        category,
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'AI detection completed',
        matchedKeywords: result.matchedKeywords || [],
        alternativeCategories
      };

    } catch (error) {
      console.error('❌ AI category detection failed:', error);
      throw error;
    }
  }

  /**
   * Combine keyword and AI results
   */
  private combineResults(keywordResult: CategoryDetectionResult, aiResult: CategoryDetectionResult): CategoryDetectionResult {
    // If AI confidence is much higher, use AI result
    if (aiResult.confidence > keywordResult.confidence + 0.2) {
      return aiResult;
    }

    // If keyword confidence is high, use keyword result
    if (keywordResult.confidence > 0.7) {
      return keywordResult;
    }

    // Otherwise, use the higher confidence result
    return keywordResult.confidence > aiResult.confidence ? keywordResult : aiResult;
  }

  /**
   * Get category suggestions based on partial input
   */
  async getCategorySuggestions(partialInput: string): Promise<WebsiteCategory[]> {
    const lowerInput = partialInput.toLowerCase();
    const suggestions: Array<{ category: WebsiteCategory; score: number }> = [];

    for (const category of WEBSITE_CATEGORIES) {
      let score = 0;
      
      for (const keyword of category.keywords) {
        if (keyword.toLowerCase().includes(lowerInput) || lowerInput.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > 0) {
        suggestions.push({ category, score });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.category);
  }

  /**
   * Validate category choice
   */
  validateCategoryChoice(userInput: string, categoryId: string): {
    isValid: boolean;
    confidence: number;
    reasoning: string;
  } {
    const category = WEBSITE_CATEGORIES.find((c: WebsiteCategory) => c.id === categoryId);
    if (!category) {
      return {
        isValid: false,
        confidence: 0,
        reasoning: 'Category not found'
      };
    }

    const lowerInput = userInput.toLowerCase();
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of category.keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    const confidence = Math.min(score / 3, 1);
    const isValid = confidence > 0.3;

    return {
      isValid,
      confidence,
      reasoning: isValid 
        ? `Valid choice: matched ${matchedKeywords.length} keywords (${matchedKeywords.join(', ')})`
        : `Low confidence: only matched ${matchedKeywords.length} keywords`
    };
  }
}

// Export singleton instance
export const categoryDetectionService = new CategoryDetectionService();
