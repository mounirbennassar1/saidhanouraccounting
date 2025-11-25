import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const achats = await prisma.achat.findMany({
            orderBy: { date: 'desc' },
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })

        return NextResponse.json(achats)
    } catch (error) {
        console.error("Error fetching achats:", error)
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
        const { description, amount, category, reference, notes, caisseId } = body

        // Validate required fields
        if (!description || !amount || !category) {
            return NextResponse.json(
                { error: "Description, amount, and category are required" },
                { status: 400 }
            )
        }

        // Caisse is required for achats
        if (!caisseId) {
            return NextResponse.json(
                { error: "Caisse ID is required for purchases" },
                { status: 400 }
            )
        }

        // Check if caisse exists and has sufficient balance
        const caisse = await prisma.caisse.findUnique({
            where: { id: caisseId }
        })

        if (!caisse) {
            return NextResponse.json(
                { error: "Caisse not found" },
                { status: 404 }
            )
        }

        if (caisse.balance < amount) {
            return NextResponse.json(
                { error: `Insufficient balance in ${caisse.name}. Available: ${caisse.balance} DH, Required: ${amount} DH` },
                { status: 400 }
            )
        }

        // Create achat with transaction
        const achat = await prisma.achat.create({
            data: {
                description,
                amount,
                category,
                reference,
                notes,
                transactions: {
                    create: {
                        type: 'ACHAT',
                        amount,
                        description,
                        caisseId,
                        userId: session.user.id
                    }
                }
            },
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })

        // Update caisse balance
        await prisma.caisse.update({
            where: { id: caisseId },
            data: {
                balance: {
                    decrement: amount
                }
            }
        })

        return NextResponse.json(achat, { status: 201 })
    } catch (error) {
        console.error("Error creating achat:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, description, amount, category, reference, notes } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const achat = await prisma.achat.update({
            where: { id },
            data: {
                description,
                amount,
                category,
                reference,
                notes
            }
        })

        return NextResponse.json(achat)
    } catch (error) {
        console.error("Error updating achat:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        // Get achat with transactions to update caisse balance
        const achat = await prisma.achat.findUnique({
            where: { id },
            include: {
                transactions: true
            }
        })

        if (!achat) {
            return NextResponse.json({ error: "Achat not found" }, { status: 404 })
        }

        // Restore caisse balances
        for (const transaction of achat.transactions) {
            if (transaction.caisseId) {
                await prisma.caisse.update({
                    where: { id: transaction.caisseId },
                    data: {
                        balance: {
                            increment: transaction.amount
                        }
                    }
                })
            }
        }

        // Delete achat (transactions will be deleted automatically due to cascade)
        await prisma.achat.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting achat:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
