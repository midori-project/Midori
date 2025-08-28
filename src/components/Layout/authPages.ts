// Shared list of auth-related routes used by layout components
export const authPages = [
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
];

export type AuthPage = (typeof authPages)[number];
