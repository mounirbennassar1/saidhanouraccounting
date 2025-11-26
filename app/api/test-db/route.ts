import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Try to connect to database
        const userCount = await prisma.user.count()
        
        return NextResponse.json({
            success: true,
            message: "Database connection successful",
            userCount,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error("Database connection error:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Database connection failed",
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}





