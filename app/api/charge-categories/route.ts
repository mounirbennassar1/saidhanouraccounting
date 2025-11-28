import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const categories = await prisma.chargeCategory.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error("Error fetching charge categories:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, color } = body

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Le nom de la catégorie est requis" },
                { status: 400 }
            )
        }

        // Check if category already exists
        const existingCategory = await prisma.chargeCategory.findUnique({
            where: { name }
        })

        if (existingCategory) {
            return NextResponse.json(
                { error: "Une catégorie avec ce nom existe déjà" },
                { status: 400 }
            )
        }

        const category = await prisma.chargeCategory.create({
            data: {
                name,
                description,
                color: color || '#06b6d4' // Default cyan color
            }
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error("Error creating charge category:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { categoryId, name, description, color, isActive } = body

        if (!categoryId) {
            return NextResponse.json(
                { error: "L'ID de la catégorie est requis" },
                { status: 400 }
            )
        }

        // Check if category exists
        const existingCategory = await prisma.chargeCategory.findUnique({
            where: { id: categoryId }
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Catégorie non trouvée" },
                { status: 404 }
            )
        }

        // If changing name, check if new name is already taken
        if (name && name !== existingCategory.name) {
            const nameExists = await prisma.chargeCategory.findUnique({
                where: { name }
            })

            if (nameExists) {
                return NextResponse.json(
                    { error: "Une catégorie avec ce nom existe déjà" },
                    { status: 400 }
                )
            }
        }

        const updatedCategory = await prisma.chargeCategory.update({
            where: { id: categoryId },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(color && { color }),
                ...(isActive !== undefined && { isActive })
            }
        })

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error("Error updating charge category:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('id')

        if (!categoryId) {
            return NextResponse.json(
                { error: "L'ID de la catégorie est requis" },
                { status: 400 }
            )
        }

        // Check if any charges are using this category
        const chargesCount = await prisma.charge.count({
            where: { category: categoryId }
        })

        if (chargesCount > 0) {
            // Soft delete by marking as inactive
            await prisma.chargeCategory.update({
                where: { id: categoryId },
                data: { isActive: false }
            })

            return NextResponse.json({ 
                message: "Catégorie désactivée car elle est utilisée par des charges existantes",
                soft_delete: true
            })
        }

        // Hard delete if not used
        await prisma.chargeCategory.delete({
            where: { id: categoryId }
        })

        return NextResponse.json({ 
            message: "Catégorie supprimée avec succès",
            soft_delete: false
        })
    } catch (error) {
        console.error("Error deleting charge category:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}







