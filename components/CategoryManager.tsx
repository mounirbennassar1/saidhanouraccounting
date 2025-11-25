'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Settings, Tag } from 'lucide-react'
import Modal from './Modal'

interface ChargeCategory {
    id: string
    name: string
    description: string | null
    color: string | null
    isActive: boolean
}

interface CategoryManagerProps {
    onUpdate?: () => void
}

export default function CategoryManager({ onUpdate }: CategoryManagerProps = {}) {
    const [categories, setCategories] = useState<ChargeCategory[]>([])
    const [showModal, setShowModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingCategory, setEditingCategory] = useState<ChargeCategory | null>(null)

    useEffect(() => {
        if (showListModal) {
            fetchCategories()
        }
    }, [showListModal])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/charge-categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const url = editingCategory 
                ? '/api/charge-categories' 
                : '/api/charge-categories'
            
            const method = editingCategory ? 'PATCH' : 'POST'
            
            const body = editingCategory
                ? {
                    categoryId: editingCategory.id,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    color: formData.get('color')
                }
                : {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    color: formData.get('color')
                }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                setShowModal(false)
                setEditingCategory(null)
                fetchCategories()
                onUpdate?.()
                e.currentTarget.reset()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de l\'enregistrement')
            }
        } catch (error) {
            console.error('Error saving category:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

        try {
            const response = await fetch(`/api/charge-categories?id=${categoryId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                const data = await response.json()
                alert(data.message)
                fetchCategories()
                onUpdate?.()
            } else {
                const data = await response.json()
                alert(data.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Erreur de connexion au serveur')
        }
    }

    const handleEdit = (category: ChargeCategory) => {
        setEditingCategory(category)
        setShowModal(true)
        setError(null)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setError(null)
    }

    const colors = [
        { value: '#f59e0b', name: 'Amber' },
        { value: '#ec4899', name: 'Rose' },
        { value: '#8b5cf6', name: 'Violet' },
        { value: '#06b6d4', name: 'Cyan' },
        { value: '#10b981', name: 'Emerald' },
        { value: '#6366f1', name: 'Indigo' },
        { value: '#ef4444', name: 'Red' },
        { value: '#14b8a6', name: 'Teal' }
    ]

    return (
        <>
            <button 
                onClick={() => setShowListModal(true)} 
                className="btn btn-secondary flex items-center gap-2"
            >
                <Settings className="w-4 h-4" />
                Gérer Catégories
            </button>

            {/* Category List Modal */}
            <Modal 
                isOpen={showListModal} 
                onClose={() => setShowListModal(false)} 
                title="Gestion des Catégories de Charges"
            >
                <div className="space-y-4">
                    <button 
                        onClick={() => {
                            setShowListModal(false)
                            setShowModal(true)
                        }}
                        className="btn btn-primary w-full"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Catégorie
                    </button>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {categories.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">Aucune catégorie disponible</p>
                        ) : (
                            categories.map((category) => (
                                <div 
                                    key={category.id} 
                                    className="card p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: category.color || '#06b6d4' }}
                                        ></div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{category.name}</h4>
                                            {category.description && (
                                                <p className="text-xs text-slate-400 mt-1">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setShowListModal(false)
                                                handleEdit(category)
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Category Modal */}
            <Modal 
                isOpen={showModal} 
                onClose={handleCloseModal} 
                title={editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            Nom de la Catégorie <span className="text-rose-400">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            className="input" 
                            placeholder="Ex: Loyer, Salaires..." 
                            defaultValue={editingCategory?.name || ''}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            Description
                        </label>
                        <textarea 
                            name="description" 
                            rows={3} 
                            className="input" 
                            placeholder="Description de la catégorie..."
                            defaultValue={editingCategory?.description || ''}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            Couleur
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((color) => (
                                <label 
                                    key={color.value}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-all"
                                >
                                    <input 
                                        type="radio" 
                                        name="color" 
                                        value={color.value}
                                        defaultChecked={editingCategory?.color === color.value || (!editingCategory && color.value === '#06b6d4')}
                                        className="sr-only"
                                    />
                                    <div 
                                        className="w-6 h-6 rounded-full border-2 border-white/20" 
                                        style={{ backgroundColor: color.value }}
                                    ></div>
                                    <span className="text-xs text-slate-400">{color.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn btn-primary flex-1"
                        >
                            {loading ? 'Enregistrement...' : editingCategory ? 'Mettre à jour' : 'Créer'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCloseModal} 
                            className="btn btn-secondary"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}

