'use client'

import { useState } from 'react'

interface Client {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
}

interface ClientFormProps {
    client?: Client
    onSuccess: () => void
    onClose?: () => void
}

export default function ClientForm({ client, onSuccess, onClose }: ClientFormProps) {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        notes: client?.notes || ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const url = '/api/clients'
            const method = client ? 'PATCH' : 'POST'
            const body = client 
                ? { clientId: client.id, ...formData }
                : formData

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || `Erreur lors de ${client ? 'la modification' : 'la création'} du client`)
            }
        } catch (error) {
            console.error('Error saving client:', error)
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    placeholder="Ville, Pays"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Notes
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="input"
                    placeholder="Notes sur le client..."
                />
            </div>

            <div className="flex gap-3 pt-4">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                >
                    {loading ? (client ? 'Modification...' : 'Création...') : (client ? 'Modifier le Client' : 'Créer le Client')}
                </button>
            </div>
        </form>
    )
}



