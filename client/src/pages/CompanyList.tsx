import { useEffect, useState } from 'react';
import api from '../api/client';
import { Building2, Plus, Pencil, X, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
    id: string;
    name: string;
    logoUrl?: string;
    contacts: string;
    _count?: {
        buses: number;
        routes: number;
    };
}

export default function CompanyList() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        contacts: ''
    });

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/companies');
            setCompanies(data);
        } catch (error) {
            console.error('Failed to fetch companies', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setFormData({
            name: company.name,
            contacts: company.contacts || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await api.put(`/companies/${editingCompany.id}`, formData);
            } else {
                await api.post('/companies', formData);
            }
            setShowModal(false);
            setEditingCompany(null);
            fetchCompanies();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Opération échouée'));
        }
    };

    const canEdit = (companyId: string) => {
        if (user?.role === 'SUPER_ADMIN') return true;
        if (user?.role === 'ADMIN_COMPANY' && user.companyId === companyId) return true;
        return false;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Building2 size={28} />
                        </div>
                        Compagnies de Transport
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gérez les partenaires et les informations corporatives.
                    </p>
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                    <button
                        onClick={() => {
                            setEditingCompany(null);
                            setFormData({ name: '', contacts: '' });
                            setShowModal(true);
                        }}
                        className="btn-premium px-6 py-3 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} /> <span className="font-bold">Nouvelle Compagnie</span>
                    </button>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium italic">Chargement des partenaires...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {companies.map((company, index) => (
                            <motion.div
                                key={company.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="card-premium group"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <img
                                                src={company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`}
                                                alt={company.name}
                                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800">
                                                <ShieldCheck size={12} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                                {company.name}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Partenaire Vérifié
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <Phone size={16} className="text-slate-300" />
                                            <span className="truncate">{company.contacts || 'Non renseigné'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-slate-800">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                {company._count?.buses || 0}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bus</p>
                                        </div>
                                        <div className="text-center border-l border-slate-50 dark:border-slate-800">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                {company._count?.routes || 0}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lignes</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between">
                                        <button className="text-xs font-black text-primary dark:text-accent uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Voir les détails <ExternalLink size={14} />
                                        </button>
                                        {canEdit(company.id) && (
                                            <button
                                                onClick={() => handleEdit(company)}
                                                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-primary dark:hover:text-accent hover:bg-white transition-all shadow-sm"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {editingCompany ? 'Modifier la Compagnie' : 'Nouvel Enregistrement'}
                                    </h2>
                                    <p className="text-sm text-slate-500">Informations administratives du partenaire.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Nom de la compagnie</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-bold text-lg"
                                        placeholder="Ex: Faso Excellence"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Contacts & Adresse</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium min-h-[120px]"
                                        placeholder="Numéros de téléphone, emails, situation géographique..."
                                        value={formData.contacts}
                                        onChange={e => setFormData({ ...formData, contacts: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 px-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-primary dark:bg-white text-white dark:text-primary rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        {editingCompany ? 'Sauvegarder' : 'Confirmer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
