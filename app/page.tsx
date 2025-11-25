'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import Forms from '@/components/Forms'
import { CaissesTable, AchatsTable, ChargesTable } from '@/components/Tables'
import ClientManagement from '@/components/ClientManagement'
import SupplierManagement from '@/components/SupplierManagement'
import VentesManagement from '@/components/VentesManagement'
import Reports from '@/components/Reports'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setActiveTab('dashboard')
  }

  return (
    <div className="min-h-screen">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            <Forms onSuccess={handleSuccess} />
            <Dashboard key={refreshKey} />
          </>
        )}

        {activeTab === 'caisses' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold gradient-text mb-2">Gestion des Caisses</h2>
              <p className="text-muted">Vue d'ensemble de toutes les caisses</p>
            </div>
            <Forms onSuccess={handleSuccess} hideButtons={['achat', 'charge']} />
            <CaissesTable key={refreshKey} />
          </div>
        )}

        {activeTab === 'achats' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold gradient-text mb-2">Gestion des Achats</h2>
              <p className="text-muted">Historique de tous les achats</p>
            </div>
            <Forms onSuccess={handleSuccess} hideButtons={['caisse', 'revenue']} />
            <AchatsTable key={refreshKey} />
          </div>
        )}

        {activeTab === 'charges' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold gradient-text mb-2">Gestion des Charges</h2>
              <p className="text-muted">Suivi de toutes les charges et dépenses</p>
            </div>
            <Forms onSuccess={handleSuccess} hideButtons={['caisse', 'revenue']} />
            <ChargesTable key={refreshKey} />
          </div>
        )}

        {activeTab === 'ventes' && (
          <div className="animate-fade-in">
            <VentesManagement key={refreshKey} />
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animate-fade-in">
            <ClientManagement key={refreshKey} />
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="animate-fade-in">
            <SupplierManagement key={refreshKey} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-fade-in">
            <Reports key={refreshKey} />
          </div>
        )}
      </main>
    </div>
  )
}
