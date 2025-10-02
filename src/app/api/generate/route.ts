import { NextResponse } from "next/server";
import { SHARED_BLOCKS } from "@/app/(app)/(projects)/template/shared-blocks";
import { BUSINESS_CATEGORIES, getBusinessCategoryByKeywords } from "@/app/(app)/(projects)/template/business-categories";
import { 
  OverrideSystem, 
  createOverrideSystem, 
  createAIPrompt,
  AIPromptConfig 
} from "@/app/(app)/(projects)/template/override-system";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Override System
const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get('keywords')?.split(',').map(k => k.trim()) || ["fresh","organic","homemade"];
  
  try {
    // 1. Determine business category from keywords
    const businessCategory = getBusinessCategoryByKeywords(keywords);
    if (!businessCategory) {
      throw new Error("No matching business category found");
    }

    // 2. Resolve Concrete Manifest (ก่อน AI)
    const resolverResult = await overrideSystem.resolveManifest(businessCategory.id, []);

    // 3. Create AI Prompt Config with Complete Schema
    const aiPromptConfig = overrideSystem.createAIPromptConfig(
      businessCategory.id,
      resolverResult.concreteManifest,
      keywords
    );

    // 4. Generate user data using AI with Complete Schema
    const userData = await generateUserDataFromKeywords(aiPromptConfig);

    // 5. Render Templates (หลัง AI)
    const rendererResult = await overrideSystem.renderTemplates(
      resolverResult.concreteManifest,
      userData,
      true // validation enabled
    );

    // 6. Return results
    return NextResponse.json({ 
      files: rendererResult.files,
      businessCategory: businessCategory.id,
      concreteManifest: {
        businessCategoryId: resolverResult.concreteManifest.businessCategory.id,
        totalBlocks: resolverResult.concreteManifest.blocks.length,
        appliedOverrides: resolverResult.appliedOverrides
      },
      appliedOverrides: [...resolverResult.appliedOverrides, ...rendererResult.appliedOverrides],
      processingTime: resolverResult.processingTime + rendererResult.processingTime,
      validationResults: rendererResult.validationResults
    });

  } catch (error) {
    console.error("Error generating website:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate website",
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function generateUserDataFromKeywords(
  aiPromptConfig: AIPromptConfig
): Promise<Record<string, any>> {
  // Create AI prompt with complete schema
  const prompt = createAIPrompt(aiPromptConfig);

  const response = await client.chat.completions.create({
    model: "gpt-5-nano",
    temperature: 1,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate content from AI");
  }

  try {
    const userData = JSON.parse(content);
    
    // Debug logging
    console.log('AI Response:', JSON.stringify(userData, null, 2));
    
    // Add keywords to userData for logging
    userData.keywords = aiPromptConfig.keywords;
    
    return userData;
  } catch (parseError) {
    console.error('AI Response Parse Error:', parseError);
    console.error('Raw AI Response:', content);
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}
