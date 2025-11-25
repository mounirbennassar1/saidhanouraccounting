import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Allow these paths without authentication
    const publicPaths = ['/login', '/debug-login']
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    // Check authentication
    const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
    })

    // If not authenticated, redirect to login
    if (!token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If authenticated and trying to access login, redirect to home
    if (token && publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url))
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
