import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={
                            <div className="p-10 text-center">
                                <h1 className="text-4xl font-bold text-primary mb-4">Bienvenue sur EduLink</h1>
                                <p className="text-xl text-gray-600">La plateforme de réussite pour votre lycée.</p>
                                <div className="mt-8">
                                    <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600">Accéder à mes cours</Link>
                                </div>
                            </div>
                        } />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route
                            path="dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
