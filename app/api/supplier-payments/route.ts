import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, amount, caisseId, paymentMethod, reference, notes } = body

    console.log('Supplier payment request - User ID:', session.user.id)

    if (!orderId || !amount || !caisseId) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.error('User not found in database:', session.user.id)
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Get the order
    const order = await prisma.supplierOrder.findUnique({
      where: { id: orderId },
      include: { supplier: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Validate payment amount
    if (amount <= 0 || amount > order.remainingAmount) {
      return NextResponse.json(
        { error: 'Montant de paiement invalide' },
        { status: 400 }
      )
    }

    // Get the caisse
    const caisse = await prisma.caisse.findUnique({
      where: { id: caisseId }
    })

    if (!caisse) {
      return NextResponse.json(
        { error: 'Caisse non trouvée' },
        { status: 404 }
      )
    }

    // Check if caisse has enough balance
    if (caisse.balance < amount) {
      return NextResponse.json(
        { error: 'Solde insuffisant dans la caisse' },
        { status: 400 }
      )
    }

    // Calculate new amounts
    const newPaidAmount = order.paidAmount + amount
    const newRemainingAmount = order.remainingAmount - amount
    let newStatus = order.status

    if (newRemainingAmount === 0) {
      newStatus = 'FULLY_PAID'
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID'
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.supplierPayment.create({
        data: {
          orderId,
          amount,
          caisseId,
          paymentMethod: paymentMethod || 'CASH',
          reference,
          notes
        }
      })

      // Update order
      await tx.supplierOrder.update({
        where: { id: orderId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus
        }
      })

      // DEDUCT from caisse (opposite of client payment)
      await tx.caisse.update({
        where: { id: caisseId },
        data: {
          balance: {
            decrement: amount
          }
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          type: 'CHARGE',
          amount,
          description: `Paiement fournisseur: ${order.supplier.name} - ${order.orderNumber}`,
          reference: reference || payment.id,
          caisseId,
          supplierPaymentId: payment.id,
          userId: session.user.id
        }
      })

      return payment
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error processing supplier payment:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    )
  }
}

