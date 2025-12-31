import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
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

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

      // Check if user is authenticated
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/signin";
        return Response.redirect(url);
      }

      // For development: Allow any authenticated user to access admin
      // In production, you can change this to check for specific roles
      const allowedRoles = ["ADMIN", "EDITOR", "VIEWER"]; // Temporary: allow all roles
      
      if (!allowedRoles.includes(token.role as string)) {
        const url = req.nextUrl.clone();
        url.pathname = "/unauthorized";
        return Response.redirect(url);
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle authorization
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};