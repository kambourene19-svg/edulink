import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Building2, Ticket, LogOut, Bus,
    Map, Moon, Sun, ChevronRight, User, Menu, X, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/companies', label: 'Compagnies', icon: Building2 },
        { path: '/buses', label: 'Flotte de Bus', icon: Bus, category: 'Gestion' },
        { path: '/routes', label: 'Trajets & Prix', icon: Map },
        { path: '/schedules', label: 'Planification', icon: Calendar },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="relative bg-primary dark:bg-slate-950 text-white flex flex-col z-50 shadow-2xl transition-colors duration-500"
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-2xl font-black tracking-tighter"
                            >
                                FASO<span className="text-accent underline decoration-accent/30 underline-offset-4">TICKET</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {navItems.map((item, index) => (
                        <div key={item.path}>
                            {item.category && isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] uppercase font-bold text-slate-500 mt-6 mb-2 ml-4 tracking-widest"
                                >
                                    {item.category}
                                </motion.div>
                            )}
                            <Link
                                to={item.path}
                                className={`
                                    flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                                    ${isActive(item.path)
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'hover:bg-white/5 text-slate-300 hover:text-white'}
                                `}
                            >
                                <item.icon size={22} className={`${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                {isSidebarOpen && (
                                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/5 bg-black/10">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex items-center justify-center space-x-3 w-full p-3 mb-4 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {isSidebarOpen && <span className="text-sm font-medium">{darkMode ? 'Clair' : 'Sombre'}</span>}
                    </button>

                    <div className={`flex items-center space-x-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
                            {user?.fullName?.charAt(0) || <User size={18} />}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user?.fullName || 'Admin'}</p>
                                <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{user?.role || 'Compagnie'}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors py-2 px-1 ${!isSidebarOpen && 'justify-center w-full'}`}
                    >
                        <LogOut size={18} />
                        {isSidebarOpen && <span className="font-medium">Quitter</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 glass flex justify-between items-center px-8 z-40 transition-colors duration-500">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                            Plateforme <span className="text-accent">Gestion</span>
                        </h2>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
