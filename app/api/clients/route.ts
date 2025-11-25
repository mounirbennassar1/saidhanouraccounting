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

        // Check if client has orders
        const ordersCount = await prisma.clientOrder.count({
            where: { clientId }
        })

        if (ordersCount > 0) {
            // Soft delete
            await prisma.client.update({
                where: { id: clientId },
                data: { isActive: false }
            })

            return NextResponse.json({
                message: "Client désactivé car il a des commandes existantes",
                soft_delete: true
            })
        }

        // Hard delete
        await prisma.client.delete({
            where: { id: clientId }
        })

        return NextResponse.json({
            message: "Client supprimé avec succès",
            soft_delete: false
        })
    } catch (error) {
        console.error("Error deleting client:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

