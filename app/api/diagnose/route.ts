import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        checks: {}
    }

    // Check 1: Environment Variables
    diagnostics.checks.envVars = {
        DATABASE_URL: !!process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
    }

    // Check 2: Database Connection
    try {
        await prisma.$connect()
        diagnostics.checks.database = {
            status: "✅ Connected",
            canQuery: false
        }

        // Try to count users
        try {
            const userCount = await prisma.user.count()
            diagnostics.checks.database.canQuery = true
            diagnostics.checks.database.userCount = userCount

            // Try to get admin user
            const adminUser = await prisma.user.findUnique({
                where: { email: "admin@saidapp.com" },
                select: { id: true, email: true, name: true, role: true }
            })

            diagnostics.checks.database.adminExists = !!adminUser
            if (adminUser) {
                diagnostics.checks.database.adminUser = adminUser
            }
        } catch (queryError: any) {
            diagnostics.checks.database.queryError = queryError.message
        }
    } catch (error: any) {
        diagnostics.checks.database = {
            status: "❌ Failed",
            error: error.message
        }
    } finally {
        await prisma.$disconnect()
    }

    // Check 3: NextAuth Configuration
    diagnostics.checks.nextAuth = {
        secretConfigured: !!process.env.NEXTAUTH_SECRET,
        urlConfigured: !!process.env.NEXTAUTH_URL,
        url: process.env.NEXTAUTH_URL
    }

    return NextResponse.json(diagnostics, { 
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}




