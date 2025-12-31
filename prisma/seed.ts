import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Clean up existing data (in correct order due to relations)
    await prisma.supplierPayment.deleteMany()
    await prisma.supplierOrder.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.vente.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.clientPayment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.clientOrder.deleteMany()
    await prisma.client.deleteMany()
    await prisma.achat.deleteMany()
    await prisma.charge.deleteMany()
    await prisma.chargeCategory.deleteMany()
    await prisma.caisse.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleaned up existing data')

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

    // Create Caisses
    const caisseMagasin = await prisma.caisse.create({
        data: {
            name: 'Caisse Magasin',
            type: 'MAGASIN',
            balance: 45000,
            description: 'Caisse principale du magasin'
        }
    })

    const caisseEvenements = await prisma.caisse.create({
        data: {
            name: 'Caisse Événements',
            type: 'EVENEMENTS',
            balance: 120000,
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

    // Create Charge Categories
    const categoryLoyerDepot = await prisma.chargeCategory.create({
        data: {
            name: 'Loyer de Dépôt',
            description: 'Frais de location du dépôt mensuel',
            color: '#f59e0b' // amber
        }
    })

    const categorySalaires = await prisma.chargeCategory.create({
        data: {
            name: 'Salaires Non Déclarés',
            description: 'Paiements de salaires non déclarés',
            color: '#ec4899' // pink
        }
    })

    const categoryExtractFees = await prisma.chargeCategory.create({
        data: {
            name: 'Frais Bancaires',
            description: 'Frais de retrait, virement et transactions',
            color: '#8b5cf6' // violet
        }
    })

    const categoryExtraSalaire = await prisma.chargeCategory.create({
        data: {
            name: 'Primes & Avances',
            description: 'Primes, avances sur salaire et extras',
            color: '#06b6d4' // cyan
        }
    })

    const categoryEntretien = await prisma.chargeCategory.create({
        data: {
            name: 'Entretien & Réparations',
            description: 'Maintenance, réparations et entretien',
            color: '#10b981' // emerald
        }
    })

    console.log('✅ Created 5 charge categories')

    // Helper to get a date in the past
    const getDate = (daysAgo: number) => {
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        return date
    }

    // Create extensive Achats
    const achatsData = [
        { desc: 'Stock Alimentaire', amount: 12000, cat: 'MAGASIN', daysAgo: 2 },
        { desc: 'Boissons & Jus', amount: 4500, cat: 'MAGASIN', daysAgo: 5 },
        { desc: 'Emballages', amount: 1200, cat: 'MAGASIN', daysAgo: 8 },
        { desc: 'Produits Entretien', amount: 800, cat: 'MAGASIN', daysAgo: 12 },
        { desc: 'Décoration Vitrine', amount: 3000, cat: 'MAGASIN', daysAgo: 15 },

        { desc: 'Sonorisation Event A', amount: 15000, cat: 'EVENEMENT', daysAgo: 3 },
        { desc: 'Traiteur Mariage', amount: 25000, cat: 'EVENEMENT', daysAgo: 10 },
        { desc: 'Location Salle', amount: 8000, cat: 'EVENEMENT', daysAgo: 20 },
        { desc: 'Fleurs & Déco', amount: 4500, cat: 'EVENEMENT', daysAgo: 25 },
        { desc: 'Photographe', amount: 3500, cat: 'EVENEMENT', daysAgo: 28 },

        { desc: 'Pc Portable Compta', amount: 8000, cat: 'SOCIETE', daysAgo: 1 },
        { desc: 'Fournitures Bureau', amount: 1500, cat: 'SOCIETE', daysAgo: 15 },
        { desc: 'Abonnement Logiciel', amount: 500, cat: 'SOCIETE', daysAgo: 30 },
        { desc: 'Mobilier Bureau', amount: 4500, cat: 'SOCIETE', daysAgo: 45 },
    ]

    for (const achat of achatsData) {
        await prisma.achat.create({
            data: {
                description: achat.desc,
                amount: achat.amount,
                category: achat.cat as any,
                date: getDate(achat.daysAgo),
                reference: `ACH-${Math.floor(Math.random() * 10000)}`
            }
        })

        // Create corresponding transaction
        await prisma.transaction.create({
            data: {
                type: 'ACHAT',
                amount: achat.amount,
                description: `Achat: ${achat.desc}`,
                date: getDate(achat.daysAgo),
                caisseId: achat.cat === 'MAGASIN' ? caisseMagasin.id :
                    achat.cat === 'EVENEMENT' ? caisseEvenements.id : caisseMagasin.id,
                userId: user.id
            }
        })
    }

    console.log(`✅ Created ${achatsData.length} achats`)

    // Create extensive Charges
    const chargesData = [
        { desc: 'Loyer Dépôt Janvier', amount: 5000, cat: categoryLoyerDepot.name, paid: true, daysAgo: 30 },
        { desc: 'Loyer Dépôt Février', amount: 5000, cat: categoryLoyerDepot.name, paid: true, daysAgo: 1 },

        { desc: 'Salaires Extra S1', amount: 8000, cat: categorySalaires.name, paid: true, daysAgo: 15 },
        { desc: 'Salaires Extra S2', amount: 8500, cat: categorySalaires.name, paid: false, daysAgo: 2 },

        { desc: 'Frais Retrait Espèces', amount: 250, cat: categoryExtractFees.name, paid: true, daysAgo: 5 },
        { desc: 'Frais Virement', amount: 150, cat: categoryExtractFees.name, paid: true, daysAgo: 12 },

        { desc: 'Prime Objectif Ahmed', amount: 2000, cat: categoryExtraSalaire.name, paid: true, daysAgo: 20 },
        { desc: 'Avance Salaire Sarah', amount: 1500, cat: categoryExtraSalaire.name, paid: false, daysAgo: 5 },

        { desc: 'Réparation Climatisation', amount: 1200, cat: categoryEntretien.name, paid: true, daysAgo: 10 },
        { desc: 'Plomberie Urgence', amount: 800, cat: categoryEntretien.name, paid: true, daysAgo: 25 },
        { desc: 'Peinture Façade', amount: 3500, cat: categoryEntretien.name, paid: false, daysAgo: 8 },
    ]

    for (const charge of chargesData) {
        await prisma.charge.create({
            data: {
                description: charge.desc,
                amount: charge.amount,
                category: charge.cat,
                isPaid: charge.paid,
                date: getDate(charge.daysAgo),
                reference: `CHG-${Math.floor(Math.random() * 10000)}`
            }
        })

        if (charge.paid) {
            await prisma.transaction.create({
                data: {
                    type: 'CHARGE',
                    amount: charge.amount,
                    description: `Charge: ${charge.desc}`,
                    date: getDate(charge.daysAgo),
                    caisseId: caisseMagasin.id, // Defaulting to Magasin for charges
                    userId: user.id
                }
            })
        }
    }

    console.log(`✅ Created ${chargesData.length} charges`)

    // Add some revenue transactions
    const revenues = [
        { desc: 'Ventes Semaine 1', amount: 25000, caisseId: caisseMagasin.id, daysAgo: 28 },
        { desc: 'Ventes Semaine 2', amount: 28000, caisseId: caisseMagasin.id, daysAgo: 21 },
        { desc: 'Ventes Semaine 3', amount: 22000, caisseId: caisseMagasin.id, daysAgo: 14 },
        { desc: 'Ventes Semaine 4', amount: 30000, caisseId: caisseMagasin.id, daysAgo: 7 },

        { desc: 'Acompte Mariage X', amount: 15000, caisseId: caisseEvenements.id, daysAgo: 25 },
        { desc: 'Solde Event Y', amount: 45000, caisseId: caisseEvenements.id, daysAgo: 10 },
        { desc: 'Réservation Salle Z', amount: 5000, caisseId: caisseEvenements.id, daysAgo: 2 },
    ]

    for (const rev of revenues) {
        await prisma.transaction.create({
            data: {
                type: 'REVENUE',
                amount: rev.amount,
                description: rev.desc,
                date: getDate(rev.daysAgo),
                caisseId: rev.caisseId,
                userId: user.id
            }
        })
    }

    console.log(`✅ Created ${revenues.length} revenue transactions`)

    // Create Clients
    const client1 = await prisma.client.create({
        data: {
            name: 'Mohammed Alami',
            email: 'malami@email.com',
            phone: '+212 6 12 34 56 78',
            address: 'Casablanca, Maroc',
            notes: 'Client VIP - Événements réguliers'
        }
    })

    const client2 = await prisma.client.create({
        data: {
            name: 'Fatima Zahra',
            email: 'fzahra@email.com',
            phone: '+212 6 23 45 67 89',
            address: 'Rabat, Maroc'
        }
    })

    const client3 = await prisma.client.create({
        data: {
            name: 'Société ABC SARL',
            email: 'contact@abc.ma',
            phone: '+212 5 22 34 56 78',
            address: 'Tanger, Maroc',
            notes: 'Entreprise - Commandes mensuelles'
        }
    })

    console.log('✅ Created 3 clients')

    // Create Orders with Items
    const order1 = await prisma.clientOrder.create({
        data: {
            orderNumber: 'ORD-00001',
            clientId: client1.id,
            totalAmount: 50000,
            paidAmount: 20000,
            remainingAmount: 30000,
            status: 'PARTIALLY_PAID',
            description: 'Organisation Mariage - Formule Premium',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            items: {
                create: [
                    { description: 'Décoration complète', quantity: 1, unitPrice: 15000, totalPrice: 15000 },
                    { description: 'Traiteur - 200 personnes', quantity: 1, unitPrice: 25000, totalPrice: 25000 },
                    { description: 'Photographe & Vidéaste', quantity: 1, unitPrice: 8000, totalPrice: 8000 },
                    { description: 'Sonorisation', quantity: 1, unitPrice: 2000, totalPrice: 2000 }
                ]
            }
        }
    })

    // Add payment for order1
    await prisma.clientPayment.create({
        data: {
            orderId: order1.id,
            amount: 20000,
            caisseId: caisseEvenements.id,
            paymentMethod: 'BANK_TRANSFER',
            reference: 'PAY-001',
            notes: 'Acompte 40%'
        }
    })

    // Update caisse for order1 payment
    await prisma.caisse.update({
        where: { id: caisseEvenements.id },
        data: { balance: { increment: 20000 } }
    })

    const order2 = await prisma.clientOrder.create({
        data: {
            orderNumber: 'ORD-00002',
            clientId: client2.id,
            totalAmount: 12000,
            paidAmount: 12000,
            remainingAmount: 0,
            status: 'FULLY_PAID',
            description: 'Réception Familiale',
            orderDate: getDate(5),
            items: {
                create: [
                    { description: 'Traiteur - 50 personnes', quantity: 1, unitPrice: 8000, totalPrice: 8000 },
                    { description: 'Décoration simple', quantity: 1, unitPrice: 4000, totalPrice: 4000 }
                ]
            }
        }
    })

    // Add full payment for order2
    await prisma.clientPayment.create({
        data: {
            orderId: order2.id,
            amount: 12000,
            caisseId: caisseEvenements.id,
            paymentMethod: 'CASH',
            paymentDate: getDate(5),
            reference: 'PAY-002',
            notes: 'Paiement complet'
        }
    })

    await prisma.caisse.update({
        where: { id: caisseEvenements.id },
        data: { balance: { increment: 12000 } }
    })

    const order3 = await prisma.clientOrder.create({
        data: {
            orderNumber: 'ORD-00003',
            clientId: client3.id,
            totalAmount: 8500,
            paidAmount: 3500,
            remainingAmount: 5000,
            status: 'PARTIALLY_PAID',
            description: 'Fournitures Bureau - Commande Mensuelle',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            items: {
                create: [
                    { description: 'Papier A4 - 50 Rames', quantity: 50, unitPrice: 30, totalPrice: 1500 },
                    { description: 'Cartouches d\'encre', quantity: 20, unitPrice: 150, totalPrice: 3000 },
                    { description: 'Fournitures diverses', quantity: 1, unitPrice: 4000, totalPrice: 4000 }
                ]
            }
        }
    })

    await prisma.clientPayment.create({
        data: {
            orderId: order3.id,
            amount: 3500,
            caisseId: caisseMagasin.id,
            paymentMethod: 'CHECK',
            reference: 'PAY-003',
            notes: 'Acompte initial'
        }
    })

    await prisma.caisse.update({
        where: { id: caisseMagasin.id },
        data: { balance: { increment: 3500 } }
    })

    const order4 = await prisma.clientOrder.create({
        data: {
            orderNumber: 'ORD-00004',
            clientId: client1.id,
            totalAmount: 25000,
            paidAmount: 0,
            remainingAmount: 25000,
            status: 'CONFIRMED',
            description: 'Événement d\'Entreprise - Devis accepté',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            items: {
                create: [
                    { description: 'Location Salle Premium', quantity: 1, unitPrice: 15000, totalPrice: 15000 },
                    { description: 'Cocktail - 100 personnes', quantity: 1, unitPrice: 10000, totalPrice: 10000 }
                ]
            }
        }
    })

    console.log('✅ Created 4 orders with items and payments')

    // ============================================
    // SUPPLIERS (FOURNISSEURS) MANAGEMENT
    // ============================================

    // Create Suppliers
    const supplier1 = await prisma.supplier.create({
        data: {
            name: 'Distributeur Atlas',
            email: 'contact@atlas.ma',
            phone: '+212 5 22 12 34 56',
            address: 'Zone Industrielle, Casablanca',
            notes: 'Fournisseur principal - matériaux'
        }
    })

    const supplier2 = await prisma.supplier.create({
        data: {
            name: 'Électronique Pro',
            email: 'info@electronique-pro.ma',
            phone: '+212 5 22 98 76 54',
            address: 'Centre Commercial, Rabat'
        }
    })

    const supplier3 = await prisma.supplier.create({
        data: {
            name: 'Import Export Maghreb',
            email: 'commercial@ie-maghreb.ma',
            phone: '+212 5 39 11 22 33',
            address: 'Port de Tanger, Tanger',
            notes: 'Importation de produits électroniques'
        }
    })

    console.log('✅ Created 3 suppliers')

    // Create Supplier Orders
    const supplierOrder1 = await prisma.supplierOrder.create({
        data: {
            orderNumber: 'FSUP-00001',
            supplierId: supplier1.id,
            totalAmount: 35000,
            paidAmount: 15000,
            remainingAmount: 20000,
            status: 'PARTIALLY_PAID',
            description: 'Achat matériaux construction',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            items: {
                create: [
                    { description: 'Ciment - 100 sacs', quantity: 100, unitPrice: 80, totalPrice: 8000 },
                    { description: 'Briques - 5000 unités', quantity: 5000, unitPrice: 4, totalPrice: 20000 },
                    { description: 'Fer à béton - 2 tonnes', quantity: 2, unitPrice: 3500, totalPrice: 7000 }
                ]
            }
        }
    })

    // Add partial payment for supplier order 1
    await prisma.supplierPayment.create({
        data: {
            orderId: supplierOrder1.id,
            amount: 15000,
            caisseId: caisseMagasin.id,
            paymentMethod: 'BANK_TRANSFER',
            reference: 'FPAY-001',
            notes: 'Acompte 43%'
        }
    })

    // DEDUCT from caisse (this is payment to supplier)
    await prisma.caisse.update({
        where: { id: caisseMagasin.id },
        data: { balance: { decrement: 15000 } }
    })

    const supplierOrder2 = await prisma.supplierOrder.create({
        data: {
            orderNumber: 'FSUP-00002',
            supplierId: supplier2.id,
            totalAmount: 18500,
            paidAmount: 18500,
            remainingAmount: 0,
            status: 'FULLY_PAID',
            description: 'Équipements électroniques',
            orderDate: getDate(7),
            items: {
                create: [
                    { description: 'Ordinateurs portables - 5 unités', quantity: 5, unitPrice: 3000, totalPrice: 15000 },
                    { description: 'Imprimantes multifonctions', quantity: 2, unitPrice: 1500, totalPrice: 3000 },
                    { description: 'Accessoires divers', quantity: 1, unitPrice: 500, totalPrice: 500 }
                ]
            }
        }
    })

    // Full payment for supplier order 2
    await prisma.supplierPayment.create({
        data: {
            orderId: supplierOrder2.id,
            amount: 18500,
            caisseId: caisseMagasin.id,
            paymentMethod: 'BANK_TRANSFER',
            paymentDate: getDate(7),
            reference: 'FPAY-002',
            notes: 'Paiement complet'
        }
    })

    await prisma.caisse.update({
        where: { id: caisseMagasin.id },
        data: { balance: { decrement: 18500 } }
    })

    const supplierOrder3 = await prisma.supplierOrder.create({
        data: {
            orderNumber: 'FSUP-00003',
            supplierId: supplier3.id,
            totalAmount: 42000,
            paidAmount: 10000,
            remainingAmount: 32000,
            status: 'PARTIALLY_PAID',
            description: 'Conteneur marchandises import',
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
            items: {
                create: [
                    { description: 'Téléviseurs - 30 unités', quantity: 30, unitPrice: 800, totalPrice: 24000 },
                    { description: 'Smartphones - 50 unités', quantity: 50, unitPrice: 250, totalPrice: 12500 },
                    { description: 'Tablettes - 20 unités', quantity: 20, unitPrice: 275, totalPrice: 5500 }
                ]
            }
        }
    })

    await prisma.supplierPayment.create({
        data: {
            orderId: supplierOrder3.id,
            amount: 10000,
            caisseId: caisseEvenements.id,
            paymentMethod: 'BANK_TRANSFER',
            reference: 'FPAY-003',
            notes: 'Premier acompte - Dédouanement'
        }
    })

    await prisma.caisse.update({
        where: { id: caisseEvenements.id },
        data: { balance: { decrement: 10000 } }
    })

    const supplierOrder4 = await prisma.supplierOrder.create({
        data: {
            orderNumber: 'FSUP-00004',
            supplierId: supplier1.id,
            totalAmount: 28000,
            paidAmount: 0,
            remainingAmount: 28000,
            status: 'CONFIRMED',
            description: 'Matériel outillage',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            items: {
                create: [
                    { description: 'Perceuses électriques - 10 unités', quantity: 10, unitPrice: 1200, totalPrice: 12000 },
                    { description: 'Meuleuses - 15 unités', quantity: 15, unitPrice: 800, totalPrice: 12000 },
                    { description: 'Outillage divers', quantity: 1, unitPrice: 4000, totalPrice: 4000 }
                ]
            }
        }
    })

    console.log('✅ Created 4 supplier orders with items and payments')

    console.log('🎉 Database seeding completed!')
    console.log('\n📝 Login credentials:')
    console.log('Email: admin@saidapp.com')
    console.log('Password: admin123')
    console.log('\n👥 Sample clients with orders created:')
    console.log('- Mohammed Alami: 2 commandes (1 partiellement payée, 1 confirmée)')
    console.log('- Fatima Zahra: 1 commande (entièrement payée)')
    console.log('- Société ABC SARL: 1 commande (partiellement payée)')
    console.log('\n🏢 Sample suppliers with orders created:')
    console.log('- Distributeur Atlas: 2 commandes (1 partiellement payée, 1 confirmée)')
    console.log('- Électronique Pro: 1 commande (entièrement payée)')
    console.log('- Import Export Maghreb: 1 commande (partiellement payée)')
    console.log('\n💰 Note: Supplier payments DEDUCT from caisse balances')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
