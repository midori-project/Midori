import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { BusinessContext } from '../gensite/business/types';

const openai = new OpenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

interface TemplateReplacementRequest {
  template: string;
  finalJson: Record<string, unknown>;
  ctx: BusinessContext;
  projectName?: string;
  userIntent?: string;
}

interface TemplateReplacementResponse {
  replacedTemplate: string;
  replacements: Record<string, string>;
  confidence: number;
  fallbackUsed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: TemplateReplacementRequest = await request.json();
    const { template, finalJson, ctx, projectName, userIntent } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า template มี placeholders หรือไม่
    const placeholders = template.match(/\[[A-Z_]+\]/g);
    if (!placeholders || placeholders.length === 0) {
      return NextResponse.json({
        replacedTemplate: template,
        replacements: {},
        confidence: 1.0,
        fallbackUsed: false
      });
    }

    // สร้าง prompt สำหรับ AI
    const prompt = createReplacementPrompt(template, finalJson, ctx, placeholders, projectName, userIntent);

    try {
      // เรียกใช้ AI สำหรับ replacement
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert content generator for website templates. Generate appropriate content for placeholders based on user intent and business context. Return only valid JSON with replacements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse AI response
      const aiReplacements = JSON.parse(aiResponse);
      
      // Apply AI replacements
      let replacedTemplate = template;
      const appliedReplacements: Record<string, string> = {};
      
      for (const placeholder of placeholders) {
        const key = placeholder.slice(1, -1); // Remove [ and ]
        if (aiReplacements[key]) {
          replacedTemplate = replacedTemplate.replace(new RegExp(`\\${placeholder}`, 'g'), aiReplacements[key]);
          appliedReplacements[key] = aiReplacements[key];
        }
      }

      return NextResponse.json({
        replacedTemplate,
        replacements: appliedReplacements,
        confidence: 0.9,
        fallbackUsed: false
      });

    } catch (aiError) {
      console.warn('AI replacement failed, using fallback:', aiError);
      
      // Fallback to default replacements
      const fallbackReplacements = getFallbackReplacements(finalJson, ctx, projectName);
      let replacedTemplate = template;
      
      for (const placeholder of placeholders) {
        const key = placeholder.slice(1, -1);
        if (fallbackReplacements[key]) {
          replacedTemplate = replacedTemplate.replace(new RegExp(`\\${placeholder}`, 'g'), fallbackReplacements[key]);
        }
      }

      return NextResponse.json({
        replacedTemplate,
        replacements: fallbackReplacements,
        confidence: 0.5,
        fallbackUsed: true
      });
    }

  } catch (error) {
    console.error('Template replacement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function createReplacementPrompt(
  template: string,
  finalJson: Record<string, unknown>,
  ctx: BusinessContext,
  placeholders: string[],
  projectName?: string,
  userIntent?: string
): string {
  const projectInfo = finalJson.project as any;
  const businessInfo = finalJson.business as any;
  const heroInfo = finalJson.hero as any;
  const contactInfo = finalJson.contact as any;
  const menuInfo = finalJson.menu as any;
  const featuredInfo = finalJson.featured as any;

  return `Generate appropriate content for the following placeholders in a ${ctx.industry} website template.

**Business Context:**
- Industry: ${ctx.industry}
- Project Name: ${projectName || projectInfo?.name || 'Website'}
- Business Name: ${businessInfo?.name || projectInfo?.name || ctx.industry}
- Business Description: ${businessInfo?.description || projectInfo?.description || ''}

**User Intent:** ${userIntent || 'Create a professional website'}

**Available Data:**
- Hero Info: ${JSON.stringify(heroInfo || {})}
- Contact Info: ${JSON.stringify(contactInfo || {})}
- Menu Info: ${JSON.stringify(menuInfo || {})}
- Featured Info: ${JSON.stringify(featuredInfo || {})}

**Placeholders to Replace:**
${placeholders.map(p => `- ${p}`).join('\n')}

**Requirements:**
1. Generate content that matches the ${ctx.industry} industry
2. Use available data from finalJson when possible
3. Create professional, engaging content
4. Keep text concise and appropriate for web use
5. Use English for international businesses
6. Ensure content is relevant to user intent: "${userIntent || 'Create a professional website'}"

**Return Format:**
Return only a JSON object with the placeholder names (without brackets) as keys and the replacement content as values.

Example:
{
  "HERO_TITLE": "Welcome to Our Cafe",
  "HERO_SUBTITLE": "Experience the finest coffee in town",
  "CONTACT_PHONE": "02-123-4567"
}`;
}

function getFallbackReplacements(
  finalJson: Record<string, unknown>,
  ctx: BusinessContext,
  projectName?: string
): Record<string, string> {
  const projectInfo = finalJson.project as any;
  const businessInfo = finalJson.business as any;
  const heroInfo = finalJson.hero as any;
  const contactInfo = finalJson.contact as any;
  const menuInfo = finalJson.menu as any;
  const featuredInfo = finalJson.featured as any;

  return {
    // Project & Business Info
    PROJECT_NAME: projectName || projectInfo?.name || 'Website',
    BUSINESS_NAME: businessInfo?.name || projectInfo?.name || ctx.industry,
    BUSINESS_TYPE: ctx.industry || 'Business',
    BUSINESS_DESCRIPTION: businessInfo?.description || projectInfo?.description || 'Professional website',

    // Hero Section
    HERO_TITLE: heroInfo?.title || getDefaultHeroTitle(ctx.industry),
    HERO_SUBTITLE: heroInfo?.subtitle || getDefaultHeroSubtitle(ctx.industry),
    HERO_DESCRIPTION: heroInfo?.description || getDefaultHeroDescription(ctx.industry),

    // Contact Information
    CONTACT_PHONE: contactInfo?.phone || '02-123-4567',
    CONTACT_EMAIL: contactInfo?.email || 'info@example.com',
    CONTACT_ADDRESS: contactInfo?.address || '123 Main Street, Bangkok 10110',
    CONTACT_HOURS: contactInfo?.hours || getDefaultHours(ctx.industry),

    // Navigation & Buttons
    MENU_BUTTON_TEXT: getMenuButtonText(ctx.industry),
    ORDER_BUTTON_TEXT: getOrderButtonText(ctx.industry),
    CONTACT_BUTTON_TEXT: 'Contact Us',
    LEARN_MORE_TEXT: 'Learn More',

    // Features & Content
    FEATURED_SECTION_TITLE: featuredInfo?.title || getFeaturedTitle(ctx.industry),
    ABOUT_SECTION_TITLE: 'About Us',
    SERVICES_SECTION_TITLE: getServicesTitle(ctx.industry),

    // Menu Items
    MENU_ITEM_1_NAME: menuInfo?.items?.[0]?.name || getDefaultMenuItem(ctx.industry, 1),
    MENU_ITEM_1_DESCRIPTION: menuInfo?.items?.[0]?.description || getDefaultMenuItemDescription(ctx.industry, 1),
    MENU_ITEM_1_PRICE: menuInfo?.items?.[0]?.price || getDefaultMenuItemPrice(ctx.industry, 1),
    MENU_ITEM_2_NAME: menuInfo?.items?.[1]?.name || getDefaultMenuItem(ctx.industry, 2),
    MENU_ITEM_2_DESCRIPTION: menuInfo?.items?.[1]?.description || getDefaultMenuItemDescription(ctx.industry, 2),
    MENU_ITEM_2_PRICE: menuInfo?.items?.[1]?.price || getDefaultMenuItemPrice(ctx.industry, 2),
    MENU_ITEM_3_NAME: menuInfo?.items?.[2]?.name || getDefaultMenuItem(ctx.industry, 3),
    MENU_ITEM_3_DESCRIPTION: menuInfo?.items?.[2]?.description || getDefaultMenuItemDescription(ctx.industry, 3),
    MENU_ITEM_3_PRICE: menuInfo?.items?.[2]?.price || getDefaultMenuItemPrice(ctx.industry, 3),

    // Features
    FEATURE_1_TITLE: getFeatureTitle(ctx.industry, 1),
    FEATURE_1_DESCRIPTION: getFeatureDescription(ctx.industry, 1),
    FEATURE_2_TITLE: getFeatureTitle(ctx.industry, 2),
    FEATURE_2_DESCRIPTION: getFeatureDescription(ctx.industry, 2),
    FEATURE_3_TITLE: getFeatureTitle(ctx.industry, 3),
    FEATURE_3_DESCRIPTION: getFeatureDescription(ctx.industry, 3)
  };
}

// Default content generators (same as in TemplateReplacer)
function getDefaultHeroTitle(industry: string): string {
  const titles: Record<string, string> = {
    'cafe': 'Artisan Coffee Experience',
    'restaurant': 'Fine Dining Experience',
    'ecommerce': 'Shop Quality Products',
    'portfolio': 'Creative Portfolio',
    'agency': 'Digital Solutions',
    'blog': 'Thoughts & Stories',
    'fashion': 'Style & Fashion',
    'technology': 'Innovation & Technology'
  };
  return titles[industry] || 'Welcome to Our Website';
}

function getDefaultHeroSubtitle(industry: string): string {
  const subtitles: Record<string, string> = {
    'cafe': 'Discover the perfect blend of tradition and innovation',
    'restaurant': 'Experience culinary excellence in every dish',
    'ecommerce': 'Find the best products at great prices',
    'portfolio': 'Showcasing creative work and projects',
    'agency': 'Transforming ideas into digital reality',
    'blog': 'Sharing insights and experiences',
    'fashion': 'Express your unique style',
    'technology': 'Building the future with technology'
  };
  return subtitles[industry] || 'Discover what we offer';
}

function getDefaultHeroDescription(industry: string): string {
  const descriptions: Record<string, string> = {
    'cafe': 'We serve premium coffee in a cozy atmosphere',
    'restaurant': 'Fresh ingredients, authentic flavors, exceptional service',
    'ecommerce': 'Quality products delivered to your doorstep',
    'portfolio': 'Creative solutions for modern challenges',
    'agency': 'Full-service digital marketing and development',
    'blog': 'Thoughtful content on various topics',
    'fashion': 'Trendy styles for every occasion',
    'technology': 'Cutting-edge solutions for businesses'
  };
  return descriptions[industry] || 'Professional services and solutions';
}

function getDefaultHours(industry: string): string {
  const hours: Record<string, string> = {
    'cafe': '7:00 - 22:00',
    'restaurant': '11:00 - 22:00',
    'ecommerce': '24/7 Online',
    'portfolio': '9:00 - 18:00',
    'agency': '9:00 - 18:00',
    'blog': '24/7 Available',
    'fashion': '10:00 - 20:00',
    'technology': '9:00 - 18:00'
  };
  return hours[industry] || '9:00 - 18:00';
}

function getMenuButtonText(industry: string): string {
  const texts: Record<string, string> = {
    'cafe': 'View Menu',
    'restaurant': 'View Menu',
    'ecommerce': 'Shop Now',
    'portfolio': 'View Work',
    'agency': 'Our Services',
    'blog': 'Read More',
    'fashion': 'Shop Collection',
    'technology': 'Our Solutions'
  };
  return texts[industry] || 'Learn More';
}

function getOrderButtonText(industry: string): string {
  const texts: Record<string, string> = {
    'cafe': 'Order Now',
    'restaurant': 'Make Reservation',
    'ecommerce': 'Add to Cart',
    'portfolio': 'Get Quote',
    'agency': 'Start Project',
    'blog': 'Subscribe',
    'fashion': 'Buy Now',
    'technology': 'Get Started'
  };
  return texts[industry] || 'Get Started';
}

function getFeaturedTitle(industry: string): string {
  const titles: Record<string, string> = {
    'cafe': 'Featured Coffee',
    'restaurant': 'Featured Dishes',
    'ecommerce': 'Featured Products',
    'portfolio': 'Featured Work',
    'agency': 'Featured Services',
    'blog': 'Featured Posts',
    'fashion': 'Featured Collection',
    'technology': 'Featured Solutions'
  };
  return titles[industry] || 'Featured Items';
}

function getServicesTitle(industry: string): string {
  const titles: Record<string, string> = {
    'cafe': 'Our Services',
    'restaurant': 'Our Menu',
    'ecommerce': 'Our Products',
    'portfolio': 'Our Services',
    'agency': 'Our Services',
    'blog': 'Categories',
    'fashion': 'Collections',
    'technology': 'Our Solutions'
  };
  return titles[industry] || 'Our Services';
}

function getDefaultMenuItem(industry: string, index: number): string {
  const items: Record<string, string[]> = {
    'cafe': ['Espresso', 'Cappuccino', 'Latte'],
    'restaurant': ['Signature Dish', 'Chef Special', 'Popular Choice'],
    'ecommerce': ['Product 1', 'Product 2', 'Product 3'],
    'portfolio': ['Project 1', 'Project 2', 'Project 3'],
    'agency': ['Service 1', 'Service 2', 'Service 3'],
    'blog': ['Post 1', 'Post 2', 'Post 3'],
    'fashion': ['Item 1', 'Item 2', 'Item 3'],
    'technology': ['Solution 1', 'Solution 2', 'Solution 3']
  };
  return items[industry]?.[index - 1] || `Item ${index}`;
}

function getDefaultMenuItemDescription(industry: string, index: number): string {
  const descriptions: Record<string, string[]> = {
    'cafe': ['Rich and bold', 'Perfect balance', 'Smooth and creamy'],
    'restaurant': ['Delicious and fresh', 'Authentic flavors', 'Chef recommended'],
    'ecommerce': ['High quality', 'Great value', 'Popular choice'],
    'portfolio': ['Creative design', 'Modern approach', 'User focused'],
    'agency': ['Professional service', 'Expert solution', 'Quality work'],
    'blog': ['Interesting read', 'Valuable insights', 'Engaging content'],
    'fashion': ['Trendy style', 'Comfortable fit', 'Fashionable design'],
    'technology': ['Innovative solution', 'Reliable service', 'Advanced technology']
  };
  return descriptions[industry]?.[index - 1] || `Description for item ${index}`;
}

function getDefaultMenuItemPrice(industry: string, index: number): string {
  const prices: Record<string, string[]> = {
    'cafe': ['฿80', '฿120', '฿140'],
    'restaurant': ['฿250', '฿350', '฿450'],
    'ecommerce': ['฿500', '฿800', '฿1200'],
    'portfolio': ['฿5000', '฿10000', '฿15000'],
    'agency': ['฿10000', '฿25000', '฿50000'],
    'blog': ['Free', 'Free', 'Free'],
    'fashion': ['฿800', '฿1200', '฿1800'],
    'technology': ['฿15000', '฿30000', '฿50000']
  };
  return prices[industry]?.[index - 1] || '฿100';
}

function getFeatureTitle(industry: string, index: number): string {
  const features: Record<string, string[]> = {
    'cafe': ['Fresh Beans', 'Expert Baristas', 'Cozy Atmosphere'],
    'restaurant': ['Fresh Ingredients', 'Expert Chefs', 'Great Service'],
    'ecommerce': ['Fast Delivery', 'Quality Products', 'Great Prices'],
    'portfolio': ['Creative Design', 'Modern Approach', 'User Focused'],
    'agency': ['Expert Team', 'Quality Work', 'Fast Delivery'],
    'blog': ['Quality Content', 'Regular Updates', 'Engaging Stories'],
    'fashion': ['Trendy Styles', 'Quality Materials', 'Perfect Fit'],
    'technology': ['Innovation', 'Reliability', 'Support']
  };
  return features[industry]?.[index - 1] || `Feature ${index}`;
}

function getFeatureDescription(industry: string, index: number): string {
  const descriptions: Record<string, string[]> = {
    'cafe': ['Premium coffee beans sourced daily', 'Trained professionals crafting perfect cups', 'Comfortable space for work and relaxation'],
    'restaurant': ['Locally sourced, fresh ingredients', 'Experienced chefs with passion', 'Friendly and attentive service'],
    'ecommerce': ['Quick and reliable delivery service', 'Carefully selected quality products', 'Competitive prices for value'],
    'portfolio': ['Creative and innovative design solutions', 'Modern and clean aesthetic approach', 'User-centered design philosophy'],
    'agency': ['Experienced and skilled team members', 'High-quality work and attention to detail', 'Fast turnaround times'],
    'blog': ['Well-researched and informative content', 'Regular updates with fresh perspectives', 'Engaging and relatable stories'],
    'fashion': ['Latest trends and fashionable styles', 'High-quality materials and construction', 'Perfect fit and comfort'],
    'technology': ['Cutting-edge innovative solutions', 'Reliable and stable technology', 'Comprehensive support and maintenance']
  };
  return descriptions[industry]?.[index - 1] || `Description for feature ${index}`;
}
