import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        console.log("Simple login attempt for:", email)

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: "Email and password required"
            }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        console.log("User found:", !!user)

        if (!user || !user.password) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 401 })
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password)
        console.log("Password valid:", isValid)

        if (!isValid) {
            return NextResponse.json({
                success: false,
                error: "Invalid password"
            }, { status: 401 })
        }

        // Success!
        return NextResponse.json({
            success: true,
            message: "Login would succeed",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })

    } catch (error: any) {
        console.error("Simple login error:", error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}


