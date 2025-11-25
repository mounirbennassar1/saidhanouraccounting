import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Skip middleware for API routes and static files
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next()
    }

    const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
    })

    const isAuthPage = pathname === "/login"
    const isAuthenticated = !!token

    // If user is on login page and authenticated, redirect to home
    if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    // If user is not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !isAuthPage) {
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
