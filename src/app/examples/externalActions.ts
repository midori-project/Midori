// ตัวอย่าง action สำหรับเรียก external API
'use server';

import { authHttpService } from '@/libs/auth/authHttpService';

/**
 * ตัวอย่าง action สำหรับ OAuth integration หรือเรียก external APIs
 * ใช้ authHttpService เมื่อต้องการเรียก third-party services
 */
export async function externalOAuthAction(provider: string) {
  try {
    // เรียก external OAuth API
    const oauthResult = await authHttpService.callExternalAPI<{
      access_token: string;
      user_info: { email: string; name: string };
    }>(`https://api.${provider}.com/oauth/token`, {
      method: 'POST',
      data: {
        client_id: process.env.OAUTH_CLIENT_ID,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
      },
      headers: {
        'Authorization': `Bearer ${process.env.OAUTH_CLIENT_SECRET}`,
      },
    });

    // Process OAuth result
    return {
      success: true,
      data: oauthResult,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'External API error',
    };
  }
}

/**
 * ตัวอย่าง action สำหรับ webhook ที่ต้องเรียก API ของเราเองจาก external client
 * (เช่น mobile app เรียก API ของเรา)
 */
export async function mobileLoginAction(formData: FormData) {
  try {
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const remember = formData.get('remember') === 'on';

    // เรียก API ของเราเองผ่าน HTTP (สำหรับ mobile app simulation)
    const result = await authHttpService.login({ email, password, remember });

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

/**
 * ตัวอย่าง action สำหรับ mobile register
 */
export async function mobileRegisterAction(formData: FormData) {
  try {
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    // เรียก API ของเราเองผ่าน HTTP (สำหรับ mobile app simulation)
    const result = await authHttpService.register({ name, email, password });

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Register failed',
    };
  }
}

/**
 * ตัวอย่าง action สำหรับ mobile logout
 */
export async function mobileLogoutAction() {
  try {
    // เรียก API ของเราเองผ่าน HTTP (สำหรับ mobile app simulation)
    const result = await authHttpService.logout();

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
