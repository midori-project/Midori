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
  '/projects',
  
  // info pages: allow scroll in some cases; default not set (false)
];

export type AuthPage = AuthPageEntry;
