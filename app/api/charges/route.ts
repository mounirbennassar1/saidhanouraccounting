import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const charges = await prisma.charge.findMany({
            orderBy: { date: 'desc' },
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })

        return NextResponse.json(charges)
    } catch (error) {
        console.error("Error fetching charges:", error)
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
        const { description, amount, category, reference, notes, isPaid, caisseId } = body

        // Validate required fields
        if (!description || !amount || !category) {
            return NextResponse.json(
                { error: "Description, amount, and category are required" },
                { status: 400 }
            )
        }

        // If marking as paid, caisseId is required
        if (isPaid && !caisseId) {
            return NextResponse.json(
                { error: "Caisse ID is required when marking charge as paid" },
                { status: 400 }
            )
        }

        // Check if caisse has sufficient balance
        if (isPaid && caisseId) {
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
        }

        const charge = await prisma.charge.create({
            data: {
                description,
                amount,
                category,
                reference,
                notes,
                isPaid: isPaid || false,
                transactions: isPaid ? {
                    create: {
                        type: 'CHARGE',
                        amount,
                        description,
                        caisseId,
                        userId: session.user.id
                    }
                } : undefined
            },
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })

        // Update caisse balance if paid and caisseId is provided
        if (isPaid && caisseId) {
            await prisma.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        decrement: amount
                    }
                }
            })
        }

        return NextResponse.json(charge, { status: 201 })
    } catch (error) {
        console.error("Error creating charge:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, chargeId, description, amount, category, reference, notes, isPaid, caisseId } = body
        const targetId = id || chargeId

        if (!targetId) {
            return NextResponse.json(
                { error: "Charge ID is required" },
                { status: 400 }
            )
        }

        // Get the existing charge
        const existingCharge = await prisma.charge.findUnique({
            where: { id: targetId },
            include: {
                transactions: true
            }
        })

        if (!existingCharge) {
            return NextResponse.json(
                { error: "Charge not found" },
                { status: 404 }
            )
        }

        // If updating basic fields (description, amount, category, etc.)
        if (description !== undefined || amount !== undefined || category !== undefined) {
            const updatedCharge = await prisma.charge.update({
                where: { id: targetId },
                data: {
                    ...(description && { description }),
                    ...(amount && { amount }),
                    ...(category && { category }),
                    ...(reference !== undefined && { reference }),
                    ...(notes !== undefined && { notes }),
                    ...(isPaid !== undefined && { isPaid })
                }
            })
            return NextResponse.json(updatedCharge)
        }

        // If marking as paid
        if (isPaid && !existingCharge.isPaid) {
            if (!caisseId) {
                return NextResponse.json(
                    { error: "Caisse ID is required when marking charge as paid" },
                    { status: 400 }
                )
            }

            // Check caisse balance
            const caisse = await prisma.caisse.findUnique({
                where: { id: caisseId }
            })

            if (!caisse) {
                return NextResponse.json(
                    { error: "Caisse not found" },
                    { status: 404 }
                )
            }

            if (caisse.balance < existingCharge.amount) {
                return NextResponse.json(
                    { error: `Insufficient balance in ${caisse.name}. Available: ${caisse.balance} DH, Required: ${existingCharge.amount} DH` },
                    { status: 400 }
                )
            }

            // Update charge and create transaction
            const updatedCharge = await prisma.charge.update({
                where: { id: targetId },
                data: {
                    isPaid: true,
                    transactions: {
                        create: {
                            type: 'CHARGE',
                            amount: existingCharge.amount,
                            description: existingCharge.description,
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

            // Deduct from caisse
            await prisma.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        decrement: existingCharge.amount
                    }
                }
            })

            return NextResponse.json(updatedCharge)
        }

        // If marking as unpaid (reversal)
        if (!isPaid && existingCharge.isPaid) {
            const transaction = existingCharge.transactions[0]
            
            if (transaction && transaction.caisseId) {
                // Refund to caisse
                await prisma.caisse.update({
                    where: { id: transaction.caisseId },
                    data: {
                        balance: {
                            increment: existingCharge.amount
                        }
                    }
                })

                // Delete transaction
                await prisma.transaction.delete({
                    where: { id: transaction.id }
                })
            }

            // Update charge
            const updatedCharge = await prisma.charge.update({
                where: { id: targetId },
                data: {
                    isPaid: false
                },
                include: {
                    transactions: {
                        include: {
                            caisse: true
                        }
                    }
                }
            })

            return NextResponse.json(updatedCharge)
        }

        return NextResponse.json(existingCharge)
    } catch (error) {
        console.error("Error updating charge:", error)
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

        // Get charge with transactions to update caisse balance
        const charge = await prisma.charge.findUnique({
            where: { id },
            include: {
                transactions: true
            }
        })

        if (!charge) {
            return NextResponse.json({ error: "Charge not found" }, { status: 404 })
        }

        // If charge was paid, restore caisse balances
        if (charge.isPaid) {
            for (const transaction of charge.transactions) {
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
        }

        // Delete charge (transactions will be deleted automatically due to cascade)
        await prisma.charge.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting charge:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
