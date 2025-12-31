import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
    try {
        console.log('🔄 Starting Neon database reset...')
        console.log('📊 Current database status:')

        // Check current counts
        const beforeCounts = {
            transactions: await prisma.transaction.count(),
            clients: await prisma.client.count(),
            suppliers: await prisma.supplier.count(),
            achats: await prisma.achat.count(),
            charges: await prisma.charge.count(),
            caisses: await prisma.caisse.count(),
            users: await prisma.user.count(),
        }

        console.log('Before reset:', beforeCounts)

        // Delete all transactional data
        console.log('\n🧹 Deleting transactional data...')
        
        await prisma.transaction.deleteMany()
        console.log('✅ Deleted all transactions')
        
        await prisma.clientPayment.deleteMany()
        console.log('✅ Deleted all client payments')
        
        await prisma.supplierPayment.deleteMany()
        console.log('✅ Deleted all supplier payments')
        
        await prisma.orderItem.deleteMany()
        console.log('✅ Deleted all order items')
        
        await prisma.supplierOrderItem.deleteMany()
        console.log('✅ Deleted all supplier order items')
        
        await prisma.clientOrder.deleteMany()
        console.log('✅ Deleted all client orders')
        
        await prisma.supplierOrder.deleteMany()
        console.log('✅ Deleted all supplier orders')
        
        await prisma.client.deleteMany()
        console.log('✅ Deleted all clients')
        
        await prisma.supplier.deleteMany()
        console.log('✅ Deleted all suppliers')
        
        await prisma.achat.deleteMany()
        console.log('✅ Deleted all achats')
        
        await prisma.charge.deleteMany()
        console.log('✅ Deleted all charges')

        // Reset all caisse balances to 0
        console.log('\n💰 Resetting caisse balances to 0...')
        const resetResult = await prisma.caisse.updateMany({
            data: {
                balance: 0
            }
        })
        console.log(`✅ Reset ${resetResult.count} caisses to 0 DH`)

        // Get final counts
        const afterCounts = {
            transactions: await prisma.transaction.count(),
            clients: await prisma.client.count(),
            suppliers: await prisma.supplier.count(),
            achats: await prisma.achat.count(),
            charges: await prisma.charge.count(),
            caisses: await prisma.caisse.count(),
            users: await prisma.user.count(),
        }

        // Get caisse balances
        const caisses = await prisma.caisse.findMany({
            select: {
                name: true,
                balance: true
            }
        })

        console.log('\n📊 After reset:', afterCounts)
        console.log('\n💰 Caisse balances:')
        caisses.forEach(c => {
            console.log(`   ${c.name}: ${c.balance} DH`)
        })

        console.log('\n✅ Database reset complete!')
        console.log('✅ Users, caisses, and categories preserved')
        console.log('✅ All balances set to 0 DH')
        console.log('✅ All transactional data deleted')

    } catch (error) {
        console.error('❌ Error resetting database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run the reset
resetDatabase()
    .then(() => {
        console.log('\n🎉 Done!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Failed:', error)
        process.exit(1)
    })







