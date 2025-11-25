import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get all caisses with their balances and transactions
        const caisses = await prisma.caisse.findMany({
            include: {
                transactions: {
                    include: {
                        achat: true,
                        charge: true
                    }
                }
            }
        })

        // Get total achats with transactions
        const achats = await prisma.achat.findMany({
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })
        const totalAchats = achats.reduce((sum: number, achat: any) => sum + achat.amount, 0)

        // Get total charges with transactions
        const charges = await prisma.charge.findMany({
            include: {
                transactions: {
                    include: {
                        caisse: true
                    }
                }
            }
        })
        const totalCharges = charges.reduce((sum: number, charge: any) => sum + charge.amount, 0)
        const paidCharges = charges.filter((c: any) => c.isPaid).reduce((sum: number, charge: any) => sum + charge.amount, 0)
        const unpaidCharges = charges.filter((c: any) => !c.isPaid).reduce((sum: number, charge: any) => sum + charge.amount, 0)

        // Calculate total caisse balance
        const totalCaisseBalance = caisses.reduce((sum: number, caisse: any) => sum + caisse.balance, 0)

        // Calculate spent amounts per caisse
        const caisseDetails = caisses.map((caisse: any) => {
            const achatTransactions = caisse.transactions.filter((t: any) => t.type === 'ACHAT')
            const chargeTransactions = caisse.transactions.filter((t: any) => t.type === 'CHARGE')
            const revenueTransactions = caisse.transactions.filter((t: any) => t.type === 'REVENUE')
            const venteTransactions = caisse.transactions.filter((t: any) => t.type === 'VENTE')
            
            const totalAchatsFromCaisse = achatTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
            const totalChargesFromCaisse = chargeTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
            const totalRevenue = revenueTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
            const totalVentes = venteTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
            const totalSpent = totalAchatsFromCaisse + totalChargesFromCaisse

            return {
                id: caisse.id,
                name: caisse.name,
                type: caisse.type,
                balance: caisse.balance,
                fixedAmount: caisse.fixedAmount,
                totalAchats: totalAchatsFromCaisse,
                totalCharges: totalChargesFromCaisse,
                totalRevenue: totalRevenue,
                totalVentes: totalVentes,
                totalSpent: totalSpent,
                transactionCount: caisse.transactions.length
            }
        })

        // Get recent transactions with full details
        const recentTransactions = await prisma.transaction.findMany({
            take: 10,
            orderBy: { date: 'desc' },
            include: {
                caisse: true,
                achat: true,
                charge: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Calculate achats by category and by caisse
        const achatsByCategory = achats.reduce((acc: Record<string, number>, achat: any) => {
            acc[achat.category] = (acc[achat.category] || 0) + achat.amount
            return acc
        }, {} as Record<string, number>)

        const achatsByCaisse = achats.reduce((acc: Record<string, number>, achat: any) => {
            achat.transactions.forEach((t: any) => {
                if (t.caisse) {
                    acc[t.caisse.name] = (acc[t.caisse.name] || 0) + t.amount
                }
            })
            return acc
        }, {} as Record<string, number>)

        // Calculate charges by category and by caisse
        const chargesByCategory = charges.reduce((acc: Record<string, number>, charge: any) => {
            acc[charge.category] = (acc[charge.category] || 0) + charge.amount
            return acc
        }, {} as Record<string, number>)

        const chargesByCaisse = charges.filter((c: any) => c.isPaid).reduce((acc: Record<string, number>, charge: any) => {
            charge.transactions.forEach((t: any) => {
                if (t.caisse) {
                    acc[t.caisse.name] = (acc[t.caisse.name] || 0) + t.amount
                }
            })
            return acc
        }, {} as Record<string, number>)

        // Calculate initial capital (what caisses started with)
        const initialCapital = caisses.reduce((sum: number, caisse: any) => {
            // Current balance + total spent - total revenue = initial amount
            const transactions = caisse.transactions
            const totalOut = transactions.filter((t: any) => t.type === 'ACHAT' || t.type === 'CHARGE').reduce((s: number, t: any) => s + t.amount, 0)
            const totalIn = transactions.filter((t: any) => t.type === 'REVENUE').reduce((s: number, t: any) => s + t.amount, 0)
            return sum + caisse.balance + totalOut - totalIn
        }, 0)

        // Calculate net balance: current balance - unpaid liabilities
        const netBalance = totalCaisseBalance - unpaidCharges

        // Calculate cash flow (get ALL revenue transactions, not just recent)
        const allRevenueTransactions = await prisma.transaction.findMany({
            where: { type: 'REVENUE' }
        })
        
        const totalRevenue = allRevenueTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
        
        const cashFlow = {
            inflow: totalRevenue,
            outflow: totalAchats + paidCharges,
            net: totalRevenue - (totalAchats + paidCharges)
        }

        // Get client statistics
        const clients = await prisma.client.findMany({
            where: { isActive: true },
            include: {
                orders: {
                    include: {
                        payments: true,
                        items: true
                    }
                }
            }
        })

        const totalClients = clients.length
        
        // Calculate total orders across all clients
        const totalOrders = clients.reduce((sum: number, client: any) => sum + client.orders.length, 0)
        
        // Calculate total revenue from all client orders (all payments received)
        const totalClientRevenue = clients.reduce((sum: number, client: any) => {
            return sum + client.orders.reduce((orderSum: number, order: any) => orderSum + order.paidAmount, 0)
        }, 0)
        
        // Calculate total outstanding balance (remaining amounts to be paid)
        const totalOutstandingBalance = clients.reduce((sum: number, client: any) => {
            return sum + client.orders.reduce((orderSum: number, order: any) => orderSum + order.remainingAmount, 0)
        }, 0)

        // Count clients with outstanding debt
        const clientsWithDebt = clients.filter((client: any) => {
            const totalDebt = client.orders.reduce((sum: number, order: any) => sum + order.remainingAmount, 0)
            return totalDebt > 0
        }).length

        // Calculate average order value (total amount of all orders / number of orders)
        const totalOrderValue = clients.reduce((sum: number, client: any) => {
            return sum + client.orders.reduce((orderSum: number, order: any) => orderSum + order.totalAmount, 0)
        }, 0)

        const clientStats = {
            totalClients,
            totalClientRevenue,
            totalOutstandingBalance,
            clientsWithDebt,
            averageOrderValue: totalOrders > 0 ? totalOrderValue / totalOrders : 0
        }

        return NextResponse.json({
            caisses: caisseDetails,
            totalCaisseBalance,
            initialCapital,
            totalAchats,
            totalCharges,
            paidCharges,
            unpaidCharges,
            netBalance,
            cashFlow,
            clientStats,
            recentTransactions,
            achatsByCategory,
            chargesByCategory,
            achatsByCaisse,
            chargesByCaisse
        })
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
