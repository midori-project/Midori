// app/login/action.ts
'use server';

import { redirect } from 'next/navigation';
import { LoginSchema } from '@/schemas/auth/login';
import { authBusinessService } from '@/libs/auth/authBusinessService';

type State = { ok: boolean; error?: string | null };

export async function loginAction(prevState: State, formData: FormData): Promise<State> {
  // 1) Coerce form values to string
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    remember: formData.get('remember') === 'on',
  };

  // 2) Validate
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const { email, password, remember } = parsed.data;

  try {
    // 3) Call authBusinessService directly (Internal Flow)
    await authBusinessService.login({ email, password, remember });
    
    // 4) Redirect to home page on success
    redirect('/');
  } catch (error: unknown) {
    // Handle business logic errors directly
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    
    return { ok: false, error: 'เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ' };
  }
}
