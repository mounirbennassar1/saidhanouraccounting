-- Migration: Add ChargeCategory model and update Charge category field
-- This migration:
-- 1. Creates ChargeCategory table
-- 2. Changes Charge.category from enum to string
-- 3. Migrates existing charge data

-- Create ChargeCategory table
CREATE TABLE "ChargeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargeCategory_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX "ChargeCategory_name_key" ON "ChargeCategory"("name");

-- Insert default categories
INSERT INTO "ChargeCategory" ("id", "name", "description", "color", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'Loyer de Dépôt', 'Frais de location du dépôt mensuel', '#f59e0b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Salaires Non Déclarés', 'Paiements de salaires non déclarés', '#ec4899', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Frais Bancaires', 'Frais de retrait, virement et transactions', '#8b5cf6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Primes & Avances', 'Primes, avances sur salaire et extras', '#06b6d4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Entretien & Réparations', 'Maintenance, réparations et entretien', '#10b981', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update existing Charge records to use new category names
UPDATE "Charge" SET "category" = 'Loyer de Dépôt' WHERE "category" = 'LOYER_DEPOT';
UPDATE "Charge" SET "category" = 'Salaires Non Déclarés' WHERE "category" = 'SALAIRES_NO_DECLARE';
UPDATE "Charge" SET "category" = 'Frais Bancaires' WHERE "category" = 'EXTRACT_FEES';
UPDATE "Charge" SET "category" = 'Primes & Avances' WHERE "category" = 'EXTRA_SALAIRE';
UPDATE "Charge" SET "category" = 'Entretien & Réparations' WHERE "category" = 'ENTRETIEN';

-- Drop the old enum type (this will automatically update the Charge.category column)
DROP TYPE IF EXISTS "ChargeCategory" CASCADE;






