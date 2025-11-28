import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const ventes = await prisma.vente.findMany({
            orderBy: { date: 'desc' },
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                },
                clientOrder: {
                    include: {
                        client: true
                    }
                }
            }
        })

        return NextResponse.json(ventes)
    } catch (error) {
        console.error("Error fetching ventes:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { description, quantity, unitPrice, category, reference, notes, caisseId } = body

        if (!description || !quantity || !unitPrice) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const amount = quantity * unitPrice

        // Create vente
        const vente = await prisma.vente.create({
            data: {
                description,
                amount,
                quantity,
                unitPrice,
                category,
                reference,
                notes
            }
        })

        // If caisse is provided, create transaction and update caisse balance
        if (caisseId) {
            await prisma.transaction.create({
                data: {
                    type: 'VENTE',
                    amount,
                    description: `Vente: ${description}`,
                    caisseId,
                    venteId: vente.id,
                    userId: session.user.id
                }
            })

            // Update caisse balance (add revenue)
            await prisma.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            })
        }

        return NextResponse.json(vente, { status: 201 })
    } catch (error) {
        console.error("Error creating vente:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, description, quantity, unitPrice, category, reference, notes } = body

        if (!id) {
            return NextResponse.json({ error: "Vente ID required" }, { status: 400 })
        }

        // Check if vente is linked to a client order
        const existingVente = await prisma.vente.findUnique({
            where: { id },
            select: { clientOrderId: true }
        })

        if (existingVente?.clientOrderId) {
            return NextResponse.json({ 
                error: "Cette vente est liée à une commande client et ne peut pas être modifiée directement" 
            }, { status: 400 })
        }

        const amount = quantity * unitPrice

        const vente = await prisma.vente.update({
            where: { id },
            data: {
                description,
                amount,
                quantity,
                unitPrice,
                category,
                reference,
                notes
            }
        })

        return NextResponse.json(vente)
    } catch (error) {
        console.error("Error updating vente:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "Vente ID required" }, { status: 400 })
        }

        // Get vente with transactions first
        const vente = await prisma.vente.findUnique({
            where: { id },
            include: {
                transactions: true,
                clientOrder: true
            }
        })

        if (!vente) {
            return NextResponse.json({ error: "Vente not found" }, { status: 404 })
        }

        // If vente is linked to a client order, unlink it first
        if (vente.clientOrderId) {
            await prisma.vente.update({
                where: { id },
                data: { clientOrderId: null }
            })
        }

        // Reverse caisse balance changes
        for (const transaction of vente.transactions) {
            if (transaction.caisseId) {
                await prisma.caisse.update({
                    where: { id: transaction.caisseId },
                    data: {
                        balance: {
                            decrement: vente.amount
                        }
                    }
                })
            }
        }

        // Delete transactions first
        await prisma.transaction.deleteMany({
            where: { venteId: id }
        })

        // Delete vente
        await prisma.vente.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting vente:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

