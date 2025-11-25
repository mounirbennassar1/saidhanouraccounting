'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface OrderFormProps {
    clientId: string
    onSuccess: () => void
}

interface OrderItem {
    description: string
    quantity: number
    unitPrice: number
}

export default function OrderForm({ clientId, onSuccess }: OrderFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [items, setItems] = useState<OrderItem[]>([
        { description: '', quantity: 1, unitPrice: 0 }
    ])

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        // Validate items
        const validItems = items.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0)
        
        if (validItems.length === 0) {
            setError('Veuillez ajouter au moins un article valide')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    items: validItems,
                    description: formData.get('description') || null,
                    notes: formData.get('notes') || null,
                    dueDate: formData.get('dueDate') || null
                })
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la création de la commande')
            }
        } catch (error) {
            console.error('Error creating order:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Description de la Commande
                </label>
                <input
                    type="text"
                    name="description"
                    className="input"
                    placeholder="Ex: Organisation Mariage - Formule Premium"
                />
            </div>

            {/* Order Items */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-300">
                        Articles / Services
                    </label>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn btn-secondary text-xs"
                    >
                        <Plus className="w-3 h-3" />
                        Ajouter
                    </button>
                </div>

                {items.map((item, index) => (
                    <div key={index} className="card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Article #{index + 1}</span>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-1 hover:bg-rose-500/10 text-rose-400 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="input"
                            placeholder="Description de l'article"
                            required
                        />

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Quantité</label>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="input"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Prix Unitaire (DH)</label>
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="input"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Total</label>
                                <div className="input bg-white/5 flex items-center font-bold text-white">
                                    {(item.quantity * item.unitPrice).toLocaleString()} DH
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="card p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Total de la Commande</span>
                    <span className="text-2xl font-bold text-white">
                        {calculateTotal().toLocaleString()} <span className="text-lg text-slate-400">DH</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                        Date d'Échéance
                    </label>
                    <input
                        type="date"
                        name="dueDate"
                        className="input"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={2}
                    className="input"
                    placeholder="Notes additionnelles..."
                ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                >
                    {loading ? 'Création...' : `Créer la Commande (${calculateTotal().toLocaleString()} DH)`}
                </button>
            </div>
        </form>
    )
}



