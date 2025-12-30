import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [subject, setSubject] = useState('Mathématiques');
    const [className, setClassName] = useState('Terminale');
    const [type, setType] = useState('COURSE');
    const [uploadError, setUploadError] = useState('');

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

    const handleDelete = async (id: string) => {
        // if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
        try {
            await api.delete(`/api/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/documents', {
                title,
                description,
                url,
                subject,
                className,
                type,
                year: 2024 // Default
            });
            // Reset form and refresh list
            setTitle('');
            setDescription('');
            setUrl('');
            fetchDocuments();
        } catch (error) {
            setUploadError('Erreur lors de la création du document');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600">Bienvenue, {user?.email} (Admin)</p>
                </div>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                    Déconnexion
                </button>
            </div>

            {/* Upload Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Ajouter un document</h2>
                {uploadError && <p className="text-red-500 mb-2">{uploadError}</p>}
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Titre"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="URL du PDF"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Physique-Chimie">Physique-Chimie</option>
                        <option value="Histoire-Géo">Histoire-Géo</option>
                        <option value="Anglais">Anglais</option>
                    </select>
                    <select
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="Seconde">Seconde</option>
                        <option value="Première">Première</option>
                        <option value="Terminale">Terminale</option>
                    </select>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="COURSE">Cours</option>
                        <option value="EXERCISE">Exercice</option>
                        <option value="HOMEWORK">Devoir</option>
                        <option value="CORRECTION">Correction</option>
                    </select>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded md:col-span-2">
                        Ajouter
                    </button>
                </form>
            </div>

            {/* Document List */}
            <h2 className="text-2xl font-bold mb-4">Documents existants</h2>
            {loading ? <p>Chargement...</p> : (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">Titre</th>
                                <th className="py-3 px-4 text-left">Matière</th>
                                <th className="py-3 px-4 text-left">Classe</th>
                                <th className="py-3 px-4 text-left">Type</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id} className="border-t">
                                    <td className="py-3 px-4">{doc.title}</td>
                                    <td className="py-3 px-4">{doc.subject}</td>
                                    <td className="py-3 px-4">{doc.className}</td>
                                    <td className="py-3 px-4">{doc.type}</td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
