import { NextRequest, NextResponse } from 'next/server';
import { ServerTemplateEngine } from '@/template-system/core/ServerTemplateEngine';
import { AIContentGenerator } from '@/template-system/core/AIContentGenerator';
import { PlaceholderReplacer } from '@/template-system/core/PlaceholderReplacer';
import { TemplateProcessor } from '@/template-system/core/TemplateProcessor';
import { UserData, Template } from '@/template-system/types/Template';
import { PlaceholderMatch } from '@/template-system/types/Placeholder';

interface TestResult {
  testName: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const { testType, testData } = await request.json();
    
    console.log(`🧪 [API] Template Test Request: ${testType}`);
    
    const results: TestResult[] = [];
    
    // ข้อมูลทดสอบ
    const testUserData: UserData = {
      brandName: 'ร้านกาแฟทดสอบ',
      theme: 'cozy',
      content: {
        heroTitle: 'ยินดีต้อนรับสู่ร้านกาแฟทดสอบ',
        heroSubtitle: 'กาแฟสดใหม่ อบอุ่นใจ',
        ctaLabel: 'สั่งซื้อเลย'
      },
      customizations: {
        colors: {
          primary: '#8B4513',
          secondary: '#D2691E'
        }
      }
    };

    const testTemplate: Template = {
      key: 'coffee-shop-test',
      label: 'Coffee Shop Test Template',
      category: 'food',
      meta: {
        description: 'Template สำหรับทดสอบร้านกาแฟ',
        engine: 'react-vite-tailwind',
        status: 'published',
        author: 'Test System',
        versioningPolicy: 'semver'
      },
      tags: ['food', 'coffee', 'test'],
      initialVersion: {
        version: 1,
        semver: '1.0.0',
        status: 'published',
        sourceFiles: [
          {
            path: 'src/components/Hero.tsx',
            type: 'code',
            encoding: 'utf8',
            content: `
import React from 'react';

export default function Hero() {
  return (
    <div className="hero-section">
      <h1 className="<tw/>"><text/></h1>
      <p className="hero-subtitle"><text/></p>
      <button className="<tw/>"><text/></button>
      <img src="<img/>" alt="Hero Image" />
    </div>
  );
}`
          }
        ],
        slots: {
          heroTitle: { 
            type: 'text',
            fields: [
              {
                key: 'content',
                type: 'text',
                required: true,
                default: 'ยินดีต้อนรับสู่ร้านกาแฟทดสอบ'
              }
            ]
          },
          heroSubtitle: { 
            type: 'text',
            fields: [
              {
                key: 'content',
                type: 'text',
                required: true,
                default: 'กาแฟสดใหม่ อบอุ่นใจ'
              }
            ]
          },
          ctaLabel: { 
            type: 'text',
            fields: [
              {
                key: 'content',
                type: 'text',
                required: true,
                default: 'สั่งซื้อเลย'
              }
            ]
          }
        },
        constraints: {}
      },
      placeholderConfig: {
        hasPlaceholders: true,
        placeholderTypes: {
          tw: 2,
          text: 3,
          img: 1,
          data: 0
        },
        themeMapping: {
          modern: 'primary:sky-600; accent:amber-400; radius:xl; elevation:lg',
          cozy: 'primary:emerald-600; accent:orange-400; radius:lg; elevation:md',
          minimal: 'primary:gray-600; accent:blue-400; radius:sm; elevation:sm'
        }
      }
    };

