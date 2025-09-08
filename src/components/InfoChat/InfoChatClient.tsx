"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "system" | "assistant" | "user";
  text: string;
}

interface InfoChatClientProps {
  projectId: string;
  initialPrompt?: string;
}

export default function InfoChatClient({ projectId }: InfoChatClientProps) {
  const router = useRouter();
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: `system-${Date.now()}`,
      role: "system",
      text: "เริ่มการตั้งค่า Midori — ตอบคำถามทีละข้อ",
    },
  ]);

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
    if (!value.trim()) return;
    
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
    
    // TODO: Implement new AI flow integration here
    // For now, just show a placeholder response
    setTimeout(() => {
      const reply: Message = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        role: "assistant",
        text: "ขอบคุณสำหรับข้อความของคุณ ระบบ AI ใหม่กำลังพัฒนาอยู่",
      };
      setMessages((s) => [...s, reply]);
      setIsSending(false);
    }, 1000);
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
          </div>
        </>

        {/* input */}
        <div className="fixed left-1/2 bottom-12 transform -translate-x-1/2 w-full px-4 flex flex-col items-center gap-3">
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
