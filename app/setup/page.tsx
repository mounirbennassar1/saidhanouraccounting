'use client'

import { useState } from 'react'

export default function SetupPage() {
    const [status, setStatus] = useState<'idle' | 'checking' | 'migrating' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [details, setDetails] = useState<any>(null)

    const checkDatabase = async () => {
        setStatus('checking')
        setMessage('🔍 Checking database status...')
        
        try {
            const response = await fetch('/api/migrate-ventes', {
                method: 'GET'
            })
            const data = await response.json()
            
            if (data.migrationNeeded) {
                setMessage('⚠️ Migration required! Click "Run Migration" to fix.')
                setDetails(data)
                setStatus('idle')
            } else {
                setMessage('✅ Database is already set up correctly!')
                setDetails(data)
                setStatus('success')
            }
        } catch (error: any) {
            setMessage(`❌ Error checking database: ${error.message}`)
            setStatus('error')
        }
    }

    const runMigration = async () => {
        setStatus('migrating')
        setMessage('🔧 Running migration... This may take a few seconds.')
        
        try {
            const response = await fetch('/api/migrate-ventes', {
                method: 'POST'
            })
            const data = await response.json()
            
            if (data.success) {
                setMessage('✅ Migration completed successfully! Ventes is now ready to use.')
                setDetails(data)
                setStatus('success')
            } else {
                setMessage(`❌ Migration failed: ${data.error}`)
                setDetails(data)
                setStatus('error')
            }
        } catch (error: any) {
            setMessage(`❌ Error running migration: ${error.message}`)
            setStatus('error')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🔧 Database Setup
                    </h1>
                    <p className="text-gray-600">
                        Fix the Ventes database table issue
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Status Message */}
                    {message && (
                        <div className={`p-4 rounded-lg ${
                            status === 'success' ? 'bg-green-50 border border-green-200' :
                            status === 'error' ? 'bg-red-50 border border-red-200' :
                            'bg-blue-50 border border-blue-200'
                        }`}>
                            <p className={`text-sm font-medium ${
                                status === 'success' ? 'text-green-800' :
                                status === 'error' ? 'text-red-800' :
                                'text-blue-800'
                            }`}>
                                {message}
                            </p>
                        </div>
                    )}

                    {/* Details */}
                    {details && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="font-semibold text-gray-700 mb-2">Details:</h3>
                            <pre className="text-xs text-gray-600 overflow-auto max-h-64">
                                {JSON.stringify(details, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={checkDatabase}
                            disabled={status === 'checking' || status === 'migrating'}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            {status === 'checking' ? '🔍 Checking...' : '🔍 Check Database'}
                        </button>

                        <button
                            onClick={runMigration}
                            disabled={status === 'checking' || status === 'migrating' || status === 'success'}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            {status === 'migrating' ? '⚙️ Migrating...' : '🔧 Run Migration'}
                        </button>
                    </div>

                    {/* Success Action */}
                    {status === 'success' && (
                        <div className="pt-4 border-t border-gray-200">
                            <a
                                href="/"
                                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-center"
                            >
                                ✨ Go to Dashboard
                            </a>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions:</h3>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>Click <strong>"Check Database"</strong> to see if migration is needed</li>
                        <li>If migration is required, click <strong>"Run Migration"</strong></li>
                        <li>Wait for success message</li>
                        <li>Click <strong>"Go to Dashboard"</strong> to start using the app</li>
                    </ol>
                </div>

                {/* What This Does */}
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">🔍 What This Does:</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Creates the Vente table in your database</li>
                        <li>Adds venteId column to Transaction table</li>
                        <li>Updates TransactionType enum with VENTE</li>
                        <li>Creates all necessary foreign key relationships</li>
                        <li>Safe to run multiple times (won't duplicate)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

