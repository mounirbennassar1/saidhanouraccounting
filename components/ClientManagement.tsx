'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react'
import Modal from './Modal'
import ClientForm from './ClientForm'
import OrderForm from './OrderForm'
import PaymentForm from './PaymentForm'
import ClientDetails from './ClientDetails'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    orders: Order[]
    totalOrders: number
    totalRevenue: number
    totalOutstanding: number
}

interface Order {
    id: string
    orderNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    orderDate: string
    client: { name: string }
    items: OrderItem[]
    payments: Payment[]
}

interface OrderItem {
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface Payment {
    amount: number
    paymentMethod: string
    paymentDate: string
    caisse: { name: string }
}

export default function ClientManagement() {
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showClientModal, setShowClientModal] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showClientDetails, setShowClientDetails] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/clients')
            if (response.ok) {
                const data = await response.json()
                setClients(data)
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClientSuccess = () => {
        fetchClients()
        setShowClientModal(false)
        setEditingClient(null)
    }

    const handleEdit = (client: Client) => {
        setEditingClient(client)
        setShowClientModal(true)
    }

    const handleDelete = async (clientId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return

        try {
            const response = await fetch(`/api/clients?id=${clientId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchClients()
            } else {
                const data = await response.json()
                alert(data.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            console.error('Error deleting client:', error)
            alert('Erreur de connexion au serveur')
        }
    }

    const handleOrderSuccess = () => {
        fetchClients()
        setShowOrderModal(false)
        setSelectedClient(null)
    }

    const handlePaymentSuccess = () => {
        fetchClients()
        setShowPaymentModal(false)
        setSelectedOrder(null)
        setShowClientDetails(false)
    }

    const handlePaymentFromDetails = (order: Order) => {
        setSelectedOrder(order)
        setShowClientDetails(false)
        setShowPaymentModal(true)
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
            'DRAFT': { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Brouillon', icon: Clock },
            'CONFIRMED': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Confirmé', icon: AlertCircle },
            'PARTIALLY_PAID': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Partiellement Payé', icon: Clock },
            'FULLY_PAID': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Payé', icon: CheckCircle },
            'CANCELLED': { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Annulé', icon: AlertCircle }
        }

        const config = statusConfig[status] || statusConfig['DRAFT']
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 animate-pulse">Chargement des clients...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Gestion des Clients</h2>
                    <p className="text-slate-400">Gérez vos clients, commandes et paiements</p>
                </div>
                <button
                    onClick={() => setShowClientModal(true)}
                    className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau Client
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Total Clients</p>
                            <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Revenu Total</p>
                            <h3 className="text-2xl font-bold text-emerald-400">
                                {clients.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()} DH
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Soldes Impayés</p>
                            <h3 className="text-2xl font-bold text-amber-400">
                                {clients.reduce((sum, c) => sum + c.totalOutstanding, 0).toLocaleString()} DH
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-rose-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Clients avec Dette</p>
                            <h3 className="text-2xl font-bold text-rose-400">
                                {clients.filter(c => c.totalOutstanding > 0).length}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header text-left">Client</th>
                                <th className="table-header text-left">Contact</th>
                                <th className="table-header text-center">Commandes</th>
                                <th className="table-header text-right">Revenu Total</th>
                                <th className="table-header text-right">Solde Impayé</th>
                                <th className="table-header text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id} className="table-row group">
                                    <td className="table-cell">
                                        <div>
                                            <p className="font-medium text-white">{client.name}</p>
                                            {client.address && (
                                                <p className="text-xs text-slate-500 mt-1">{client.address}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="text-sm">
                                            {client.email && <p className="text-slate-400">{client.email}</p>}
                                            {client.phone && <p className="text-slate-500 text-xs mt-1">{client.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className="badge badge-info">{client.totalOrders}</span>
                                    </td>
                                    <td className="table-cell text-right font-bold text-emerald-400">
                                        {client.totalRevenue.toLocaleString()} DH
                                    </td>
                                    <td className="table-cell text-right">
                                        {client.totalOutstanding > 0 ? (
                                            <span className="font-bold text-amber-400">
                                                {client.totalOutstanding.toLocaleString()} DH
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client)
                                                    setShowClientDetails(true)
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                title="Voir détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client)
                                                    setShowOrderModal(true)
                                                }}
                                                className="btn btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 ml-2"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Commande
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <Modal 
                isOpen={showClientModal} 
                onClose={() => {
                    setShowClientModal(false)
                    setEditingClient(null)
                }} 
                title={editingClient ? 'Modifier le Client' : 'Nouveau Client'}
            >
                <ClientForm 
                    client={editingClient} 
                    onSuccess={handleClientSuccess}
                    onClose={() => {
                        setShowClientModal(false)
                        setEditingClient(null)
                    }}
                />
            </Modal>

            <Modal
                isOpen={showOrderModal}
                onClose={() => {
                    setShowOrderModal(false)
                    setSelectedClient(null)
                }}
                title={`Nouvelle Commande - ${selectedClient?.name}`}
            >
                {selectedClient && (
                    <OrderForm clientId={selectedClient.id} onSuccess={handleOrderSuccess} />
                )}
            </Modal>

            <Modal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false)
                    setSelectedOrder(null)
                }}
                title="Enregistrer un Paiement"
            >
                {selectedOrder && (
                    <PaymentForm order={selectedOrder} onSuccess={handlePaymentSuccess} />
                )}
            </Modal>

            {/* Client Details Modal */}
            {showClientDetails && selectedClient && (
                <ClientDetails
                    client={selectedClient}
                    onClose={() => {
                        setShowClientDetails(false)
                        setSelectedClient(null)
                    }}
                    onPayment={handlePaymentFromDetails}
                />
            )}
        </div>
    )
}

