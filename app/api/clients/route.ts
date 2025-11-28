import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const clients = await prisma.client.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                orders: {
                    include: {
                        items: true,
                        payments: {
                            include: {
                                caisse: true
                            }
                        }
                    }
                }
            }
        })

        // Calculate totals for each client
        const clientsWithStats = clients.map((client: any) => {
            const totalOrders = client.orders.length
            const totalRevenue = client.orders.reduce((sum: number, order: any) => sum + order.paidAmount, 0)
            const totalOutstanding = client.orders.reduce((sum: number, order: any) => sum + order.remainingAmount, 0)

            return {
                ...client,
                totalOrders,
                totalRevenue,
                totalOutstanding
            }
        })

        return NextResponse.json(clientsWithStats)
    } catch (error) {
        console.error("Error fetching clients:", error)
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
        const { name, email, phone, address, notes } = body

        if (!name) {
            return NextResponse.json(
                { error: "Le nom du client est requis" },
                { status: 400 }
            )
        }

        const client = await prisma.client.create({
            data: {
                name,
                email,
                phone,
                address,
                notes
            }
        })

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        console.error("Error creating client:", error)
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
        const { clientId, name, email, phone, address, notes, isActive } = body

        if (!clientId) {
            return NextResponse.json(
                { error: "L'ID du client est requis" },
                { status: 400 }
            )
        }

        const client = await prisma.client.update({
            where: { id: clientId },
            data: {
                ...(name && { name }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(notes !== undefined && { notes }),
                ...(isActive !== undefined && { isActive })
            }
        })

        return NextResponse.json(client)
    } catch (error) {
        console.error("Error updating client:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('id')

        if (!clientId) {
            return NextResponse.json(
                { error: "L'ID du client est requis" },
                { status: 400 }
            )
        }

        // Get all client orders with their ventes
        const orders = await prisma.clientOrder.findMany({
            where: { clientId },
            include: {
                vente: {
                    include: {
                        transactions: true
                    }
                },
                payments: {
                    include: {
                        transactions: true
                    }
                },
                items: true
            }
        })

        // For each order, delete related ventes and reverse caisse balances
        for (const order of orders) {
            if (order.vente) {
                // Reverse caisse balance for vente transactions
                for (const transaction of order.vente.transactions) {
                    if (transaction.caisseId) {
                        await prisma.caisse.update({
                            where: { id: transaction.caisseId },
                            data: {
                                balance: {
                                    decrement: order.vente.amount
                                }
                            }
                        })
                    }
                }
                // Delete vente transactions
                await prisma.transaction.deleteMany({
                    where: { venteId: order.vente.id }
                })
                // Delete the vente
                await prisma.vente.delete({
                    where: { id: order.vente.id }
                })
            }

            // Delete payment transactions and payments
            for (const payment of order.payments) {
                await prisma.transaction.deleteMany({
                    where: { clientPaymentId: payment.id }
                })
            }
            await prisma.clientPayment.deleteMany({
                where: { orderId: order.id }
            })

            // Delete order items
            await prisma.orderItem.deleteMany({
                where: { orderId: order.id }
            })
        }

        // Delete all orders
        await prisma.clientOrder.deleteMany({
            where: { clientId }
        })

        // Hard delete the client
        await prisma.client.delete({
            where: { id: clientId }
        })

        return NextResponse.json({
            message: "Client et toutes ses données supprimés avec succès",
            soft_delete: false
        })
    } catch (error) {
        console.error("Error deleting client:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

