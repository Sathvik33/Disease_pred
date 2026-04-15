import { useState, useEffect } from 'react';
import { getHistory } from '../api';

interface Prediction {
    id: number;
    disease: string;
    confidence: number;
    latitude: number;
    longitude: number;
    advisory: string;
    created_at: string;
}

export default function History() {
    const [items, setItems] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Prediction | null>(null);

    useEffect(() => {
        getHistory()
            .then((res) => setItems(res.data.history))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatAdvisory = (text: string) => {
        return text
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
        <>
            <h1 className="page-title">History</h1>
            <p className="page-sub">Your past plant diagnoses</p>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No diagnoses yet. Run your first diagnosis to see history here.</p>
                </div>
            )}

            <div className="history-list">
                {items.map((item) => (
                    <div key={item.id} className="history-item" onClick={() => setSelected(item)}>
                        <div className="history-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 6v4l3 3" />
                            </svg>
                        </div>
                        <div className="history-content">
                            <h4>{item.disease.replace(/___/g, ' — ').replace(/_/g, ' ')}</h4>
                            <p>{formatDate(item.created_at)}</p>
                        </div>
                        <span className="history-confidence">{(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>

            {selected && (
                <div className="detail-modal" onClick={() => setSelected(null)}>
                    <div className="detail-content" onClick={(e) => e.stopPropagation()}>
                        <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
                        <div style={{ marginBottom: 8 }}>
                            {selected.disease.toLowerCase().includes('healthy')
                                ? <span className="badge badge-green">Healthy</span>
                                : <span className="badge badge-amber">Disease</span>}
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
                            {selected.disease.replace(/___/g, ' — ').replace(/_/g, ' ')}
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 20 }}>
                            {formatDate(selected.created_at)} · {(selected.confidence * 100).toFixed(1)}% confidence
                        </p>
                        <div
                            className="advisory-text"
                            dangerouslySetInnerHTML={{ __html: formatAdvisory(selected.advisory) }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
