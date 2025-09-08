"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { getProjectName, saveFinalJsonToGeneration, getUserIdFromSession } from "./getInitialPromt";

interface Message {
  id: string;
  role: "system" | "assistant" | "user";
  text: string;
}

interface InfoChatClientProps {
  projectId: string;
  initialPrompt?: string;
  sessionId?: string;
}

// Predefined questions mapping (same as in route.ts)
const PREDEFINED_QUESTIONS = {
  "Name": "What is the name of your website project?",
  "Type": "What type of website are you creating? (e.g., blog, restaurant, cafe, fashion, technology, ecommerce, portfolio, agency)",
  "Features": "What specific features do you want on your website? (e.g., contact form, gallery, blog, online store, booking system)",
  "Design.Theme": "What design theme and colors do you prefer? Please specify the theme style and your preferred primary and secondary colors.",
  "Background": "Do you have any specific background information or context about your project that would help us understand your vision better?"
};

// Function to get predefined question for a missing field
function getPredefinedQuestion(field: string): string {
  // สำหรับ Design fields ให้ใช้คำถามรวม
  if (field === "Design.Theme" || field === "Design.PrimaryColor" || field === "Design.SecondaryColor") {
    return PREDEFINED_QUESTIONS["Design.Theme"];
  }
  return PREDEFINED_QUESTIONS[field as keyof typeof PREDEFINED_QUESTIONS] || `โปรดระบุ: ${field}`;
}

