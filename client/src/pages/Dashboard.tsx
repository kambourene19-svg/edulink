import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/api/documents');
            setDocuments(res.data);
        } catch (error) {
            console.error('Error fetching documents', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <h2 className="text-xl text-gray-600 mb-6">Bienvenue sur votre espace élève</h2>

            {loading ? (
                <p>Chargement...</p>
            ) : documents.length === 0 ? (
                <p className="text-gray-500">Aucun document disponible pour le moment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc: any) => (
                        <div key={doc.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
                            <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
                            <p className="text-gray-600 mb-2">{doc.subject} - {doc.className}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded mb-4 ${doc.type === 'CORRECTION' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {doc.type}
                            </span>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center bg-gray-100 hover:bg-gray-200 text-primary py-2 rounded"
                            >
                                Télécharger / Voir
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
