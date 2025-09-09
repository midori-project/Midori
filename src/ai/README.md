# Midori Agent Starter (prompts + configs + schemas)

โฟลเดอร์นี้ประกอบด้วย:
- `/prompts` — system prompts รายเอเจนต์ (markdown)
- `/config/agents` — คอนฟิกแต่ละเอเจนต์ + profiles (dev/prod)
- `/config/policies` — quality-gates, escalation, interaction (ลดคำถามจุกจิก)
- `/config/schemas` — JSON Schemas สำหรับตรวจ I/O ของเอเจนต์

วิธีใช้โดยย่อ:
1) เลือกโปรไฟล์ผ่าน ENV: `MIDORI_PROFILE=dev|prod`
2) โหลด `config/agents/<agent>.json` → อ่านพาธไปยัง schemas/policies
3) โหลด `prompts/<agent>.system.md` เป็น system prompt และระบุ model จากคอนฟิก
4) ตรวจ I/O ด้วย JSON Schema ก่อนเขียน DB

แนะนำให้เก็บ SHA-256 ของทุกไฟล์ในคอนฟิก/พรอมต์ ลงใน `Agent.config` และ log ใน CommandEvent เพื่อ reproducibility
