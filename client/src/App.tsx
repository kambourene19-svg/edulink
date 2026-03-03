import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyList from './pages/CompanyList';
import BusList from './pages/BusList';
import RouteList from './pages/RouteList';
import ScheduleList from './pages/ScheduleList';

import BoardingList from './pages/BoardingList';

// ... (existing imports)

import Terms from './pages/Terms';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protection des routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/terms" element={<Terms />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="companies" element={<CompanyList />} />
                        <Route path="buses" element={<BusList />} />
                        <Route path="routes" element={<RouteList />} />
                        <Route path="schedules" element={<ScheduleList />} />
                        <Route path="schedules/:id/boarding" element={<BoardingList />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
