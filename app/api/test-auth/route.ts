import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        
        return NextResponse.json({
            success: true,
            authenticated: !!session,
            session: session ? {
                user: session.user,
                expires: session.expires
            } : null,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error("Auth test error:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Auth check failed",
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}


