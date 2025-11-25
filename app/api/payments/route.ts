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
        const orderId = searchParams.get('orderId')

        const where = orderId ? { orderId } : {}

        const payments = await prisma.clientPayment.findMany({
            where,
            orderBy: { paymentDate: 'desc' },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                caisse: true
            }
        })

        return NextResponse.json(payments)
    } catch (error) {
        console.error("Error fetching payments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        console.log('Payment request - User ID:', userId)

        // Verify user exists in database
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            console.error('User not found in database:', userId)
            return NextResponse.json({ error: "User not found in database" }, { status: 404 })
        }

        console.log('User verified:', user.email)

        const body = await request.json()
        const { orderId, amount, caisseId, paymentMethod, reference, notes } = body

        if (!orderId || !amount || !caisseId) {
            return NextResponse.json(
                { error: "Commande, montant et caisse sont requis" },
                { status: 400 }
            )
        }

        // Get the order
        const order = await prisma.clientOrder.findUnique({
            where: { id: orderId },
            include: {
                client: true
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: "Commande non trouvée" },
                { status: 404 }
            )
        }

        // Validate payment amount
        if (amount <= 0) {
            return NextResponse.json(
                { error: "Le montant doit être supérieur à 0" },
                { status: 400 }
            )
        }

        if (amount > order.remainingAmount) {
            return NextResponse.json(
                { error: `Le montant dépasse le solde restant (${order.remainingAmount} DH)` },
                { status: 400 }
            )
        }

        // Get the caisse
        const caisse = await prisma.caisse.findUnique({
            where: { id: caisseId }
        })

        if (!caisse) {
            return NextResponse.json(
                { error: "Caisse non trouvée" },
                { status: 404 }
            )
        }

        // Calculate new amounts
        const newPaidAmount = order.paidAmount + amount
        const newRemainingAmount = order.totalAmount - newPaidAmount

        // Determine new status
        let newStatus = order.status
        if (newRemainingAmount === 0) {
            newStatus = 'FULLY_PAID'
        } else if (newPaidAmount > 0) {
            newStatus = 'PARTIALLY_PAID'
        }

        // Create payment and update order in a transaction
        const payment = await prisma.$transaction(async (tx) => {
            // Create payment record
            const newPayment = await tx.clientPayment.create({
                data: {
                    orderId,
                    amount,
                    caisseId,
                    paymentMethod: paymentMethod || 'CASH',
                    reference,
                    notes
                }
            })

            // Update order amounts and status
            await tx.clientOrder.update({
                where: { id: orderId },
                data: {
                    paidAmount: newPaidAmount,
                    remainingAmount: newRemainingAmount,
                    status: newStatus
                }
            })

            // Add to caisse balance
            await tx.caisse.update({
                where: { id: caisseId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            })

            // Create transaction record for tracking
            const transactionData = {
                type: 'REVENUE' as const,
                amount,
                description: `Paiement client: ${order.client.name} - Commande ${order.orderNumber}`,
                caisseId,
                clientPaymentId: newPayment.id,
                userId: userId,
                reference: reference || order.orderNumber
            }
            
            console.log('Creating transaction with data:', transactionData)
            
            await tx.transaction.create({
                data: transactionData
            })

            return newPayment
        })

        // Fetch the complete payment with relations
        const completePayment = await prisma.clientPayment.findUnique({
            where: { id: payment.id },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                caisse: true
            }
        })

        return NextResponse.json(completePayment, { status: 201 })
    } catch (error) {
        console.error("Error creating payment:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

