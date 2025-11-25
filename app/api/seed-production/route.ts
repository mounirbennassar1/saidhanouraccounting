import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: "admin@saidapp.com" }
        })

        if (existingAdmin) {
            return NextResponse.json({
                success: false,
                message: "Admin user already exists",
                user: {
                    email: existingAdmin.email,
                    name: existingAdmin.name
                }
            }, { status: 200 })
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10)

        const user = await prisma.user.create({
            data: {
                email: 'admin@saidapp.com',
                name: 'Admin Said',
                password: hashedPassword,
                role: 'admin'
            }
        })

        console.log('✅ Created admin user:', user.email)

        // Create default caisses
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
                balance: 5000,
                fixedAmount: 5000,
                description: 'Caisse de dépôt avec montant fixe'
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
            message: "Production database seeded successfully!",
            data: {
                adminUser: {
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                caisses: 3,
                categories: 5,
                credentials: {
                    email: "admin@saidapp.com",
                    password: "admin123"
                }
            }
        }, { status: 201 })

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

