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
        const totalAchats = achats.reduce((sum, achat) => sum + achat.amount, 0)

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
        const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0)
        const paidCharges = charges.filter(c => c.isPaid).reduce((sum, charge) => sum + charge.amount, 0)
        const unpaidCharges = charges.filter(c => !c.isPaid).reduce((sum, charge) => sum + charge.amount, 0)

        // Calculate total caisse balance
        const totalCaisseBalance = caisses.reduce((sum, caisse) => sum + caisse.balance, 0)

        // Calculate spent amounts per caisse
        const caisseDetails = caisses.map(caisse => {
            const achatTransactions = caisse.transactions.filter(t => t.type === 'ACHAT')
            const chargeTransactions = caisse.transactions.filter(t => t.type === 'CHARGE')
            const revenueTransactions = caisse.transactions.filter(t => t.type === 'REVENUE')
            
            const totalAchatsFromCaisse = achatTransactions.reduce((sum, t) => sum + t.amount, 0)
            const totalChargesFromCaisse = chargeTransactions.reduce((sum, t) => sum + t.amount, 0)
            const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0)
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
        const achatsByCategory = achats.reduce((acc, achat) => {
            acc[achat.category] = (acc[achat.category] || 0) + achat.amount
            return acc
        }, {} as Record<string, number>)

        const achatsByCaisse = achats.reduce((acc, achat) => {
            achat.transactions.forEach(t => {
                if (t.caisse) {
                    acc[t.caisse.name] = (acc[t.caisse.name] || 0) + t.amount
                }
            })
            return acc
        }, {} as Record<string, number>)

        // Calculate charges by category and by caisse
        const chargesByCategory = charges.reduce((acc, charge) => {
            acc[charge.category] = (acc[charge.category] || 0) + charge.amount
            return acc
        }, {} as Record<string, number>)

        const chargesByCaisse = charges.filter(c => c.isPaid).reduce((acc, charge) => {
            charge.transactions.forEach(t => {
                if (t.caisse) {
                    acc[t.caisse.name] = (acc[t.caisse.name] || 0) + t.amount
                }
            })
            return acc
        }, {} as Record<string, number>)

        // Calculate initial capital (what caisses started with)
        const initialCapital = caisses.reduce((sum, caisse) => {
            // Current balance + total spent - total revenue = initial amount
            const transactions = caisse.transactions
            const totalOut = transactions.filter(t => t.type === 'ACHAT' || t.type === 'CHARGE').reduce((s, t) => s + t.amount, 0)
            const totalIn = transactions.filter(t => t.type === 'REVENUE').reduce((s, t) => s + t.amount, 0)
            return sum + caisse.balance + totalOut - totalIn
        }, 0)

        // Calculate net balance: current balance - unpaid liabilities
        const netBalance = totalCaisseBalance - unpaidCharges

        // Calculate cash flow
        const totalRevenue = recentTransactions
            .filter(t => t.type === 'REVENUE')
            .reduce((sum, t) => sum + t.amount, 0)
        
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
                        payments: true
                    }
                }
            }
        })

        const totalClients = clients.length
        const totalClientRevenue = clients.reduce((sum, client) => {
            return sum + client.orders.reduce((orderSum, order) => orderSum + order.paidAmount, 0)
        }, 0)
        const totalOutstandingBalance = clients.reduce((sum, client) => {
            return sum + client.orders.reduce((orderSum, order) => orderSum + order.remainingAmount, 0)
        }, 0)

        const clientsWithDebt = clients.filter(client => {
            const totalDebt = client.orders.reduce((sum, order) => sum + order.remainingAmount, 0)
            return totalDebt > 0
        }).length

        const clientStats = {
            totalClients,
            totalClientRevenue,
            totalOutstandingBalance,
            clientsWithDebt,
            averageOrderValue: totalClients > 0 ? totalClientRevenue / totalClients : 0
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
