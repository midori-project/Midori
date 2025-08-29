"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ChatRequest, ChatResponse } from "@/types/chat";
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
      setInitialPrompt(projectName || "");
      
      if (!initialPrompt || initializedRef.current) return;
      
      // ป้องกันการเรียกซ้ำ
      initializedRef.current = true;
      
      // ถ้ามี sessionId จากหน้าแรก ให้ใช้เลย
      if (initialSessionId) {
        console.log('ใช้ sessionId จากหน้าแรก:', initialSessionId);
        setSessionId(initialSessionId);
        initializedRef.current = true;
        setIsInitialized(true);
        
        // เพิ่มข้อความเริ่มต้น
        setMessages(prev => [
          ...prev,
          { 
            id: `assistant-${Date.now()}-${Math.random()}`, 
            role: "assistant", 
            text: "ชื่อโปรเจ็คที่คุณต้องการสร้างคืออะไร?" 
          }
        ]);
        return;
      }
      
      // ถ้าไม่มี sessionId ให้เรียก API เอง
      console.log('ไม่มี sessionId จากหน้าแรก - เรียก API เอง');
      setIsAssistantTyping(true);
      setLoading(true);
      
      try {
        const request: ChatRequest = {
          message: initialPrompt,
        };

        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize chat');
        }

        const data: ChatResponse = await response.json();
        
        if (data.success) {
          setSessionId(data.sessionId);
          setCurrentQuestion(data.currentquestion || "");
          setTotalQuestions(data.totalQuestions || 0);
          setCurrentQuestionNumber(data.currentQuestion || 0);
          setIsComplete(data.isComplete);
          setIsInitialized(true);
          initializedRef.current = true;
          
          // Debug: แสดงคำถามทั้งหมด
          console.log('=== คำถามทั้งหมด ===');
          console.log('Session ID:', data.sessionId);
          console.log('คำถามปัจจุบัน:', data.currentquestion);
          console.log('จำนวนคำถามทั้งหมด:', data.totalQuestions);
          console.log('คำถามที่:', data.currentQuestion);
          console.log('Analysis:', data.analysis);
          if (data.analysis?.refinementQuestions) {
            console.log('คำถามทั้งหมด:');
            data.analysis.refinementQuestions.forEach((question, index) => {
              console.log(`${index + 1}. ${question}`);
            });
          }
          console.log('========================');
          
          // Add assistant message
          setMessages(prev => [
            ...prev,
            { 
              id: `assistant-${Date.now()}-${Math.random()}`, 
              role: "assistant", 
              text: data.message 
            }
          ]);
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการเริ่มต้นการสนทนา');
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
  }, [initialPrompt]);

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
      const request: ChatRequest = {
        message: userMessage,
        sessionId: sessionId,
      };

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();
      
             if (data.success) {
         setCurrentQuestion(data.currentquestion || "");
         setTotalQuestions(data.totalQuestions || 0);
         setCurrentQuestionNumber(data.currentQuestion || 0);
         setIsComplete(data.isComplete);
         
         // เก็บ finalJson ถ้ามี
         if (data.finalJson) {
           setFinalJson(data.finalJson);
         }
         
         // Debug: แสดงคำถามที่เปลี่ยนไป
         console.log('=== คำถามที่เปลี่ยนไป ===');
         console.log('คำถามใหม่:', data.currentquestion);
         console.log('คำถามที่:', data.currentQuestion);
         console.log('จำนวนคำถามทั้งหมด:', data.totalQuestions);
         console.log('เสร็จสิ้น:', data.isComplete);
         console.log('finalJson exists:', !!data.finalJson);
         console.log('========================');
        
        // Add assistant message
        const reply: Message = {
          id: `assistant-${Date.now()}-${Math.random()}`,
          role: "assistant",
          text: data.message,
        };
        setMessages((s) => [...s, reply]);
        
        // ถ้าตอบคำถามครบ 5 ข้อแล้ว ให้ redirect ไปหน้า [id]/ อัตโนมัติ
        if (data.isComplete && (data.currentQuestion || 0) >= 5) {
          console.log('ตอบคำถามครบ 5 ข้อแล้ว - redirect ไปหน้า project');
          
          // บันทึก finalJson ลงในตาราง generation
          if (data.finalJson && sessionId) {
            try {
              // สร้าง finalPrompt จากข้อความทั้งหมดในแชท
              const allMessages = [...messages, {
                id: `user-${Date.now()}`,
                role: "user" as const,
                text: userMessage
              }, {
                id: `assistant-${Date.now()}`,
                role: "assistant" as const,
                text: data.message
              }];
              
              const finalPrompt = allMessages
                .filter(msg => msg.role === "user" || msg.role === "assistant")
                .map(msg => `${msg.role === "user" ? "ผู้ใช้" : "AI"}: ${msg.text}`)
                .join("\n");
              
              // บันทึกข้อมูล
              await saveFinalJsonToGeneration(
                projectId,
                await getUserIdFromSession(sessionId) || "unknown",
                data.finalJson,
                finalPrompt,
                sessionId
              );
              
              console.log("บันทึก finalJson สำเร็จ");
            } catch (error) {
              console.error("Error saving finalJson:", error);
            }
          }
          
          // แสดงข้อความแจ้งเตือน
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: `system-redirect-${Date.now()}`,
                role: "system",
                text: "✅ ตอบคำถามครบแล้ว! กำลังนำคุณไปยังหน้าโปรเจคในอีก 2 วินาที..."
              }
            ]);
          }, 1000);
          
          setTimeout(() => {
            router.push(`/projects/${projectId}`);
          }, 3000); // รอ 3 วินาทีให้ผู้ใช้เห็นข้อความแจ้งเตือน
        }
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsAssistantTyping(false);
      setIsSending(false);
    }
  };

  const handleGenerateSite = async () => {
    if (!finalJson) {
      setError('ไม่มีข้อมูลสำหรับสร้างเว็บไซต์');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gensite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalJson,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate site');
      }

      const data = await response.json();
      
      if (data.success) {
        // ไปหน้า preview พร้อม generationId
        router.push(`/preview/${projectId}?generationId=${data.generationId}`);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์');
      }
    } catch (error) {
      console.error('Error generating site:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
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

            {isComplete && finalJson && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleGenerateSite}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      กำลังสร้างเว็บไซต์...
                    </>
                  ) : (
                    <>
                      🚀 สร้างเว็บไซต์และดูพรีวิว
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent outline-none text-sm px-2 py-2 resize-none max-h-40 overflow-auto"
                placeholder={isComplete ? "การสนทนาสิ้นสุดแล้ว" : "Write Your Answer"}
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
                disabled={loading || !sessionId || isComplete}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !value.trim() || loading || !sessionId || isComplete}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white disabled:opacity-50"
                aria-label="Send"
              >
                ⤴
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
