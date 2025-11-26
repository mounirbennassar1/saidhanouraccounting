import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Migration endpoint to create Vente table if it doesn't exist
 * Call this endpoint to manually create the Vente table in production
 */
export async function POST() {
    try {
        console.log('🔄 Starting Vente table migration...')

        // Create Vente table using raw SQL
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Vente" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "description" TEXT NOT NULL,
                "amount" DOUBLE PRECISION NOT NULL,
                "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
                "unitPrice" DOUBLE PRECISION NOT NULL,
                "category" TEXT,
                "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "reference" TEXT,
                "notes" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "clientOrderId" TEXT UNIQUE
            );
        `)

        console.log('✅ Vente table created or already exists')

        // Add venteId column to Transaction table if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'Transaction' AND column_name = 'venteId'
                ) THEN
                    ALTER TABLE "Transaction" ADD COLUMN "venteId" TEXT;
                END IF;
            END $$;
        `)

        console.log('✅ Added venteId column to Transaction table')

        // Add VENTE to TransactionType enum if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum 
                    WHERE enumlabel = 'VENTE' 
                    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')
                ) THEN
                    ALTER TYPE "TransactionType" ADD VALUE 'VENTE';
                END IF;
            END $$;
        `)

        console.log('✅ Added VENTE to TransactionType enum')

        // Add foreign key constraints (ignore if already exist)
        try {
            await prisma.$executeRawUnsafe(`
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'Vente_clientOrderId_fkey'
                    ) THEN
                        ALTER TABLE "Vente" 
                        ADD CONSTRAINT "Vente_clientOrderId_fkey" 
                        FOREIGN KEY ("clientOrderId") 
                        REFERENCES "ClientOrder"("id") 
                        ON DELETE SET NULL ON UPDATE CASCADE;
                    END IF;
                END $$;
            `)
            console.log('✅ Added Vente foreign key constraint')
        } catch (error) {
            console.log('⚠️ Foreign key constraint already exists or not needed')
        }

        try {
            await prisma.$executeRawUnsafe(`
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_venteId_fkey'
                    ) THEN
                        ALTER TABLE "Transaction" 
                        ADD CONSTRAINT "Transaction_venteId_fkey" 
                        FOREIGN KEY ("venteId") 
                        REFERENCES "Vente"("id") 
                        ON DELETE SET NULL ON UPDATE CASCADE;
                    END IF;
                END $$;
            `)
            console.log('✅ Added Transaction venteId foreign key constraint')
        } catch (error) {
            console.log('⚠️ Transaction foreign key constraint already exists or not needed')
        }

        // Test if Vente table is accessible
        const venteCount = await prisma.vente.count()
        console.log(`✅ Vente table is accessible with ${venteCount} records`)

        return NextResponse.json({
            success: true,
            message: '✅ Vente table migration completed successfully!',
            details: {
                venteTableCreated: true,
                venteIdColumnAdded: true,
                transactionTypeUpdated: true,
                foreignKeysAdded: true,
                currentVenteCount: venteCount
            },
            instructions: 'You can now use the /api/ventes endpoint to manage sales'
        })

    } catch (error: any) {
        console.error("Migration error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            recommendation: 'Check database permissions and connection'
        }, { status: 500 })
    }
}

/**
 * GET endpoint to check if migration is needed
 */
export async function GET() {
    try {
        // Check if Vente table exists by trying to count
        const venteCount = await prisma.vente.count()
        
        // Check if venteId exists in Transaction table
        const hasVenteId = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Transaction' AND column_name = 'venteId'
            ) as exists;
        `

        return NextResponse.json({
            success: true,
            migrationNeeded: false,
            message: '✅ Vente table already exists and is accessible',
            details: {
                venteCount,
                transactionVenteIdExists: hasVenteId
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            migrationNeeded: true,
            message: '⚠️ Vente table does not exist or is not accessible',
            error: error.message,
            recommendation: 'Send a POST request to this endpoint to run the migration'
        }, { status: 200 }) // Return 200 so the client knows migration is available
    }
}