    // ฟังก์ชันทดสอบ
    const runTest = async (testName: string, testFunction: () => Promise<any>): Promise<TestResult> => {
      const startTime = Date.now();
      
      try {
        const result = await testFunction();
        const duration = Date.now() - startTime;
        
        return {
          testName,
          success: true,
          result,
          duration
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        
        return {
          testName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration
        };
      }
    };

    // ทดสอบ AI Content Generator
    const testAIContentGenerator = async () => {
      const aiGenerator = new AIContentGenerator();
      
      const placeholder: PlaceholderMatch = {
        fullMatch: '<text/>',
        type: 'text',
        position: 0,
        context: { file: 'hero.tsx', line: 5 }
      };

      const content = await aiGenerator.generatePlaceholderContent(
        placeholder,
        testUserData,
        testTemplate,
        'hero section'
      );

      return { placeholder: placeholder.type, content };
    };

    // ทดสอบ Tailwind AI
    const testTailwindAI = async () => {
      const aiGenerator = new AIContentGenerator();
      
      const placeholder: PlaceholderMatch = {
        fullMatch: '<tw/>',
        type: 'tw',
        position: 0,
        context: { file: 'button.tsx', line: 10 }
      };

      const classes = await aiGenerator.generatePlaceholderContent(
        placeholder,
        testUserData,
        testTemplate,
        'button component'
      );

      return { placeholder: placeholder.type, classes };
    };

    // ทดสอบ PlaceholderReplacer
    const testPlaceholderReplacer = async () => {
      const replacer = new PlaceholderReplacer();
      
      const testContent = `
<div className="hero-section">
  <h1 className="<tw/>"><text/></h1>
  <p className="hero-subtitle"><text/></p>
  <button className="<tw/>"><text/></button>
  <img src="<img/>" alt="Hero Image" />
</div>`;

      const processedContent = await replacer.replacePlaceholders(
        testContent,
        { ...testUserData, useAI: true },
        testTemplate
      );

      return { 
        original: testContent, 
        processed: processedContent,
        hasPlaceholders: testContent.includes('<tw/>') || testContent.includes('<text/>'),
        processedHasPlaceholders: processedContent.includes('<tw/>') || processedContent.includes('<text/>')
      };
    };

    // ทดสอบ TemplateProcessor
    const testTemplateProcessor = async () => {
      const processor = new TemplateProcessor();
      
      const processedTemplate = await processor.processTemplate(testTemplate, testUserData);

      return {
        filesCount: processedTemplate.files.length,
        manifest: processedTemplate.manifest,
        validation: processedTemplate.validation,
        processingTime: processedTemplate.metadata.processingTime
      };
    };

    // ทดสอบ ServerTemplateEngine
    const testServerTemplateEngine = async () => {
      const engine = new ServerTemplateEngine({
        outputDir: './test-output',
        autoExport: false,
        exportFormat: 'json'
      });

      const result = await engine.processTemplate(testTemplate, testUserData);

      return {
        success: result.success,
        processingTime: result.processingTime,
        error: result.error,
        outputPath: result.outputPath,
        processedTemplate: result.processedTemplate, // เพิ่ม processed template
        finalJson: result.finalJson // เพิ่ม finalJson ที่รวม options
      };
    };

    // ทดสอบ API Key
    const testAPIKey = async () => {
      const apiKey = process.env.QUESTION_API_KEY;
      
      return {
        hasApiKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        isValidFormat: apiKey?.startsWith('sk-') && (apiKey?.length || 0) > 20
      };
    };

    // รันการทดสอบตาม testType
    switch (testType) {
      case 'all':
        results.push(await runTest('API Key Check', testAPIKey));
        results.push(await runTest('AI Content Generator', testAIContentGenerator));
        results.push(await runTest('Tailwind AI', testTailwindAI));
        results.push(await runTest('PlaceholderReplacer', testPlaceholderReplacer));
        results.push(await runTest('TemplateProcessor', testTemplateProcessor));
        results.push(await runTest('ServerTemplateEngine', testServerTemplateEngine));
        break;
        
      case 'ai-content':
        results.push(await runTest('AI Content Generator', testAIContentGenerator));
        break;
        
      case 'tailwind-ai':
        results.push(await runTest('Tailwind AI', testTailwindAI));
        break;
        
      case 'placeholder-replacer':
        results.push(await runTest('PlaceholderReplacer', testPlaceholderReplacer));
        break;
        
      case 'template-processor':
        results.push(await runTest('TemplateProcessor', testTemplateProcessor));
        break;
        
      case 'server-template-engine':
        results.push(await runTest('ServerTemplateEngine', testServerTemplateEngine));
        break;
        
      case 'api-key':
        results.push(await runTest('API Key Check', testAPIKey));
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Unknown test type: ${testType}`,
            availableTests: ['all', 'ai-content', 'tailwind-ai', 'placeholder-replacer', 'template-processor', 'server-template-engine', 'api-key']
          },
          { status: 400 }
        );
    }

    // คำนวณสถิติ
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;
    const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total);
    const successRate = Math.round((passed / total) * 100);

    return NextResponse.json({
      success: true,
      testType,
      results,
      summary: {
        total,
        passed,
        failed,
        successRate,
        avgDuration,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [API] Template Test Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'all';
  
  // ใช้ POST method แทน
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType })
  });
  
  return POST(mockRequest);
}
