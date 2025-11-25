import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Public paths that don't require authentication
    const publicPaths = ['/login', '/debug-login']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    
    // Always allow public paths
    if (isPublicPath) {
        return NextResponse.next()
    }

    // Check for session cookie
    const sessionToken = request.cookies.get(
        process.env.NODE_ENV === 'production' 
            ? '__Secure-next-auth.session-token'
            : 'next-auth.session-token'
    )

    // If no session cookie, redirect to login
    if (!sessionToken) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Allow authenticated requests
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
