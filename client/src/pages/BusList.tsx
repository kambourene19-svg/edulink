import { useEffect, useState } from 'react';
import api from '../api/client';
import { Bus as BusIcon, Plus, Trash2, Pencil, Search, Filter, MoreVertical, Settings, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Bus {
    id: string;
    plate: string;
    seats: number;
    model: string;
    companyId: string;
    company: { name: string };
}

interface Company {
    id: string;
    name: string;
}

export default function BusList() {
    const { user } = useAuth();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBus, setEditingBus] = useState<Bus | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        plate: '',
        seats: 50,
        model: '',
        companyId: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [busesRes, companiesRes] = await Promise.all([
                api.get('/companies/bus'),
                api.get('/companies')
            ]);
            setBuses(busesRes.data);
            setCompanies(companiesRes.data);
            if (companiesRes.data.length > 0 && !formData.companyId) {
                setFormData(prev => ({ ...prev, companyId: companiesRes.data[0].id }));
            }
        } catch (error) {
            console.error('Erreur chargement données', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (bus: Bus) => {
        setEditingBus(bus);
        setFormData({
            plate: bus.plate,
            seats: bus.seats,
            model: bus.model || '',
            companyId: bus.companyId
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBus) {
                await api.put(`/companies/bus/${editingBus.id}`, formData);
            } else {
                await api.post('/companies/bus', formData);
            }
            setShowModal(false);
            setEditingBus(null);
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Opération échouée'));
        }
    };

    const handleDeleteBus = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce bus de la flotte ?')) return;
        try {
            await api.delete(`/companies/bus/${id}`);
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Impossible de supprimer le bus'));
        }
    };

    const canEdit = (busCompanyId: string) => {
        if (user?.role === 'SUPER_ADMIN') return true;
        if (user?.role === 'ADMIN_COMPANY' && user.companyId === busCompanyId) return true;
        return false;
    };

    const filteredBuses = buses.filter(b =>
        b.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl text-white">
                            <BusIcon size={28} />
                        </div>
                        Gestion de la Flotte
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Consultez et gérez les véhicules de transport enregistrés.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingBus(null);
                        setFormData({ plate: '', seats: 50, model: '', companyId: companies[0]?.id || '' });
                        setShowModal(true);
                    }}
                    className="btn-accent px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} /> <span className="font-bold">Ajouter un Véhicule</span>
                </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par plaque, modèle ou compagnie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-accent focus:bg-white transition-all text-sm outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <Filter size={18} />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {filteredBuses.length} Véhicules
                    </span>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium italic">Chargement de la flotte...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredBuses.map((bus, index) => (
                            <motion.div
                                key={bus.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="card-premium group relative overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-black tracking-widest border-2 border-slate-700 inline-block shadow-sm">
                                                {bus.plate}
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">
                                                {bus.model || 'Modèle Standard'}
                                            </p>
                                        </div>
                                        {canEdit(bus.companyId) && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(bus)}
                                                    className="p-2 hover:bg-accent/10 text-slate-400 hover:text-accent rounded-lg transition-all"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBus(bus.id)}
                                                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Capacité</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-white">
                                                    {bus.seats} <span className="text-xs font-normal text-slate-500">places</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Compagnie</p>
                                            <p className="text-sm font-bold text-primary dark:text-accent truncate max-w-[120px]">
                                                {bus.company.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1 h-12 bg-accent rounded-full blur-sm"></div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredBuses.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200 dark:border-slate-700 text-slate-300">
                                <BusIcon size={40} />
                            </div>
                            <p className="text-slate-500 font-medium">Aucun véhicule ne correspond à votre recherche.</p>
                        </div>
                    )}
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
                                        {editingBus ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
                                    </h2>
                                    <p className="text-sm text-slate-500">Remplissez les informations ci-dessous.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Plaque d'immatriculation</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold tracking-widest text-lg uppercase"
                                            placeholder="Ex: 11-JJ-1234"
                                            value={formData.plate}
                                            onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Capacité (Sièges)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold"
                                                value={formData.seats}
                                                onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Modèle</label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold"
                                                placeholder="Mercedes..."
                                                value={formData.model}
                                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Compagnie</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                            value={formData.companyId}
                                            onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                                            required
                                            disabled={user?.role !== 'SUPER_ADMIN'}
                                        >
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 px-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        {editingBus ? 'Sauvegarder' : 'Enregistrer'}
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


