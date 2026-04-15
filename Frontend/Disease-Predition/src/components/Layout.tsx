import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
}

export default function Layout() {
    const [user, setUser] = useState<UserData | null>(null);
    const nav = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { nav('/login'); return; }
        setUser(JSON.parse(stored));
    }, [nav]);

    if (!user) return null;

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h1>🌿 PlantDoc</h1>
                    <span>AI Disease Diagnosis</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Diagnose
                    </NavLink>

                    <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                    </NavLink>

                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <p>{user.name}</p>
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}
