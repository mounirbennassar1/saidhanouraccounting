import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Public paths that don't require authentication
    const publicPaths = ['/login', '/debug-login']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    
    if (isPublicPath) {
        return NextResponse.next()
    }

    // Check authentication with longer timeout for cookie reading
    const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
    })

    // If not authenticated, redirect to login
    if (!token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

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
