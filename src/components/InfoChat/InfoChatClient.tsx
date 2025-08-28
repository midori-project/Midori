"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "system" | "assistant" | "user";
  text: string;
}

export default function InfoChatClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const VISIBLE_LIMIT = 6;
  const chatRef = React.useRef<HTMLDivElement | null>(null);

  // Sequential AI questions: user must answer each before next appears
  const AI_QUESTIONS = [
    "ขอคำอธิบายสั้น ๆ เกี่ยวกับโปรเจคของคุณ (1-2 ประโยค)",
    "ใครคือลูกค้าหลักของคุณ?",
    "ฟีเจอร์สำคัญที่ต้องมีคืออะไร?",
    "มีตัวอย่างสไตล์ดีไซน์หรือเว็บที่ชอบไหม?",
    "งบประมาณและเวลาที่ต้องการประมาณเท่าไร? งบประมาณและเวลาที่ต้องการประมาณเท่าไร?",
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "m1",
      role: "system",
      text: "เริ่มการตั้งค่า Midori — ตอบคำถามทีละข้อ",
    },
    { id: "m2", role: "assistant", text: AI_QUESTIONS[0] },
  ]);

  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 160; // px
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value]);

  // auto-scroll to bottom when messages change (user can still scroll up)
  React.useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!value.trim()) return;
    setIsSending(true);
    const newMsg: Message = {
      id: String(Date.now()),
      role: "user",
      text: value.trim(),
    };
    setMessages((s) => [...s, newMsg]);
    setValue("");
    // simulate assistant processing with typing animation, then show next question
    setIsAssistantTyping(true);
    setTimeout(() => {
      setIsAssistantTyping(false);
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < AI_QUESTIONS.length) {
        const reply: Message = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: AI_QUESTIONS[nextIndex],
        };
        setMessages((s) => [...s, reply]);
        setCurrentQuestionIndex(nextIndex);
      } else {
        const reply: Message = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "ขอบคุณ คำตอบของคุณถูกบันทึกแล้ว — การสอบถามเสร็จสิ้น",
        };
        setMessages((s) => [...s, reply]);
      }
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="relative rounded-xl">
      <div className="max-w-4xl mx-auto min-h-screen pt-20 relative">
        {/* chat area: allow user to scroll up; hide visible scrollbar for cleaner look */}
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

        {/* input */}
        <div className="fixed left-1/2 bottom-12 transform -translate-x-1/2 w-full px-4 flex flex-col items-center gap-3">
{/*           <div className="flex flex-row gap-4">
            <button className="px-3 py-1 rounded-full bg-white text-sm shadow">
              help me
            </button>
            <button className="px-3 py-1 rounded-full bg-white text-sm shadow">
              skip questions
            </button>
            <button
              className="px-3 py-1 rounded-full bg-white text-sm shadow"
              onClick={() => router.push("/")}
            >
              Exit & Continue
            </button>
          </div> */}
          <div className="w-full max-w-2xl">
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
              />
              <button
                onClick={handleSend}
                disabled={isSending || !value.trim()}
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
