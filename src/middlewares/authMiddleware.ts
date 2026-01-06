import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";


// Enhance the withAuth function: Change from object config to function + config pattern
export default withAuth(
  // Middleware function to run after authentication check
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    
    // Allow auth API routes to pass through
    if (pathname.startsWith("/api/auth")) {
      return;
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      if (req.nextauth.token) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return Response.redirect(url);
      }
      return; // Allow unauthenticated users to access auth pages
    }

    // Protect admin routes - this only runs if user is authenticated (due to authorized callback)
    if (pathname.startsWith("/admin")) {
      // Only allow users with ADMIN or EDITOR roles to access admin routes
      const allowedRoles = ["ADMIN", "EDITOR"]; 
      const userRole = req.nextauth.token?.role as string;
      
      if (!allowedRoles.includes(userRole)) {
        const url = req.nextUrl.clone();
        url.pathname = "/unauthorized";
        return Response.redirect(url);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages without authentication
        if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
          return true;
        }
        
        // Require authentication for admin routes
        if (pathname.startsWith("/admin")) {
          const hasToken = !!token;
          return hasToken;
        }
        
        // Allow other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", 
    "/signin", 
    "/signup", 
    "/api/auth/:path*",
    "/preview/:path*",  // Add preview routes if they need protection
    "/((?!api|_next/static|_next/image|favicon.ico|public|unauthorized).*)"
  ],
};