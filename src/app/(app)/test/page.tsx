"use client";

import { useState } from "react";

interface AnalyzeAndAskNextResponse {
  sessionId: string;
  currentData: Record<string, unknown>;
  missingFields: string[];
  nextQuestions: string[];
  error?: string;
}

export default function TestQuestionAiPage() {
  const [message, setMessage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<AnalyzeAndAskNextResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    setResponseData(null);
    try {
      const res = await fetch("/api/questionAi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: sessionId ?? undefined })
      });

      const data: AnalyzeAndAskNextResponse = await res.json();
      if (!res.ok) {
        setError(data?.error || `Request failed with status ${res.status}`);
        return;
      }

      setSessionId(data.sessionId);
      setResponseData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Test questionAi route</h1>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="message" style={{ display: "block", fontWeight: 600 }}>ข้อความที่จะส่ง</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="พิมพ์ requirement หรือข้อมูลโปรเจกต์ของคุณ..."
          style={{ width: "100%", padding: 12, fontFamily: "inherit" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        <button onClick={handleSend} disabled={loading || !message.trim()} style={{ padding: "8px 16px" }}>
          {loading ? "กำลังส่ง..." : "ส่งไปที่ /api/questionAi"}
        </button>
        {sessionId && (
          <code style={{ background: "#f4f4f5", padding: "4px 8px", borderRadius: 4 }}>
            sessionId: {sessionId}
          </code>
        )}
      </div>

      {error && (
        <div style={{ color: "#b91c1c", marginTop: 12 }}>เกิดข้อผิดพลาด: {error}</div>
      )}

      {responseData && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>ผลลัพธ์</h2>
          <div style={{ marginTop: 8 }}>
            <div>
              <strong>currentData</strong>
              <pre style={{ background: "#0a0a0a", color: "#e5e7eb", padding: 12, borderRadius: 6, overflow: "auto" }}>
{JSON.stringify(responseData.currentData, null, 2)}
              </pre>
            </div>
            <div>
              <strong>missingFields</strong>
              <pre style={{ background: "#0a0a0a", color: "#e5e7eb", padding: 12, borderRadius: 6, overflow: "auto" }}>
{JSON.stringify(responseData.missingFields, null, 2)}
              </pre>
            </div>
            <div>
              <strong>nextQuestions</strong>
              <pre style={{ background: "#0a0a0a", color: "#e5e7eb", padding: 12, borderRadius: 6, overflow: "auto" }}>
{JSON.stringify(responseData.nextQuestions, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

