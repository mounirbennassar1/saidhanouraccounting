import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    try {
        console.log('🔄 Starting database cleanup - keeping users...')

        // Check if Vente table exists (debugging)
        try {
            const venteCount = await prisma.vente.count()
            console.log('✅ Vente table exists with', venteCount, 'records')
        } catch (error) {
            console.error('⚠️ Vente table might not exist yet:', error)
        }

        // Delete ONLY transactional data, keep users
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
        
        // Try to delete ventes
        try {
            await prisma.vente.deleteMany()
            console.log('✅ Deleted ventes')
        } catch (error) {
            console.error('⚠️ Could not delete ventes (table might not exist):', error)
        }
        
        console.log('🧹 Deleted all transactional data')

        // Reset ALL caisse balances to 0
        await prisma.caisse.updateMany({
            data: {
                balance: 0
            }
        })
        
        console.log('✅ Reset all caisse balances to 0')

        // Get admin user (should exist)
        const user = await prisma.user.findUnique({
            where: { email: "admin@saidapp.com" }
        })

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Admin user not found! Please run initial seed first."
            }, { status: 404 })
        }

        // Count what's left
        const caisseCount = await prisma.caisse.count()
        const categoryCount = await prisma.chargeCategory.count()
        const transactionCount = await prisma.transaction.count()
        const clientCount = await prisma.client.count()
        const supplierCount = await prisma.supplier.count()

        console.log(`✅ Caisses: ${caisseCount} (all with 0 balance)`)
        console.log(`✅ Categories: ${categoryCount}`)
        console.log(`✅ Transactions: ${transactionCount}`)
        console.log(`✅ Clients: ${clientCount}`)
        console.log(`✅ Suppliers: ${supplierCount}`)

        return NextResponse.json({
            success: true,
            message: "✅ Database reset complete! All balances set to 0, all transactional data deleted.",
            data: {
                adminUser: {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: "KEPT"
                },
                summary: {
                    caisses: `${caisseCount} caisses - all balances reset to 0 DH`,
                    categories: `${categoryCount} charge categories - kept`,
                    transactions: `${transactionCount} transactions - all deleted`,
                    clients: `${clientCount} clients - all deleted`,
                    suppliers: `${supplierCount} suppliers - all deleted`
                },
                note: "Admin user and structure preserved. All data cleared."
            }
        }, { status: 200 })

    } catch (error: any) {
        console.error("Seeding error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}

// Allow GET to check if seeding is needed
export async function GET() {
    try {
        const userCount = await prisma.user.count()
        const caisseCount = await prisma.caisse.count()
        const categoryCount = await prisma.chargeCategory.count()

        const adminExists = await prisma.user.findUnique({
            where: { email: "admin@saidapp.com" }
        })

        return NextResponse.json({
            database: {
                users: userCount,
                caisses: caisseCount,
                categories: categoryCount,
                adminExists: !!adminExists
            },
            needsSeeding: !adminExists,
            message: adminExists 
                ? "Database is already seeded" 
                : "Database needs seeding - send POST request to this endpoint"
        })
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}

