import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import { getMe } from './api';
import { useState, useEffect } from 'react';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setStatus('fail'); return; }

        getMe()
            .then(() => setStatus('ok'))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setStatus('fail');
            });
    }, [navigate]);

    if (status === 'checking') {
        return (
            <div className="auth-page">
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }
    if (status === 'fail') return <Navigate to="/login" replace />;
    return <>{children}</>;
}


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="history" element={<History />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
