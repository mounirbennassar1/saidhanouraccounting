import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const orders = await prisma.supplierOrder.findMany({
      include: {
        supplier: true,
        items: true,
        payments: {
          include: {
            caisse: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching supplier orders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { supplierId, totalAmount, description, notes, dueDate, items, status } = body

    if (!supplierId || !totalAmount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderCount = await prisma.supplierOrder.count()
    const orderNumber = `FSUP-${String(orderCount + 1).padStart(5, '0')}`

    const order = await prisma.supplierOrder.create({
      data: {
        orderNumber,
        supplierId,
        totalAmount,
        remainingAmount: totalAmount,
        description,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'CONFIRMED',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: {
        supplier: true,
        items: true
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

