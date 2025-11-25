import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'desc' },
            include: {
                caisse: true,
                achat: true,
                charge: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            take: 100
        })

        return NextResponse.json(transactions)
    } catch (error) {
        console.error("Error fetching transactions:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { type, amount, description, caisseId, date } = body

        if (!caisseId) {
            return NextResponse.json({ error: "Caisse ID is required" }, { status: 400 })
        }

        // Create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                type,
                amount,
                description,
                date: date ? new Date(date) : new Date(),
                caisseId,
                userId: session.user.id
            }
        })

        // Update caisse balance based on transaction type
        if (type === 'REVENUE') {
            await prisma.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            })
        } else if (type === 'ACHAT' || type === 'CHARGE') {
            await prisma.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        decrement: amount
                    }
                }
            })
        }

        return NextResponse.json(transaction, { status: 201 })
    } catch (error) {
        console.error("Error creating transaction:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
