import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <nav className="bg-primary text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-xl font-bold">EduLink</Link>
                        <div className="flex space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">Tableau de bord</Link>
                                    {/* Admin Link */}
                                    {isAuthenticated && (
                                        // TODO: Check for admin role here if possible via component logic, or rely on AuthContext from Layout
                                        // Since Layout uses useAuth, we can check role.
                                        // Need to update useAuth destructuring above first.
                                        null
                                    )}
                                    <button onClick={handleLogout} className="hover:bg-blue-700 px-3 py-2 rounded">Déconnexion</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">Connexion</Link>
                                    {/* Register link disabled for students per requirement, or maybe handled differently */}
                                    <Link to="/register" className="hover:bg-blue-700 px-3 py-2 rounded">Inscription</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
