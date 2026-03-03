import { useState, useEffect } from 'react';
import {
    Building2, Users, Ticket, TrendingUp, Calendar,
    Download, X, RefreshCcw, Search, ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="card-premium p-6 flex flex-col justify-between"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p - 3 rounded - 2xl ${color} bg - opacity - 10 text - opacity - 100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className={`flex items - center text - xs font - bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'} `}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{value}</h3>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/companies/stats');
            setStats(data);
        } catch (error) {
            console.error('Erreur stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading && !stats) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        </div>
    );

    const kpis = stats?.kpis || {};

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tableau de Bord</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Bienvenue, <span className="font-bold text-primary dark:text-accent">{user?.fullName || 'Admin'}</span>. Voici l'état de votre activité.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStats}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="glass px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary dark:text-accent border border-accent/20">
                        {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Manager'}
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Chiffre d'Affaires"
                    value={`${(kpis.totalRevenue || 0).toLocaleString()} FCFA`}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    trend={12}
                />
                <StatCard
                    title="Tickets Vendus"
                    value={kpis.totalBookings || 0}
                    icon={Ticket}
                    color="bg-indigo-500"
                    trend={8}
                />
                <StatCard
                    title="Occupation"
                    value={`${kpis.occupancyRate || 0}% `}
                    icon={Users}
                    color="bg-amber-500"
                    trend={-2}
                />
                <StatCard
                    title="Voyages Actifs"
                    value={kpis.activeSchedules || 0}
                    icon={Calendar}
                    color="bg-rose-500"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Analyse des Ventes</h3>
                            <p className="text-sm text-slate-500">Recettes journalières (7 derniers jours)</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 py-1 px-3 rounded-lg text-xs font-bold text-slate-500">
                            LIVE DATA
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        backgroundColor: '#0F172A',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#94A3B8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'CA']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#F59E0B"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Info / Quick Actions Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-premium p-8 bg-primary dark:bg-slate-900 border-none relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-all duration-700"></div>
                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Export Rapide</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10">Générez un rapport complet de vos activités en un clic.</p>
                        <button className="btn-accent w-full flex items-center justify-center gap-3 relative z-10">
                            <Download size={20} />
                            <span>Rapport PDF</span>
                        </button>
                    </div>

                    <div className="card-premium p-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Besoin d'aide ?</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Notre équipe support est disponible 24/7 pour vous accompagner dans la gestion de votre compagnie.
                        </p>
                        <button className="text-primary dark:text-accent font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Contacter le support <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card-premium overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Réservations Récentes</h3>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un passager..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-accent focus:bg-white transition-all text-sm outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-8 py-5">Logo</th>
                                <th className="px-4 py-5 font-bold text-slate-700">Passager</th>
                                <th className="px-1 py-5">Compagnie</th>
                                <th className="px-1 py-5">Trajet</th>
                                <th className="px-1 py-5">Départ</th>
                                <th className="px-1 py-5">Statut</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats?.recentBookings
                                .filter((b: any) =>
                                    b.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    b.user.phone?.includes(searchTerm)
                                )
                                .map((b: any) => (
                                    <motion.tr
                                        key={b.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <img
                                                src={b.schedule.route.company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.schedule.route.company.name)}&background=random`}
                                                alt={b.schedule.route.company.name}
                                                className="w-10 h-10 rounded-xl shadow-sm object-cover border border-white dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-800"
                                            />
                                        </td >
                                        <td className="px-4 py-5">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{b.user.fullName}</div>
                                            <div className="text-xs text-slate-500">{b.user.phone}</div>
                                        </td>
                                        <td className="px-1 py-5 font-medium text-slate-600 dark:text-slate-400 uppercase text-xs tracking-tighter">{b.schedule.route.company.name}</td>
                                        <td className="px-1 py-5 text-sm font-bold text-primary dark:text-white">
                                            {b.schedule.route.departureCity} <span className="text-accent mx-1">→</span> {b.schedule.route.arrivalCity}
                                        </td>
                                        <td className="px-1 py-5">
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(b.schedule.departureTime).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                🕒 {new Date(b.schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-1 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                                b.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => generateTicketPDF(b)}
                                                className="p-2 text-slate-400 hover:text-accent transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </motion.tr >
                                ))}
                        </tbody >
                    </table >
                    {
                        stats?.recentBookings.length === 0 && (
                            <div className="p-12 text-center text-slate-400 italic">Aucune donnée disponible.</div>
                        )
                    }
                </div >
            </div >
        </div >
    );
}
