import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  ChatSession
} from '@/types/chat';
//analyzeandasknext
// In-memory storage for chat sessions (should be replaced with database in production)
const chatSessions = new Map<string, ChatSession>();

// Initialize OpenAI client (will error clearly if key missing)
const apiKey = process.env.QUESTION_API_KEY;
const openai = new OpenAI({
  apiKey,
});

// Generate unique session ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Set nested value by dot-path, create objects as needed
function setByPath(target: Record<string, any>, path: string, value: any) {
  const parts = path.split('.');
  let cur: any = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] == null || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

// Parse AI response to extract JSON
function parseAIResponse(response: string): any {
  try {
    // ลองหา JSON object ที่สมบูรณ์
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      
      // ลอง parse JSON
      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Problematic JSON string:', jsonString);
        
        // ลองแก้ไข JSON ที่มีปัญหา
        const cleanedJson = jsonString
          .replace(/,\s*}/g, '}') // ลบ comma ที่อยู่ท้าย object
          .replace(/,\s*]/g, ']') // ลบ comma ที่อยู่ท้าย array
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // ลบ control characters
        
        try {
          return JSON.parse(cleanedJson);
        } catch (secondError) {
          console.error('Second parse attempt failed:', secondError);
          return null;
        }
      }
    }
    
    // ถ้าไม่เจอ JSON object ลองหา JSON array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (parseError) {
        console.error('Array parse error:', parseError);
        return null;
      }
    }
    
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Full AI response:', response);
    return null;
  }
}

// Create new chat session
function createNewSession(): ChatSession {
  const sessionId = generateId();
  const session: ChatSession = {
    id: sessionId,
    messages: [],
    currentStep: 'initial',
    userResponses: {},
    currentData: {},
    askedFields: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  chatSessions.set(sessionId, session);
  return session;
}

// Types local to this route
interface AnalyzeAndAskNextResponse {
  currentData: Record<string, any>;
  missingFields: string[];
  nextQuestions: string[];
}

function deepMerge(prev: any, next: any): any {
  if (Array.isArray(prev) || Array.isArray(next) || typeof prev !== 'object' || typeof next !== 'object') {
    return next ?? prev;
  }
  const out: any = { ...prev };
  for (const key of Object.keys(next ?? {})) {
    out[key] = key in prev ? deepMerge(prev[key], next[key]) : next[key];
  }
  return out;
}

const REQUIRED_FIELDS = [
  "Name",
  "Type", 
  "Features",
  "Design.Theme",
  "Design.PrimaryColor", 
  "Design.SecondaryColor",
  "Background",
];

// ชุดคำถามที่กำหนดไว้ล่วงหน้าเพื่อให้ครบถ้วนและไม่ซ้ำ
const PREDEFINED_QUESTIONS = {
  "Name": "What is the name of your website project?",
  "Type": "What type of website are you creating? (e.g., blog, restaurant, cafe, fashion, technology, ecommerce, portfolio, agency)",
  "Features": "What specific features do you want on your website? (e.g., contact form, gallery, blog, online store, booking system)",
  "Design.Theme": "What design theme and colors do you prefer? Please specify the theme style and your preferred primary and secondary colors.",
  "Background": "Do you have any specific background information or context about your project that would help us understand your vision better?"
};

function getMissingFields(data: Record<string, any>): string[] {
  const has = (path: string) => {
    const parts = path.split('.');
    let cur: any = data;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object' || !(p in cur)) return false;
      cur = cur[p];
    }
    return cur !== undefined && cur !== null && cur !== "";
  };
  return REQUIRED_FIELDS.filter((f) => !has(f));
}

