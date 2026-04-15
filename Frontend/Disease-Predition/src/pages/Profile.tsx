import { useEffect, useState } from 'react';
import { getMe } from '../api';

interface User {
    id: number;
    uid: string;
    name: string;
    email: string;
    created_at: string;
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMe()
            .then((res) => setUser(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    if (loading) return (
        <div className="loading-overlay">
            <div className="spinner" />
        </div>
    );

    if (!user) return <p>Could not load profile</p>;

    return (
        <>
            <h1 className="page-title">Profile</h1>
            <p className="page-sub">Your account details</p>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div className="user-avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Member since {formatDate(user.created_at)}</p>
                    </div>
                </div>

                <div className="profile-field">
                    <label>User ID</label>
                    <p className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.3px' }}>{user.uid}</p>
                </div>

                <div className="profile-field">
                    <label>Name</label>
                    <p className="value">{user.name}</p>
                </div>

                <div className="profile-field">
                    <label>Email</label>
                    <p className="value">{user.email}</p>
                </div>
            </div>

            <button className="btn btn-secondary" onClick={logout} style={{ color: 'var(--red)' }}>
                Sign out
            </button>
        </>
    );
}
