import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Public paths that don't require authentication
    const publicPaths = ['/login', '/debug-login']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    
    // Always allow public paths
    if (isPublicPath) {
        return NextResponse.next()
    }

    // Check authentication using NextAuth's getToken
    try {
        const token = await getToken({ 
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        // If not authenticated, redirect to login
        if (!token) {
            // Also check for any NextAuth cookies as fallback
            const hasAuthCookie = request.cookies.getAll().some(cookie => 
                cookie.name.includes('next-auth') || cookie.name.includes('authjs')
            )
            
            if (!hasAuthCookie) {
                const loginUrl = new URL("/login", request.url)
                loginUrl.searchParams.set("callbackUrl", pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        // Allow authenticated requests
        return NextResponse.next()
    } catch (error) {
        // If token check fails, check for cookies as fallback
        const hasAuthCookie = request.cookies.getAll().some(cookie => 
            cookie.name.includes('next-auth') || cookie.name.includes('authjs')
        )
        
        if (!hasAuthCookie) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
        
        // If cookie exists, allow through (might be setting up)
        return NextResponse.next()
    }
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
