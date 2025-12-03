"use server";

import { cookies } from 'next/headers';
import { authBusinessService } from '@/libs/auth/authBusinessService';

export async function logoutAction() {
  try {
    // Invalidate session via business service (DB)
    await authBusinessService.logout();

    // Try to remove common session cookie names
    try {
      // Next.js 15: cookies() is now async
      const cookieNames = ['__Host-session', 'midori-session', 'session'];
      const cookieStore = await cookies();
      for (const name of cookieNames) {
        try {
          // set expired cookie to remove in browser
          cookieStore.set({ name, value: '', expires: new Date(0), path: '/' });
        } catch (_) {
          // ignore per-cookie failures
        }
      }
    } catch (err) {
      // best-effort only
      console.warn('Failed to delete cookies in server action', err);
    }

    return { ok: true };
  } catch (error) {
    console.error('logoutAction error', error);
    return { ok: false, error: (error as Error).message || String(error) };
  }
}
