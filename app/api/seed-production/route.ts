import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    try {
        console.log('🔄 Starting clean database setup...')

        // Clean ALL existing data first
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
        
        console.log('🧹 Cleaned all data')

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: "admin@saidapp.com" }
        })

        let user = existingAdmin
        
        if (!existingAdmin) {
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 10)
            user = await prisma.user.create({
                data: {
                    email: 'admin@saidapp.com',
                    name: 'Admin Said',
                    password: hashedPassword,
                    role: 'admin'
                }
            })
            console.log('✅ Created admin user')
        } else {
            console.log('✅ Admin user already exists')
        }

        // Create default caisses with 0 balance
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

        console.log('✅ Created 3 caisses')

        // Create default charge categories
        await prisma.chargeCategory.createMany({
            data: [
                {
                    name: 'Loyer de Dépôt',
                    description: 'Frais de location du dépôt mensuel',
                    color: '#f59e0b'
                },
                {
                    name: 'Salaires Non Déclarés',
                    description: 'Paiements de salaires non déclarés',
                    color: '#ec4899'
                },
                {
                    name: 'Frais Bancaires',
                    description: 'Frais de retrait, virement et transactions',
                    color: '#8b5cf6'
                },
                {
                    name: 'Primes & Avances',
                    description: 'Primes, avances sur salaire et extras',
                    color: '#06b6d4'
                },
                {
                    name: 'Entretien & Réparations',
                    description: 'Maintenance, réparations et entretien',
                    color: '#10b981'
                }
            ]
        })

        console.log('✅ Created charge categories')

        return NextResponse.json({
            success: true,
            message: "Database reset to clean state! All balances are 0.",
            data: {
                adminUser: {
                    email: user!.email,
                    name: user!.name,
                    role: user!.role
                },
                caisses: "3 caisses created with 0 balance",
                categories: "5 charge categories created",
                allData: "All transactions, orders, clients, suppliers deleted",
                credentials: {
                    email: "admin@saidapp.com",
                    password: "admin123"
                }
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

