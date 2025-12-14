import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // Fetch all data within date range
    const [caisses, achats, charges, clientOrders, supplierOrders, transactions, ventes] = await Promise.all([
      // Get all caisses with transaction count
      prisma.caisse.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          _count: {
            select: {
              transactions: {
                where: {
                  date: {
                    gte: start,
                    lte: end,
                  },
                },
              },
            },
          },
        },
      }),

      // Get achats
      prisma.achat.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { date: 'desc' },
      }),

      // Get charges
      prisma.charge.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { date: 'desc' },
      }),

      // Get client orders
      prisma.clientOrder.findMany({
        where: {
          orderDate: {
            gte: start,
            lte: end,
          },
        },
        include: {
          client: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),

      // Get supplier orders
      prisma.supplierOrder.findMany({
        where: {
          orderDate: {
            gte: start,
            lte: end,
          },
        },
        include: {
          supplier: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),

      // Get all transactions
      prisma.transaction.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          caisse: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),

      // Get all ventes
      prisma.vente.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { date: 'desc' },
      }),
    ])

    // Calculate summary
    const totalRevenue = transactions
      .filter(t => t.type === 'REVENUE' || t.type === 'VENTE')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalVentes = ventes.reduce((sum, v) => sum + v.amount, 0)
    const totalAchats = achats.reduce((sum, a) => sum + a.amount, 0)
    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0)

    const clientPayments = clientOrders.reduce((sum, o) => sum + o.paidAmount, 0)
    const supplierPayments = supplierOrders.reduce((sum, o) => sum + o.paidAmount, 0)

    const totalExpenses = totalAchats + totalCharges + supplierPayments
    const netProfit = totalRevenue + clientPayments - totalExpenses

    // Format response
    const reportData = {
      summary: {
        totalRevenue,
        totalVentes,
        totalExpenses,
        netProfit,
        totalAchats,
        totalCharges,
        clientPayments,
        supplierPayments,
      },
      caisses: caisses.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        balance: c.balance,
        transactions: c._count.transactions,
      })),
      achats: achats.map(a => ({
        id: a.id,
        description: a.description,
        amount: a.amount,
        category: a.category,
        date: a.date.toISOString(),
        reference: a.reference,
      })),
      charges: charges.map(c => ({
        id: c.id,
        description: c.description,
        amount: c.amount,
        category: c.category,
        date: c.date.toISOString(),
        isPaid: c.isPaid,
      })),
      clientOrders: clientOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        clientName: o.client.name,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        remainingAmount: o.remainingAmount,
        status: o.status,
        orderDate: o.orderDate.toISOString(),
      })),
      supplierOrders: supplierOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        supplierName: o.supplier.name,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        remainingAmount: o.remainingAmount,
        status: o.status,
        orderDate: o.orderDate.toISOString(),
      })),
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date.toISOString(),
        caisseName: t.caisse?.name,
      })),
      ventes: ventes.map(v => ({
        id: v.id,
        description: v.description,
        amount: v.amount,
        quantity: v.quantity,
        unitPrice: v.unitPrice,
        category: v.category,
        date: v.date.toISOString(),
        reference: v.reference,
      })),
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

