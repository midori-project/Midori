import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'กรุณากรอกอีเมลให้ถูกต้อง' }),
  password: z.string().min(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }),
  remember: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;