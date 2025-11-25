'use client'

import { useState } from 'react'

interface ClientFormProps {
    onSuccess: () => void
}

export default function ClientForm({ onSuccess }: ClientFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email') || null,
                    phone: formData.get('phone') || null,
                    address: formData.get('address') || null,
                    notes: formData.get('notes') || null
                })
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la création du client')
            }
        } catch (error) {
            console.error('Error creating client:', error)
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
                    Nom du Client <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    className="input"
                    placeholder="Ex: Mohammed Alami"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="input"
                        placeholder="email@exemple.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                        Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        className="input"
                        placeholder="+212 6 12 34 56 78"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Adresse
                </label>
                <input
                    type="text"
                    name="address"
                    className="input"
                    placeholder="Ville, Pays"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    className="input"
                    placeholder="Notes sur le client..."
                ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                >
                    {loading ? 'Création...' : 'Créer le Client'}
                </button>
            </div>
        </form>
    )
}



