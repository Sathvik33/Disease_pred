import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
}

export default function Layout() {
    const [user] = useState<UserData | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

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
                        Diagnose
                    </NavLink>

                    <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        History
                    </NavLink>

                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Profile
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
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