import { useEffect, useState } from 'react';
import api from '../api/client';
import { Map, Plus, Trash2, ArrowRight, Navigation, MapPin, Search, Filter, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Route {
    id: string;
    departureCity: string;
    arrivalCity: string;
    price: number;
    companyId: string;
    company: { name: string };
}

interface Company {
    id: string;
    name: string;
}

export default function RouteList() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newRoute, setNewRoute] = useState({
        departureCity: '',
        arrivalCity: '',
        price: 5000,
        companyId: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [routesRes, companiesRes] = await Promise.all([
                api.get('/companies/routes'),
                api.get('/companies')
            ]);
            setRoutes(routesRes.data);
            setCompanies(companiesRes.data);
            if (companiesRes.data.length > 0 && !newRoute.companyId) {
                setNewRoute(prev => ({ ...prev, companyId: companiesRes.data[0].id }));
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

    const handleAddRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/companies/routes', newRoute);
            setShowModal(false);
            setNewRoute({
                departureCity: '',
                arrivalCity: '',
                price: 5000,
                companyId: companies[0]?.id || ''
            });
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Impossible d\'ajouter le trajet'));
        }
    };

    const handleDeleteRoute = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce trajet de la base ?')) return;
        try {
            await api.delete(`/companies/routes/${id}`);
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Impossible de supprimer le trajet'));
        }
    };

    const filteredRoutes = routes.filter(r =>
        r.departureCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.arrivalCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl text-white">
                            <Map size={28} />
                        </div>
                        Lignes de Transport
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Définissez les trajets et les tarifs pour votre flotte.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-premium px-6 py-3 flex items-center gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus size={20} /> <span className="font-bold">Nouvelle Ligne</span>
                </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une ville ou une compagnie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white transition-all text-sm outline-none font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{filteredRoutes.length} Itinéraires</span>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium italic">Chargement des trajets...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredRoutes.map((route, index) => (
                            <motion.div
                                key={route.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="card-premium group"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                                            Tarif Premium
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRoute(route.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 relative mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                                                <Navigation size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Départ</p>
                                                <p className="text-lg font-black text-slate-800 dark:text-white">{route.departureCity}</p>
                                            </div>
                                        </div>

                                        <div className="ml-4 h-6 border-l-2 border-dashed border-slate-200 dark:border-slate-700"></div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Arrivée</p>
                                                <p className="text-lg font-black text-slate-800 dark:text-white">{route.arrivalCity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Compagnie</p>
                                            <p className="text-sm font-black text-primary dark:text-accent mt-1">{route.company.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                {route.price.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">CFA</span>
                                            </p>
                                        </div>
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
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nouvelle Ligne</h2>
                                    <p className="text-sm text-slate-500 font-medium">Définissez un nouvel itinéraire commercial.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleAddRoute} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Ville de départ</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold"
                                            placeholder="Ex: Ouaga"
                                            value={newRoute.departureCity}
                                            onChange={e => setNewRoute({ ...newRoute, departureCity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Ville d'arrivée</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold"
                                            placeholder="Ex: Bobo"
                                            value={newRoute.arrivalCity}
                                            onChange={e => setNewRoute({ ...newRoute, arrivalCity: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Tarif du ticket (FCFA)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none transition-all font-black text-xl text-emerald-600 dark:text-emerald-400"
                                        value={newRoute.price}
                                        onChange={e => setNewRoute({ ...newRoute, price: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Compagnie</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={newRoute.companyId}
                                        onChange={e => setNewRoute({ ...newRoute, companyId: e.target.value })}
                                        required
                                    >
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
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
                                        className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        Créer la ligne
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