export default function InfoChatClient({ projectId,sessionId: initialSessionId }: InfoChatClientProps) {
  const router = useRouter();
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);
  const [initialPrompt, setInitialPrompt] = React.useState<string>("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>("");
  const [totalQuestions, setTotalQuestions] = React.useState<number>(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState<number>(0);
  const [isComplete, setIsComplete] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const initializedRef = React.useRef<boolean>(false);
  const [finalJson, setFinalJson] = React.useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: `system-${Date.now()}`,
      role: "system",
      text: "เริ่มการตั้งค่า Midori — ตอบคำถามทีละข้อ",
    },
  ]);
  console.log('finalJson:', finalJson);

  // Initialize chat
  React.useEffect(() => {
    console.log('=== useEffect ทำงาน ===');
    
    console.log('initialSessionId:', initialSessionId);
    console.log('initializedRef.current:', initializedRef.current);
    console.log('======================');
    
    // ถ้าได้ initialize แล้ว ให้ไม่ทำอะไร
    if (initializedRef.current) {
      console.log('ได้ initialize แล้ว - ไม่ทำอะไร');
      return;
    }
    
    const initializeChat = async () => {
      const projectName = await getProjectName(projectId);
      const initial = projectName || "";
      setInitialPrompt(initial);

      if (initializedRef.current) return;

      // ถ้ามี sessionId จากหน้าแรก ให้ใช้เลย (ไม่ฮาร์ดโค้ดคำถามเพิ่ม)
      if (initialSessionId) {
        setSessionId(initialSessionId);
        initializedRef.current = true;
        setIsInitialized(true);
        return;
      }

      // ไม่มี sessionId → หากมีข้อความเริ่มต้น ให้เรียก API ทันที
      if (!initial.trim()) {
        initializedRef.current = true;
        setIsInitialized(true);
        return;
      }

      setIsAssistantTyping(true);
      setLoading(true);
      
      try {
        const response = await fetch('/api/questionAi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: initial })
        });

        if (!response.ok) {
          throw new Error('Failed to initialize chat');
        }
        const data: {
          sessionId: string;
          currentData: Record<string, unknown>;
          missingFields: string[];
          nextQuestions: string[];
          isComplete?: boolean;
        } = await response.json();

        setSessionId(data.sessionId);
        setIsInitialized(true);
        initializedRef.current = true;

        const nextQuestion = data.nextQuestions?.[0];
        const fallbackQuestion = data.missingFields?.length > 0 ? getPredefinedQuestion(data.missingFields[0]) : undefined;
        const candidateQuestion = nextQuestion || fallbackQuestion;
        const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
        if (candidateQuestion && candidateQuestion !== lastAssistant?.text) {
          setMessages(prev => [
            ...prev,
            { 
              id: `assistant-${Date.now()}-${Math.random()}`, 
              role: "assistant", 
              text: candidateQuestion
            }
          ]);
        }
        const done = data.isComplete ?? ((data.missingFields?.length || 0) === 0);
        setIsComplete(done);
        if (done) {
          alert('✅ ตอบคำถามครบแล้ว! ขอบคุณสำหรับข้อมูล');
          try {
            router.push(`/projects/${projectId}`);
          } catch (e) {
            console.error('navigation error:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        setIsAssistantTyping(false);
        setLoading(false);
      }
    };

    initializeChat();
  }, [projectId, initialSessionId]);

  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 160; // px
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value]);

  // auto-scroll to bottom when messages change
  React.useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!value.trim() || !sessionId || isComplete) return;
    
    setIsSending(true);
    const userMessage = value.trim();
    
    // Add user message
    const newMsg: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      role: "user",
      text: userMessage,
    };
    setMessages((s) => [...s, newMsg]);
    setValue("");
    
    // Show typing indicator
    setIsAssistantTyping(true);
    
    try {
      const request = {
        message: userMessage,
        sessionId: sessionId,
      };

      const response = await fetch('/api/questionAi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      console.log('response:', response);
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data: {
        sessionId: string;
        currentData: Record<string, unknown>;
        missingFields: string[];
        nextQuestions: string[];
        isComplete?: boolean;
      } = await response.json();
      console.log('data:', data);

      // ข้อความถัดไปจาก analyzeAndAskNext
      const nextQuestion = data.nextQuestions?.[0];
      const fallbackQuestion = data.missingFields?.length > 0 ? getPredefinedQuestion(data.missingFields[0]) : undefined;
      const candidateQuestion = nextQuestion || fallbackQuestion;
      const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
      if (candidateQuestion && candidateQuestion !== lastAssistant?.text) {
        const reply: Message = {
          id: `assistant-${Date.now()}-${Math.random()}`,
          role: "assistant",
          text: candidateQuestion
        };
        setMessages((s) => [...s, reply]);
      }

      // สถานะเสร็จสิ้นเมื่อไม่มี missingFields
      const done = data.isComplete ?? ((data.missingFields?.length || 0) === 0);
      setIsComplete(done);
      if (done) {
        alert('✅ ตอบคำถามครบแล้ว! ขอบคุณสำหรับข้อมูล');
      }

      // ถ้าเสร็จแล้ว เก็บ finalJson เป็นโครงสร้างสุดท้ายจาก currentData (เติมค่า null/ช่องว่างให้ครบสคีมา)
      if (done) {
        const normalize = (input: Record<string, unknown>) => ({
          Name: typeof input?.["Name"] === 'string' ? input["Name"] : "",
          Type: typeof input?.["Type"] === 'string' ? input["Type"] : "",
          Features: typeof input?.["Features"] === 'string' ? input["Features"] : "",
          Design: {
            Theme: typeof (input?.["Design"] as any)?.Theme === 'string' ? (input as any).Design.Theme : "",
            PrimaryColor: typeof (input?.["Design"] as any)?.PrimaryColor === 'string' ? (input as any).Design.PrimaryColor : "",
            SecondaryColor: typeof (input?.["Design"] as any)?.SecondaryColor === 'string' ? (input as any).Design.SecondaryColor : "",
            Typography: typeof (input?.["Design"] as any)?.Typography === 'string' ? (input as any).Design.Typography : ""
          },
          Background: (input?.["Background"] ?? null) as string | null
        });
        const normalizedData = normalize(data.currentData || {});
        setFinalJson(normalizedData);
        
        // บันทึก finalJson ลงตาราง generation
        try {
          const result = await saveFinalJsonToGeneration(projectId, {
            finalJson: normalizedData
          });
          if ('id' in result) {
            console.log('บันทึก finalJson ลงตาราง generation สำเร็จ:', result.id);
          } else {
            console.error('เกิดข้อผิดพลาดในการบันทึก finalJson:', result.error);
          }
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการบันทึก finalJson:', error);
        }
        try {
          router.push(`/projects/${projectId}`);
        } catch (e) {
          console.error('navigation error:', e);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsAssistantTyping(false);
      setIsSending(false);
    }
  };



  return (
    <div className="relative rounded-xl">
      <div className="max-w-4xl mx-auto min-h-screen pt-20 relative">
        {/* chat area */}
        <>
          <style>{`.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <div
            ref={chatRef}
            className="space-y-4 overflow-y-auto max-h-[60vh] pb-32 hide-scrollbar"
          >
            {messages.map((m) => (
              <div key={m.id} className="flex">
                <div
                  className={`w-full ${
                    m.role === "user"
                      ? "flex justify-center"
                      : "flex justify-center"
                  }`}
                >
                  <div className="w-full max-w-2xl px-4">
                    <div
                      className={
                        (m.role === "user"
                          ? "bg-[#D4D4D490] text-gray-800 text-sm rounded-xl px-6 py-3 shadow-sm border border-gray-200"
                          : "bg-[#F7FFFC] text-gray-800 text-sm rounded-xl px-6 py-3 shadow-sm border border-gray-100") +
                        " w-full"
                      }
                    >
                      <div className="max-w-[65ch] mx-auto whitespace-pre-wrap break-words break-all">
                        {m.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isAssistantTyping && (
              <div className="flex">
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-2xl px-4">
                    <div className="bg-[#F7FFFC] text-gray-800 text-sm rounded-xl px-6 py-3 shadow-sm border border-gray-100 w-full">
                      <div className="max-w-[65ch] mx-auto">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-full bg-gray-400 animate-pulse" />
                          <span className="inline-block h-3 w-3 rounded-full bg-gray-400 animate-pulse delay-75" />
                          <span className="inline-block h-3 w-3 rounded-full bg-gray-400 animate-pulse delay-150" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>

        {/* Error display */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Redirect notification */}
        {isComplete && (currentQuestionNumber >= 5) && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-pulse">
            ✅ ตอบคำถามครบแล้ว! กำลังนำคุณไปยังหน้าโปรเจค...
          </div>
        )}

        {/* Progress indicator */}
        {totalQuestions > 0 && !isComplete && (
          <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow">
            <div className="text-sm text-gray-600">
              คำถามที่ {currentQuestionNumber} จาก {totalQuestions}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* input */}
        <div className="fixed left-1/2 bottom-12 transform -translate-x-1/2 w-full px-4 flex flex-col items-center gap-3">
          <div className="w-full max-w-2xl">

            {isComplete ? (
              <div className="mb-4 flex justify-center">
                <div className="relative flex items-center justify-center w-80 h-20 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full shadow-lg border-4 border-white/50 overflow-hidden">
                  {/* Background flowers */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <div className="flex space-x-2 animate-pulse">
                      <span className="text-2xl">🌸</span>
                      <span className="text-3xl">🌺</span>
                      <span className="text-2xl">🌷</span>
                      <span className="text-3xl">🌹</span>
                      <span className="text-2xl">🌻</span>
                    </div>
                  </div>
                  {/* Completion message */}
                  <div className="relative z-10 text-center">
                    <div className="text-lg font-semibold text-gray-700 mb-1">
                      การสนทนาเสร็จสมบูรณ์แล้ว ✨
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      <span>ขอบคุณที่ใช้ Midori</span>
                      <span className="animate-bounce">🌺</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent outline-none text-sm px-2 py-2 resize-none max-h-40 overflow-auto"
                  placeholder="Write Your Answer"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  wrap="soft"
                  disabled={loading || !sessionId}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !value.trim() || loading || !sessionId}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white disabled:opacity-50"
                  aria-label="Send"
                >
                  ⤴
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
