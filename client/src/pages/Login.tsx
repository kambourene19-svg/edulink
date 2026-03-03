import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(phone, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('LOGIN ERROR:', err);
            let msg = 'Identifiants incorrects ou problème serveur.';
            if (err.response?.data?.error) {
                msg = err.response.data.error;
            } else if (err.request) {
                msg = 'Le serveur ne répond pas. Veuillez vérifier votre connexion.';
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#020617] font-sans selection:bg-accent/30 selection:text-white">
            {/* Left Side: Visual Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-900 opacity-90"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full flex flex-col justify-center p-16 text-white text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-black tracking-tighter mb-6">
                            FASO<span className="text-accent underline decoration-accent/30 underline-offset-8">TICKET</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-lg leading-relaxed mb-10">
                            La solution de gestion de transport la plus sécurisée et la plus élégante du Burkina Faso.
                            Gérez votre flotte et vos voyageurs avec une simplicité inédite.
                        </p>

                        <div className="space-y-6">
                            {[
                                "Gestion de flotte en temps réel",
                                "Paiements sécurisés (OM/Moov)",
                                "Dashboard analytique premium",
                                "Application mobile passagers"
                            ].map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center space-x-3 text-slate-200"
                                >
                                    <CheckCircle2 className="text-accent" size={20} />
                                    <span className="font-medium">{text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="mt-auto pt-10 text-slate-500 text-sm">
                        &copy; 2026 FasoTicket Technologies. Tous droits réservés.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 lg:hidden text-center">
                        <h1 className="text-4xl font-black text-primary dark:text-white tracking-tighter">
                            FASO<span className="text-accent">TICKET</span>
                        </h1>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bon retour !</h2>
                        <p className="text-slate-500 dark:text-slate-400">Accédez à votre espace d'administration sécurisé.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-3"
                        >
                            <span className="mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
                                Téléphone
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                    placeholder="ex: 01234567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                    Mot de passe
                                </label>
                                <Link to="/forgot-password" className="text-xs font-bold text-accent hover:text-accent/80 transition-colors">
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all dark:text-white placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-premium flex items-center justify-center space-x-2 h-14"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-500 mb-4">Besoin d'aide ou accès refusé ?</p>
                        <div className="flex flex-col gap-3">
                            <Link to="/terms" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
                                Conditions Générales d'Utilisation
                            </Link>
                            <div className="h-px w-20 bg-slate-100 dark:bg-slate-800 mx-auto"></div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                FasoTicket Support
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
