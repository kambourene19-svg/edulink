import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('Seconde'); // Default
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password, fullName: email.split('@')[0], role: 'MANAGER' });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'L\'inscription a échoué');
        }
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Inscription Partenaire</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Professionnel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            required
                            placeholder="votre@compagnie.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-600 transition font-bold"
                    >
                        Créer un compte
                    </button>
                </form>
            </div>
        </div>
    );
}
