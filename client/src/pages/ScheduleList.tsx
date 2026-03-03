import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Calendar, Plus, MapPin, Bus, FileText, X, Pencil, Trash2, Clock, Navigation, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Schedule {
    id: string;
    departureTime: string;
    route: {
        id: string;
        departureCity: string;
        arrivalCity: string;
        price: number;
        companyId: string;
        company: { name: string };
    };
    bus: {
        id: string;
        plate: string;
        seats: number;
    };
}

export default function ScheduleList() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        departureTime: '',
        routeId: '',
        busId: ''
    });

    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    const canEdit = (companyId: string) => true; // Role checking should be added here

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedRes, routesRes, busesRes] = await Promise.all([
                api.get('/companies/schedules'),
                api.get('/companies/routes'),
                api.get('/companies/bus')
            ]);
            setSchedules(schedRes.data);
            setRoutes(routesRes.data);
            setBuses(busesRes.data);

            if (routesRes.data.length > 0 && !newSchedule.routeId) {
                setNewSchedule(s => ({ ...s, routeId: routesRes.data[0].id }));
            }
            if (busesRes.data.length > 0 && !newSchedule.busId) {
                setNewSchedule(s => ({ ...s, busId: busesRes.data[0].id }));
            }
        } catch (error) {
            console.error('Erreur chargement planification', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?')) return;
        try {
            await api.delete(`/companies/schedules/${id}`);
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Impossible de supprimer'));
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setNewSchedule({
            departureTime: schedule.departureTime.slice(0, 16),
            routeId: schedule.route.id,
            busId: schedule.bus.id
        });
        setEditingSchedule(schedule);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isoTime = new Date(newSchedule.departureTime).toISOString();
            if (editingSchedule) {
                await api.put(`/companies/schedules/${editingSchedule.id}`, { ...newSchedule, departureTime: isoTime });
            } else {
                await api.post('/companies/schedules', { ...newSchedule, departureTime: isoTime });
            }
            setShowModal(false);
            setEditingSchedule(null);
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + (error.response?.data?.error || 'Opération échouée'));
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-xl text-white">
                            <Calendar size={28} />
                        </div>
                        Planification des Voyages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Organisez les départs et gérez le manifeste des passagers.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingSchedule(null);
                        setNewSchedule({
                            departureTime: '',
                            routeId: routes[0]?.id || '',
                            busId: buses[0]?.id || ''
                        });
                        setShowModal(true);
                    }}
                    className="btn-accent px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} /> <span className="font-bold">Planifier un Départ</span>
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium italic">Chargement du calendrier...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {schedules.map((schedule, index) => (
                            <motion.div
                                key={schedule.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card-premium group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                                        {schedule.route.price.toLocaleString()} FCFA
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                            {schedule.route.company.name}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                {new Date(schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-sm font-bold text-slate-400">
                                                {new Date(schedule.departureTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <Clock size={20} className="text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative">
                                        {/* Journey Line */}
                                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-dashed border-l-2 border-dashed border-slate-200 dark:border-slate-700"></div>

                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-2 border-white dark:border-slate-800 shadow-sm">
                                                <Navigation size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Départ</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{schedule.route.departureCity}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 border-2 border-white dark:border-slate-800 shadow-sm">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrivée</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{schedule.route.arrivalCity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bus size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 uppercase">{schedule.bus.plate}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/schedules/${schedule.id}/boarding`)}
                                                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <FileText size={14} /> Manifeste
                                            </button>
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="p-2 text-slate-400 hover:text-primary dark:hover:text-accent transition-all"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {schedules.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-200 dark:border-slate-700 text-slate-300">
                                <Calendar size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucun voyage planifié</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Commencez par planifier un nouveau départ pour cette ligne.
                            </p>
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
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {editingSchedule ? 'Modifier le départ' : 'Nouveau Départ'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Configurez les détails du voyage.</p>
                                </div>
                                <button onClick={() => { setShowModal(false); setEditingSchedule(null); }} className="text-slate-400 hover:text-slate-600">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Ligne (Trajet)</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                            value={newSchedule.routeId}
                                            onChange={e => setNewSchedule({ ...newSchedule, routeId: e.target.value })}
                                            required
                                            disabled={!!editingSchedule}
                                        >
                                            {routes.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.departureCity} ➝ {r.arrivalCity} ({r.company.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Véhicule assigné</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                            value={newSchedule.busId}
                                            onChange={e => setNewSchedule({ ...newSchedule, busId: e.target.value })}
                                            required
                                        >
                                            {buses.map(b => (
                                                <option key={b.id} value={b.id}>
                                                    {b.plate} - {b.seats} places ({b.company.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Date & Heure de départ</label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-accent rounded-2xl px-5 py-4 outline-none transition-all font-bold"
                                                value={newSchedule.departureTime}
                                                onChange={e => setNewSchedule({ ...newSchedule, departureTime: e.target.value })}
                                                required
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setEditingSchedule(null); }}
                                        className="flex-1 py-4 px-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap size={18} />
                                        <span>{editingSchedule ? 'Sauvegarder' : 'Confirmer'}</span>
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
