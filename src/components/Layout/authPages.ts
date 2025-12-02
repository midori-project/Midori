// Shared list of auth-related routes used by layout components
export type AuthPageEntry =
  | string
  | { base: string; allowScroll?: boolean };

export const authPages: AuthPageEntry[] = [
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/info',
  '/chat',
  '/template',
  '/test',
  '/editor'
  // ไม่ใส่ /projects เพื่อให้ projects/workspace มี navbar
  // แต่ต้องการซ่อน navbar เฉพาะ projects/[id] เท่านั้น
  
  // info pages: allow scroll in some cases; default not set (false)
];

export type AuthPage = AuthPageEntry;