// Core analyzer used by this route
async function analyzeAndAskNext(userPrompt: string, existing: Record<string, any>): Promise<AnalyzeAndAskNextResponse> {
  const systemPrompt = `
You are a professional assistant for gathering website project requirements. Your task is to analyze user input and extract relevant information while asking targeted questions for missing data.

CURRENT SESSION DATA (do NOT re-ask fields that already have values):
${JSON.stringify(existing ?? {}, null, 2)}

REQUIRED FIELDS TO COLLECT:
1. Name - Website/project name
2. Type - Website type (blog, restaurant, cafe, fashion, technology, ecommerce, portfolio, agency, etc.)
3. Goal - Main purpose/objective of the website
4. Features - Specific functionality needed (contact form, gallery, blog, online store, booking system, etc.)
5. Design.Theme - Overall design style/theme
6. Design.PrimaryColor - Main color scheme
7. Design.SecondaryColor - Secondary/accent color
8. Background - Additional context or background information

CRITICAL INSTRUCTIONS:
- Analyze the user's input carefully to extract ANY relevant information
- For Design fields (Theme, PrimaryColor, SecondaryColor), treat them as a single combined field
- Be intelligent about inferring missing information from context
- If user mentions website type keywords (blog, restaurant, cafe, etc.), extract the Type field
- If user describes colors or design preferences, extract all Design fields from that response

PREDEFINED QUESTIONS (use exactly as written, in English only):
- Name: "What is the name of your website project?"
- Type: "What type of website are you creating? (e.g., blog, restaurant, cafe, fashion, technology, ecommerce, portfolio, agency)"
- Goal: "What is the main goal or purpose of your website?"
- Features: "What specific features do you want on your website? (e.g., contact form, gallery, blog, online store, booking system)"
- Design.Theme: "What design theme and colors do you prefer? Please specify the theme style and your preferred primary and secondary colors."
- Background: "Do you have any specific background information or context about your project that would help us understand your vision better?"

RESPONSE FORMAT (valid JSON only):
{
  "currentData": {
    "Name": "extracted name or empty string",
    "Type": "extracted type or empty string", 
    "Features": "extracted features or empty string",
    "Design": {
      "Theme": "extracted theme or empty string",
      "PrimaryColor": "extracted primary color or empty string",
      "SecondaryColor": "extracted secondary color or empty string"
    },
    "Background": "extracted background or null"
  },
  "missingFields": ["list of field names that are still missing"],
  "nextQuestions": ["list of predefined questions for missing fields only"]
}

STRICT RULES:
1. Extract information intelligently - don't just look for exact matches
2. If user says "I want a blog about cooking" → extract Type: "blog", Goal: "cooking blog"
3. If user says "blue and white colors" → extract PrimaryColor: "blue", SecondaryColor: "white"
4. Only ask questions for fields that are actually missing
5. Use ONLY the predefined questions above
6. For Design fields, ask the combined question only once
7. Return valid JSON only - no additional text
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `User Input:\n${userPrompt}` }
    ],
  });

  const content = completion.choices[0]?.message?.content || '';
  const parsed = parseAIResponse(content);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Analyzer returned invalid JSON');
  }

  // Merge with existing to avoid losing previously collected fields
  const merged = deepMerge(existing ?? {}, parsed.currentData ?? {});
  const missing = getMissingFields(merged);
  
  // ใช้ชุดคำถามที่กำหนดไว้ล่วงหน้าแทนการสร้างคำถามใหม่
  const questions: string[] = missing.map(field => {
    // สำหรับ Design fields ให้รวมเป็นคำถามเดียว
    if (field === "Design.Theme" || field === "Design.PrimaryColor" || field === "Design.SecondaryColor") {
      return PREDEFINED_QUESTIONS["Design.Theme"];
    }
    return PREDEFINED_QUESTIONS[field as keyof typeof PREDEFINED_QUESTIONS] || "";
  }).filter((q, index, arr) => {
    // ลบคำถามซ้ำ (โดยเฉพาะ Design question)
    return q && arr.indexOf(q) === index;
  });

  return {
    currentData: merged,
    missingFields: missing,
    nextQuestions: questions
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'QUESTION_API_KEY is not set on the server' }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const userMessage: string = body?.message ?? '';
    let sessionId: string | undefined = body?.sessionId;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Ensure session exists (in-memory only)
    if (!sessionId || !chatSessions.get(sessionId)) {
      const newSession = createNewSession();
      sessionId = newSession.id;
      chatSessions.set(sessionId, newSession);
    }

    const session = chatSessions.get(sessionId)!;
    // Apply the current user answer to lastField BEFORE analysis to avoid repeating the same question
    const prevLastField: string | undefined = (session as any).lastField;
    const effectiveData = deepMerge({}, session.currentData ?? {});
    if (prevLastField && typeof userMessage === 'string' && userMessage.trim().length > 0) {
      setByPath(effectiveData as any, prevLastField, userMessage.trim());
    }

    // Analyze with the effective data so missing fields advance properly
    const analysis = await analyzeAndAskNext(userMessage, effectiveData);

    // Persist merged lastField answer to the session store
    if (prevLastField && typeof userMessage === 'string' && userMessage.trim().length > 0) {
      session.currentData = session.currentData ?? {};
      setByPath(session.currentData as any, prevLastField, userMessage.trim());
    }

    // Update session minimal state
    session.updatedAt = new Date();
    
    // Merge all data sources: AI analysis + direct field answers
    const mergedData = deepMerge(session.currentData ?? {}, analysis.currentData ?? {});
    session.currentData = mergedData;
    
    // Recalculate missing fields based on merged data
    const finalMissingFields = getMissingFields(mergedData);
    
    // Generate questions for missing fields
    const finalQuestions: string[] = finalMissingFields.map(field => {
      // สำหรับ Design fields ให้รวมเป็นคำถามเดียว
      if (field === "Design.Theme" || field === "Design.PrimaryColor" || field === "Design.SecondaryColor") {
        return PREDEFINED_QUESTIONS["Design.Theme"];
      }
      return PREDEFINED_QUESTIONS[field as keyof typeof PREDEFINED_QUESTIONS] || "";
    }).filter((q, index, arr) => {
      // ลบคำถามซ้ำ (โดยเฉพาะ Design question)
      return q && arr.indexOf(q) === index;
    });
    
    // dedupe asked questions
    const askedSet = new Set((session as any).askedFields ?? []);
    const dedupQuestions = finalQuestions.filter((q) => {
      const key = q.trim().toLowerCase();
      if (askedSet.has(key)) return false;
      askedSet.add(key);
      return true;
    });
    (session as any).askedFields = Array.from(askedSet);
    
    // Advance lastField to the next missing field (first in list), or undefined if complete
    const nextField = finalMissingFields[0];
    (session as any).lastField = nextField;
    
    const isComplete = finalMissingFields.length === 0;
    return NextResponse.json({ 
      sessionId, 
      currentData: session.currentData, 
      missingFields: finalMissingFields, 
      nextQuestions: dedupQuestions, 
      lastField: (session as any).lastField, 
      isComplete 
    });
  } catch (err: any) {
    console.error('questionAi POST error:', err);
    const message = typeof err?.message === 'string' ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}