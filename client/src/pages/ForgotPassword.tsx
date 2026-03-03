import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Note: On utilise 'phone' ici car c'est l'identifiant principal, 
            // mais l'utilisateur s'attend peut-être à recevoir un SMS ou un Email simulé.
            await api.post('/auth/request-reset-password', { phone });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Mot de passe oublié ?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Entrez votre numéro de téléphone pour recevoir un lien de réinitialisation.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Numéro de téléphone
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Ex: 70123456"
                                    />
                                </div>
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Vérifiez vos messages</h3>
                            <p className="text-sm text-gray-500">
                                Si un compte existe associé à ce numéro, vous avez reçu un lien (simulé dans la console serveur).
                            </p>
                            <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                                Retour à la connexion
                            </Link>
                        </div>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <Link to="/login" className="px-2 bg-white text-gray-500 hover:text-gray-700">
                                    Annuler et revenir
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
