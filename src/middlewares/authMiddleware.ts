import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";


// Enhance the withAuth function: Change from object config to function + config pattern
export default withAuth(
  // Middleware function to run after authentication check
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    
    console.log(`Middleware triggered for: ${pathname}, Token exists: ${!!req.nextauth.token}, User role: ${req.nextauth.token?.role}`);

    // Allow auth API routes to pass through
    if (pathname.startsWith("/api/auth")) {
      return;
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      if (req.nextauth.token) {
        console.log(`Redirecting authenticated user away from auth page: ${pathname}`);
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
      
      console.log(`Admin access attempt: ${req.nextauth.token?.email} with role: ${userRole} for path: ${pathname}`);
      
      if (!allowedRoles.includes(userRole)) {
        console.log(`Access denied for role: ${userRole}`);
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
        
        console.log(`Authorized callback for: ${pathname}`);
        console.log(`Token exists: ${!!token}`);
        console.log(`Token details:`, JSON.stringify(token, null, 2));
        
        // Allow access to auth pages without authentication
        if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
          console.log('Allowing auth pages');
          return true;
        }
        
        // Require authentication for admin routes
        if (pathname.startsWith("/admin")) {
          const hasToken = !!token;
          console.log(`Admin route access - Has token: ${hasToken}`);
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