import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🔄 Starting database reset...')

        // Delete all data in correct order (respecting foreign keys)
        await prisma.transaction.deleteMany()
        await prisma.clientPayment.deleteMany()
        await prisma.supplierPayment.deleteMany()
        await prisma.orderItem.deleteMany()
        await prisma.supplierOrderItem.deleteMany()
        await prisma.clientOrder.deleteMany()
        await prisma.supplierOrder.deleteMany()
        await prisma.client.deleteMany()
        await prisma.supplier.deleteMany()
        await prisma.achat.deleteMany()
        await prisma.charge.deleteMany()
        await prisma.chargeCategory.deleteMany()
        await prisma.caisse.deleteMany()
        // Keep the admin user
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@saidapp.com' }
        })

        console.log('🧹 Cleaned up existing data')

        // Recreate Caisses with 0 balance
        const caisseMagasin = await prisma.caisse.create({
            data: {
                name: 'Caisse Magasin',
                type: 'MAGASIN',
                balance: 0,
                description: 'Caisse principale du magasin'
            }
        })

        const caisseEvenements = await prisma.caisse.create({
            data: {
                name: 'Caisse Événements',
                type: 'EVENEMENTS',
                balance: 0,
                description: 'Caisse dédiée aux événements'
            }
        })

        const caisseDepot = await prisma.caisse.create({
            data: {
                name: 'Caisse Dépôt',
                type: 'DEPOT',
                balance: 0,
                fixedAmount: 0,
                description: 'Caisse de dépôt'
            }
        })

        console.log('✅ Created 3 caisses with 0 balance')

        // Recreate Charge Categories
        const categoryLoyerDepot = await prisma.chargeCategory.create({
            data: {
                name: 'Loyer de Dépôt',
                description: 'Frais de location du dépôt mensuel',
                color: '#f59e0b'
            }
        })

        const categorySalaires = await prisma.chargeCategory.create({
            data: {
                name: 'Salaires Non Déclarés',
                description: 'Paiements de salaires non déclarés',
                color: '#ec4899'
            }
        })

        const categoryExtractFees = await prisma.chargeCategory.create({
            data: {
                name: 'Frais Bancaires',
                description: 'Frais de retrait, virement et transactions',
                color: '#8b5cf6'
            }
        })

        const categoryExtraSalaire = await prisma.chargeCategory.create({
            data: {
                name: 'Primes & Avances',
                description: 'Primes, avances sur salaire et extras',
                color: '#06b6d4'
            }
        })

        const categoryEntretien = await prisma.chargeCategory.create({
            data: {
                name: 'Entretien & Réparations',
                description: 'Maintenance, réparations et entretien',
                color: '#10b981'
            }
        })

        console.log('✅ Created 5 charge categories')

        return NextResponse.json({
            success: true,
            message: "Database reset successfully! All balances set to 0.",
            data: {
                caisses: 3,
                categories: 5,
                note: "Admin user preserved. All transactions, orders, and balances reset to 0."
            }
        }, { status: 200 })

    } catch (error: any) {
        console.error("Reset error:", error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// GET to check current database status
export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [
            userCount,
            caisseCount,
            achatCount,
            chargeCount,
            clientCount,
            supplierCount,
            transactionCount
        ] = await Promise.all([
            prisma.user.count(),
            prisma.caisse.count(),
            prisma.achat.count(),
            prisma.charge.count(),
            prisma.client.count(),
            prisma.supplier.count(),
            prisma.transaction.count()
        ])

        const caisses = await prisma.caisse.findMany({
            select: {
                name: true,
                balance: true
            }
        })

        return NextResponse.json({
            currentStatus: {
                users: userCount,
                caisses: caisseCount,
                achats: achatCount,
                charges: chargeCount,
                clients: clientCount,
                suppliers: supplierCount,
                transactions: transactionCount
            },
            caisseBalances: caisses,
            message: "Send POST request to this endpoint to reset database to 0"
        })
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}



