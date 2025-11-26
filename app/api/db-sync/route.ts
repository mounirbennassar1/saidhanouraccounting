import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Database Sync Endpoint
 * This endpoint helps ensure all tables exist in the production database
 * Call this after schema changes to verify Prisma models are synced
 */
export async function GET() {
    try {
        console.log('🔍 Checking database schema...')

        const checks = {
            users: false,
            caisses: false,
            achats: false,
            charges: false,
            ventes: false,
            transactions: false,
            clients: false,
            suppliers: false,
            chargeCategories: false
        }

        const counts: any = {}

        // Check each table
        try {
            counts.users = await prisma.user.count()
            checks.users = true
        } catch (error) {
            console.error('❌ User table issue:', error)
        }

        try {
            counts.caisses = await prisma.caisse.count()
            checks.caisses = true
        } catch (error) {
            console.error('❌ Caisse table issue:', error)
        }

        try {
            counts.achats = await prisma.achat.count()
            checks.achats = true
        } catch (error) {
            console.error('❌ Achat table issue:', error)
        }

        try {
            counts.charges = await prisma.charge.count()
            checks.charges = true
        } catch (error) {
            console.error('❌ Charge table issue:', error)
        }

        try {
            counts.ventes = await prisma.vente.count()
            checks.ventes = true
        } catch (error) {
            console.error('❌ Vente table issue:', error)
        }

        try {
            counts.transactions = await prisma.transaction.count()
            checks.transactions = true
        } catch (error) {
            console.error('❌ Transaction table issue:', error)
        }

        try {
            counts.clients = await prisma.client.count()
            checks.clients = true
        } catch (error) {
            console.error('❌ Client table issue:', error)
        }

        try {
            counts.suppliers = await prisma.supplier.count()
            checks.suppliers = true
        } catch (error) {
            console.error('❌ Supplier table issue:', error)
        }

        try {
            counts.chargeCategories = await prisma.chargeCategory.count()
            checks.chargeCategories = true
        } catch (error) {
            console.error('❌ ChargeCategory table issue:', error)
        }

        const allTablesExist = Object.values(checks).every(v => v === true)

        return NextResponse.json({
            success: allTablesExist,
            message: allTablesExist 
                ? '✅ All database tables exist and are accessible' 
                : '⚠️ Some tables are missing - run `npx prisma db push` in production',
            checks,
            counts,
            prismaVersion: '6.19.0',
            recommendation: allTablesExist 
                ? 'Database is properly synced' 
                : 'Redeploy the application or run migrations manually'
        })
    } catch (error: any) {
        console.error("Database sync check error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            message: 'Failed to check database schema',
            recommendation: 'Check database connection and Prisma schema'
        }, { status: 500 })
    }
}

/**
 * POST endpoint to attempt auto-fixing schema issues
 * This doesn't run migrations but ensures basic structure exists
 */
export async function POST() {
    try {
        console.log('🔧 Attempting to verify database structure...')

        // Just attempt to count - this will trigger Prisma to validate schema
        await prisma.vente.count()
        await prisma.transaction.count()
        await prisma.user.count()

        return NextResponse.json({
            success: true,
            message: '✅ Database structure verified successfully',
            note: 'All critical tables are accessible'
        })
    } catch (error: any) {
        console.error("Database structure verification error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            message: '❌ Database structure verification failed',
            recommendation: 'Run database migration: `npx prisma db push`',
            details: error.message
        }, { status: 500 })
    }
}

