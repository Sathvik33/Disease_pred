import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api';

export default function Auth() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("Submitting auth:", mode, email);

            const res =
                mode === 'login'
                    ? await login(email, password)
                    : await register(name, email, password);

            console.log("AUTH SUCCESS:", res.data);

            if (!res.data?.token || !res.data?.user) {
                throw new Error("Missing token or user in response");
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            console.log("Saved token:", localStorage.getItem("token"));

            nav('/');
        } catch (err: any) {
            console.error("AUTH ERROR:", err);
            console.error("AUTH RESPONSE:", err?.response?.data);

            setError(
                err?.response?.data?.error ||
                err?.message ||
                'something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
                <p className="sub">
                    {mode === 'login'
                        ? 'Sign in to diagnose plant diseases'
                        : 'Start protecting your crops today'}
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form className="auth-form" onSubmit={submit}>
                    {mode === 'register' && (
                        <input
                            className="input-field"
                            placeholder="Your name"
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <input
                        className="input-field"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? (
                            <><div className="spinner" /> Processing...</>
                        ) : mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === 'login' ? (
                        <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); setError(''); }}>Sign up</a></>
                    ) : (
                        <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>Sign in</a></>
                    )}
                </p>
            </div>
        </div>
    );
}
