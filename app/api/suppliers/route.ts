import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        orders: {
          include: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each supplier
    const suppliersWithStats = suppliers.map(supplier => {
      const totalOrders = supplier.orders.length
      const totalAmount = supplier.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalPaid = supplier.orders.reduce((sum, order) => sum + order.paidAmount, 0)
      const totalOwed = supplier.orders.reduce((sum, order) => sum + order.remainingAmount, 0)

      return {
        ...supplier,
        stats: {
          totalOrders,
          totalAmount,
          totalPaid,
          totalOwed
        }
      }
    })

    return NextResponse.json(suppliersWithStats)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fournisseurs' },
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
    const { name, email, phone, address, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du fournisseur est requis' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        notes
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du fournisseur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du fournisseur requis' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du fournisseur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du fournisseur requis' },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fournisseur' },
      { status: 500 }
    )
  }
}

