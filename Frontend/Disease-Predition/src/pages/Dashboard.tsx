import { useState, useRef, useCallback } from 'react';
import { diagnose } from '../api';

interface DiagResult {
    prediction: { disease: string; confidence: number; is_plant: boolean };
    advisory: string;
}


export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [result, setResult] = useState<DiagResult | null>(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'upload' | 'camera'>('upload');
    const [cameraOn, setCameraOn] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);


    const pickFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResult(null);
        setError('');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f && f.type.startsWith('image/')) pickFile(f);
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(4));
                setLon(pos.coords.longitude.toFixed(4));
                setLocating(false);
            },
            (err) => {
                setLocating(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Location access denied. Please allow location in your browser settings and try again.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location unavailable. Check your device\'s location settings.');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out. Please try again.');
                        break;
                    default:
                        setError('Could not get location. Please enter coordinates manually.');
                }
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };


    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 640, height: 480 }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraOn(true);
        } catch {
            setError('camera access denied');
        }
    }, []);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setCameraOn(false);
    };

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
            if (!blob) return;
            const captured = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            pickFile(captured);
            stopCamera();
            setTab('upload');
        }, 'image/jpeg', 0.9);
    };

    const submit = async () => {
        if (!file) return;
        if (!lat || !lon) { setError('get your location first'); return; }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await diagnose(file, parseFloat(lat), parseFloat(lon));
            if (res.data.error && res.data.prediction && res.data.prediction.is_plant === false) {
                setError(res.data.error);
            } else {
                setResult(res.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'diagnosis failed');
        } finally {
            setLoading(false);
        }
    };

    const clear = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError('');
    };

    const severityBadge = (disease: string) => {
        if (disease.toLowerCase().includes('healthy')) return <span className="badge badge-green">Healthy</span>;
        return <span className="badge badge-amber">Disease Detected</span>;
    };

    const formatAdvisory = (text: string) => {
        return text
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n- /g, '\n• ')
            .replace(/\n\d+\.\s/g, (m) => '\n' + m.trim() + ' ');
    };

    return (
        <>
            <h1 className="page-title">Diagnose</h1>
            <p className="page-sub">Upload a leaf photo or use your camera for instant AI-powered diagnosis</p>

            <div className="tab-row">
                <button className={`tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => { setTab('upload'); stopCamera(); }}>
                    Upload Image
                </button>
                <button className={`tab ${tab === 'camera' ? 'active' : ''}`} onClick={() => { setTab('camera'); startCamera(); }}>
                    Live Camera
                </button>
            </div>

            {!result && (
                <div className="card">
                    {tab === 'upload' ? (
                        <>
                            <div
                                className={`upload-zone ${file ? 'has-file' : ''}`}
                                onClick={() => fileRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {preview ? (
                                    <img src={preview} alt="preview" className="preview-img" />
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 16V8m0 0l-3 3m3-3l3 3M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M21 12V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6" />
                                        </svg>
                                        <p>Drop your leaf image here or <span className="browse">browse files</span></p>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) pickFile(f);
                            }} />
                        </>
                    ) : (
                        <>
                            <video ref={videoRef} className="camera-feed" autoPlay playsInline muted />
                            <div className="camera-controls">
                                {cameraOn && (
                                    <button className="btn btn-primary" onClick={capture}>Capture</button>
                                )}
                                <button className="btn btn-secondary" onClick={cameraOn ? stopCamera : startCamera}>
                                    {cameraOn ? 'Stop' : 'Start'} Camera
                                </button>
                            </div>
                        </>
                    )}

                    <div className="input-row">
                        <div className="input-group">
                            <label>Latitude</label>
                            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="28.7041" />
                        </div>
                        <div className="input-group">
                            <label>Longitude</label>
                            <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="77.1025" />
                        </div>
                    </div>

                    <div className="btn-row">
                        <button
                            className="btn btn-secondary"
                            onClick={getLocation}
                            disabled={locating}
                        >
                            {locating ? (
                                <><div className="spinner" /> Locating...</>
                            ) : '📍 Use My Location'}
                        </button>

                        <button className="btn btn-primary" onClick={submit} disabled={!file || loading}>
                            {loading ? (
                                <><div className="spinner" /> Analyzing...</>
                            ) : 'Run Diagnosis'}
                        </button>
                        {file && <button className="btn btn-ghost" onClick={clear}>Clear</button>}
                    </div>

                    {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}
                </div>
            )}

            {loading && (
                <div className="card">
                    <div className="loading-overlay">
                        <div className="spinner" style={{ width: 36, height: 36 }} />
                        <p>AI agent is analyzing your plant, checking weather, and finding treatments...</p>
                        <p style={{ fontSize: '0.75rem' }}>This may take 15-30 seconds</p>
                    </div>
                </div>
            )}

            {result && (
                <>
                    <div className="card">
                        <div className="result-header">
                            <div>
                                <div style={{ marginBottom: 8 }}>{severityBadge(result.prediction.disease)}</div>
                                <h2 className="result-disease">
                                    {result.prediction.disease.replace(/___/g, ' — ').replace(/_/g, ' ')}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="result-confidence">{(result.prediction.confidence * 100).toFixed(1)}%</div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>confidence</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title">🤖 AI Advisory</div>
                        <div
                            className="advisory-text"
                            dangerouslySetInnerHTML={{ __html: formatAdvisory(result.advisory) }}
                        />
                    </div>

                    <div className="btn-row">
                        <button className="btn btn-primary" onClick={clear}>New Diagnosis</button>
                    </div>
                </>
            )}
        </>
    );
}
