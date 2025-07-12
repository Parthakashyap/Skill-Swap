import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl;

    // Redirect new users to the profile page to complete setup
    if (token?.isNewUser && url.pathname !== '/profile') {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
    
    // Check admin access for admin routes
    if (url.pathname.startsWith('/admin') && !token?.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Allow API requests, internal Next.js requests, and static files to pass through
        if (pathname.startsWith('/api/') || 
            pathname.startsWith('/_next/') || 
            pathname.includes('.') // for static files like favicon.ico
           ) {
          return true;
        }
        
        // Allow the homepage and login page to be public
        if (pathname === '/' || pathname === '/login') {
            return true;
        }

        // For admin routes, require both authentication and admin status
        if (pathname.startsWith('/admin')) {
          return !!(token && token.isAdmin);
        }

        // If there's a token, the user is authorized for any other page.
        return !!token;
      },
    },
     pages: {
      signIn: '/login',
    },
  }
);

// This ensures the middleware runs on all paths,
// and the authorization logic is handled in the `authorized` callback.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};