'use client'

import { useState } from 'react'

export default function DebugLoginPage() {
    const [email, setEmail] = useState('admin@saidapp.com')
    const [password, setPassword] = useState('admin123')
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const checkDatabase = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/diagnose')
            const data = await res.json()
            setResults({ type: 'database', data })
        } catch (error: any) {
            setResults({ type: 'error', data: error.message })
        }
        setLoading(false)
    }

    const seedDatabase = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/seed-production', { method: 'POST' })
            const data = await res.json()
            setResults({ type: 'seed', data })
        } catch (error: any) {
            setResults({ type: 'error', data: error.message })
        }
        setLoading(false)
    }

    const testSimpleLogin = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/simple-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            setResults({ type: 'simple-login', data })
        } catch (error: any) {
            setResults({ type: 'error', data: error.message })
        }
        setLoading(false)
    }

    const testNextAuthLogin = async () => {
        setLoading(true)
        try {
            // Using NextAuth
            const res = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.text()
            setResults({ type: 'nextauth-login', data, status: res.status })
        } catch (error: any) {
            setResults({ type: 'error', data: error.message })
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔧 Debug Login Page</h1>
                
                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-gray-800 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 bg-gray-800 rounded"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={checkDatabase}
                        disabled={loading}
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                    >
                        1. Check Database Status
                    </button>
                    
                    <button
                        onClick={seedDatabase}
                        disabled={loading}
                        className="p-4 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                    >
                        2. Seed Database (if needed)
                    </button>
                    
                    <button
                        onClick={testSimpleLogin}
                        disabled={loading}
                        className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded disabled:opacity-50"
                    >
                        3. Test Simple Login
                    </button>
                    
                    <button
                        onClick={testNextAuthLogin}
                        disabled={loading}
                        className="p-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
                    >
                        4. Test NextAuth Login
                    </button>
                </div>

                {loading && (
                    <div className="p-4 bg-gray-800 rounded">
                        <p>Loading...</p>
                    </div>
                )}

                {results && (
                    <div className="p-4 bg-gray-800 rounded">
                        <h3 className="text-xl font-bold mb-4">
                            Results - {results.type}
                        </h3>
                        <pre className="overflow-auto text-sm">
                            {JSON.stringify(results.data, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 p-4 bg-gray-800 rounded">
                    <h3 className="font-bold mb-2">📋 Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Check Database Status</strong> - See if admin user exists</li>
                        <li><strong>Seed Database</strong> - Create admin user if missing</li>
                        <li><strong>Test Simple Login</strong> - Verify credentials work</li>
                        <li><strong>Test NextAuth Login</strong> - Test the actual auth system</li>
                    </ol>
                </div>

                <div className="mt-4">
                    <a href="/login" className="text-blue-400 hover:underline">
                        ← Back to Normal Login
                    </a>
                </div>
            </div>
        </div>
    )
}



