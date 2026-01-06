import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Reusable function to get the current session on server side
export async function getSession() {
  return await getServerSession(authOptions);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'ADMIN';
}

// Check if user has admin or editor role
export async function isAdminOrEditor(): Promise<boolean> {
  const session = await getSession();
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'EDITOR';
}

// Check if user can access admin routes
export async function canAccessAdmin(): Promise<boolean> {
  const hasAccess = await isAdminOrEditor();
  return hasAccess;
}

// Get current user
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

// Check if user has required role
export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await getSession();
  const userRole = session?.user?.role;
  
  // Define role hierarchy
  const roleHierarchy = {
    'VIEWER': 0,
    'EDITOR': 1,
    'ADMIN': 2,
    'SUPER_ADMIN': 3
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}

// Redirect paths for different user states
export const AUTH_PATHS = {
  SIGNIN: '/signin',
  SIGNUP: '/signup', 
  SIGNOUT: '/signout',
  ERROR: '/error',
  VERIFY_REQUEST: '/verify-request',
} as const;

export const PROTECTED_PATHS = {
  ADMIN: '/admin',
  EDITOR: '/admin/editor',
  PROFILE: '/profile',
} as const;