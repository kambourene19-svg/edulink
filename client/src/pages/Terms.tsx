import React from 'react';
import { ArrowLeft, Shield, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Conditions Générales d'Utilisation</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* Introduction */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-3 text-orange-600">
                        <Shield size={32} />
                        <h2 className="text-2xl font-bold">1. Introduction</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Bienvenue sur <strong>FasoTicket</strong>. En utilisant notre plateforme de réservation de billets de car,
                        vous acceptez sans réserve les présentes conditions. FasoTicket est un service tiers facilitant
                        la mise en relation entre les voyageurs et les compagnies de transport (TSR, STAF, Rakieta, etc.).
                    </p>
                </div>

                {/* Responsabilités */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-3 text-blue-600">
                        <UserCheck size={32} />
                        <h2 className="text-2xl font-bold">2. Responsabilités</h2>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                        <li>FasoTicket garantit la délivrance d'un titre de transport valide après paiement.</li>
                        <li>Les horaires de départ et la qualité du transport relèvent de la responsabilité exclusive de la compagnie de transport.</li>
                        <li>FasoTicket ne peut être tenu responsable des retards, pannes ou annulations de dernière minute décidés par la compagnie.</li>
                    </ul>
                </div>

                {/* Paiements et Remboursements */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-3 text-green-600">
                        <FileText size={32} />
                        <h2 className="text-2xl font-bold">3. Paiements & Remboursements</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Les paiements sont sécurisés via nos partenaires (Orange Money, Moov Money, CinetPay).
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h3 className="font-semibold text-orange-800 mb-2">Politique d'Annulation :</h3>
                        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                            <li>Annulation &gt; 24h avant le départ : Remboursement à 100% (moins frais de dossier).</li>
                            <li>Annulation &lt; 24h avant le départ : Remboursement à 50%.</li>
                            <li>Après le départ : Aucun remboursement.</li>
                        </ul>
                    </div>
                </div>

                {/* Données Personnelles */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-3 text-purple-600">
                        <AlertTriangle size={32} />
                        <h2 className="text-2xl font-bold">4. Données Personnelles</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Conformément à la législation en vigueur au Burkina Faso, vos données (Nom, Téléphone, Photo)
                        sont collectées uniquement pour l'émission des billets et la sécurité des transports.
                        Elles ne sont jamais revendues à des tiers.
                    </p>
                </div>

                {/* Footer simple */}
                <div className="text-center text-sm text-gray-400 py-8 border-t">
                    <p>FasoTicket © 2026 - Tous droits réservés.</p>
                    <p>Siège Social : Ouagadougou, Burkina Faso.</p>
                </div>

            </div>
        </div>
    );
};

export default Terms;
