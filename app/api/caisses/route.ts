import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const caisses = await prisma.caisse.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 10
                }
            }
        })

        return NextResponse.json(caisses)
    } catch (error) {
        console.error("Error fetching caisses:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, type, balance, fixedAmount, description } = body

        const caisse = await prisma.caisse.create({
            data: {
                name,
                type,
                balance: balance || 0,
                fixedAmount,
                description
            }
        })

        return NextResponse.json(caisse, { status: 201 })
    } catch (error) {
        console.error("Error creating caisse:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
