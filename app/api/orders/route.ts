import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('clientId')

        const where = clientId ? { clientId } : {}

        const orders = await prisma.clientOrder.findMany({
            where,
            orderBy: { orderDate: 'desc' },
            include: {
                client: true,
                items: true,
                payments: {
                    include: {
                        caisse: true
                    }
                }
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error("Error fetching orders:", error)
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
        const { clientId, items, description, notes, dueDate } = body

        if (!clientId || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Client et articles sont requis" },
                { status: 400 }
            )
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.unitPrice)
        }, 0)

        // Generate order number
        const orderCount = await prisma.clientOrder.count()
        const orderNumber = `ORD-${(orderCount + 1).toString().padStart(5, '0')}`

        // Create order with items
        const order = await prisma.clientOrder.create({
            data: {
                orderNumber,
                clientId,
                totalAmount,
                remainingAmount: totalAmount,
                description,
                notes,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'CONFIRMED',
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            },
            include: {
                client: true,
                items: true
            }
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error("Error creating order:", error)
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
        const { orderId, status, description, notes } = body

        if (!orderId) {
            return NextResponse.json(
                { error: "L'ID de la commande est requis" },
                { status: 400 }
            )
        }

        const order = await prisma.clientOrder.update({
            where: { id: orderId },
            data: {
                ...(status && { status }),
                ...(description !== undefined && { description }),
                ...(notes !== undefined && { notes })
            },
            include: {
                client: true,
                items: true,
                payments: true
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Error updating order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}



