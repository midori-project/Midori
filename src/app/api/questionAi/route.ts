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
  "Goal",
  "Features",
  "Design.Theme",
  "Design.PrimaryColor",
  "Design.SecondaryColor",
  "Design.Typography",
  "Background",
];

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
You are a professional assistant for gathering website project requirements.

Known current data (do NOT re-ask these): 
${JSON.stringify(existing ?? {}, null, 2)}

Your goal is to extract the following fields from the user's message:

- Name
- Type (e.g., blog, restaurant, cafe, fashion, technology, ecommerce, portfolio, agency)
- Goal
- Features
- Design:
  - Theme
  - PrimaryColor
  - SecondaryColor
  - Typography
- Background

If any fields are missing, generate natural language questions to ask the user.

Do not guess or fill in any missing values yourself.

Strict question rules:
- nextQuestions MUST be written in English only.
- Ask questions ONLY for fields listed in missingFields.
- Do NOT include questions about fields that already exist in Known current data.
- Each question should focus on a single field.

Your response must be a valid JSON object in this format:

{
  "currentData": {
    // fields extracted from userPrompt
  },
  "missingFields": [
    "FieldName",
    "Design.Theme"
  ],
  "nextQuestions": [
    "What's the name of your project?",
    "Do you have a design theme in mind?"
  ]
}

Rules for currentData structure:
- currentData MUST follow EXACTLY this schema (keys and nesting):
{
  "Name": "",
  "Type": "",
  "Goal": "",
  "Features": "",
  "Design": {
    "Theme": "",
    "PrimaryColor": "",
    "SecondaryColor": "",
  },
  "Background": ""||null
}
- Only include keys that you can extract with confidence from the user input.
- If a field is not provided by the user, DO NOT invent values; leave it out of currentData and list it in missingFields.
- When all fields are provided (no missingFields), nextQuestions should be an empty array.
- Do not include any text outside of the JSON object.
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
  const questions: string[] = Array.isArray(parsed.nextQuestions) ? parsed.nextQuestions : [];

  return {
    currentData: merged,
    missingFields: missing,
    nextQuestions: questions.filter((q) => typeof q === 'string' && q.trim().length > 0)
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
    // If previous question targeted a specific field, treat current message as the answer
    const prevLastField: string | undefined = (session as any).lastField;
    if (prevLastField && typeof userMessage === 'string' && userMessage.trim().length > 0) {
      session.currentData = session.currentData ?? {};
      setByPath(session.currentData as any, prevLastField, userMessage.trim());
    }

    const analysis = await analyzeAndAskNext(userMessage, session.currentData ?? {});

    // Update session minimal state
    session.updatedAt = new Date();
    session.currentData = analysis.currentData ?? session.currentData ?? {};
    // dedupe asked questions
    const askedSet = new Set((session as any).askedFields ?? []);
    const dedupQuestions = (analysis.nextQuestions ?? []).filter((q) => {
      const key = q.trim().toLowerCase();
      if (askedSet.has(key)) return false;
      askedSet.add(key);
      return true;
    });
    (session as any).askedFields = Array.from(askedSet);
    // Advance lastField to the next missing field (first in list), or undefined if complete
    const nextField = (analysis.missingFields ?? [])[0];
    (session as any).lastField = nextField;
    
    const isComplete = (analysis.missingFields?.length ?? 0) === 0;
    return NextResponse.json({ sessionId, currentData: session.currentData, missingFields: analysis.missingFields, nextQuestions: dedupQuestions, lastField: (session as any).lastField, isComplete });
  } catch (err: any) {
    console.error('questionAi POST error:', err);
    const message = typeof err?.message === 'string' ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}