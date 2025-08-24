"use server";

import { redirect } from "next/navigation";
import { RegisterSchema } from "@/schemas/auth/register";
import { authBusinessService } from "@/libs/auth/authBusinessService";

export type State = { ok: boolean; error?: string | null };

export async function registerAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  // 1) Coerce form values to string
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  // 2) Validate
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
    };
  }

  const { name, email, password } = parsed.data;

  try {
    // 3) Call authBusinessService directly (Internal Flow)
    await authBusinessService.register({ name, email, password });

    // 4) Redirect to login page (user needs to verify email)
    redirect("/login?message=กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
  } catch (error: unknown) {
    // Handle business logic errors directly
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก" };
  }
}
