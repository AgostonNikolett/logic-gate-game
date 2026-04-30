import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';

function App() {
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);

    // Stocăm progresul complex: nivelul deblocat + stelele pe fiecare nivel
    const [progress, setProgress] = useState({
        unlockedLevel: 1,
        levelStars: {} // ex: { 1: 3, 2: 2, 3: 0 }
    });

    useEffect(() => {
        // 1. Încărcăm progresul (noul format)
        const savedProgress = localStorage.getItem('logicGateProgressData');
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }

        // 2. Încărcăm nivelurile
        fetch('http://localhost:5000/api/levels')
            .then(res => res.json())
            .then(data => setLevels(data))
            .catch(err => console.error("API Offline", err));
    }, []);

    const loadLevel = (level) => {
        if (level.id <= progress.unlockedLevel) {
            fetch(`http://localhost:5000/api/levels/${level.id}`)
                .then(res => res.json())
                .then(data => setSelectedLevel(data));
        }
    };

    // NOU: Primim stelele calculate din GameBoard
    const handleLevelComplete = (earnedStars) => {
        setProgress(prev => {
            // Deblocăm următorul nivel doar dacă l-am terminat pe cel mai mare curent
            const nextLevel = selectedLevel.id === prev.unlockedLevel ? prev.unlockedLevel + 1 : prev.unlockedLevel;

            // Păstrăm scorul cel mai bun (dacă rejoci și iei mai puține stele, rămân cele vechi)
            const currentBest = prev.levelStars[selectedLevel.id] || 0;
            const newBest = Math.max(currentBest, earnedStars);

            const newData = {
                unlockedLevel: nextLevel,
                levelStars: { ...prev.levelStars, [selectedLevel.id]: newBest }
            };

            localStorage.setItem('logicGateProgressData', JSON.stringify(newData));
            return newData;
        });

        setSelectedLevel(null);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#020617' }}>
            <header style={{ padding: '15px 30px', background: '#1e293b', borderBottom: '2px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <h1 style={{ margin: 0, color: '#60a5fa', textShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}>⚡ LogicGate Academy</h1>
                {selectedLevel && (
                    <button onClick={() => setSelectedLevel(null)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ⬅ Abandon
                    </button>
                )}
            </header>

            <main style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                {!selectedLevel ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px' }}>
                        <h2 style={{ textAlign: 'center', color: '#e2e8f0', marginBottom: '50px', fontSize: '2rem' }}>Harta Sistemului</h2>

                        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: '50px', paddingTop: '20px' }}>
                            {levels.map((l, index) => {
                                const isUnlocked = l.id <= progress.unlockedLevel;
                                const isCompleted = l.id < progress.unlockedLevel || progress.levelStars[l.id] !== undefined;
                                const stars = progress.levelStars[l.id] || 0;

                                return (
                                    <div key={l.id} style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div
                                                onClick={() => isUnlocked && loadLevel(l)}
                                                style={{
                                                    width: '80px', height: '80px', borderRadius: '50%',
                                                    background: isCompleted ? '#059669' : isUnlocked ? '#2563eb' : '#1e293b',
                                                    border: `4px solid ${isUnlocked ? '#f8fafc' : '#334155'}`,
                                                    boxShadow: isUnlocked ? `0 0 25px ${isCompleted ? '#10b981' : '#3b82f6'}` : 'none',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    cursor: isUnlocked ? 'pointer' : 'not-allowed', flexShrink: 0,
                                                    transition: 'all 0.3s ease-in-out', opacity: isUnlocked ? 1 : 0.4
                                                }}
                                                onMouseEnter={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <span style={{ fontSize: '28px', fontWeight: 'bold', color: isUnlocked ? '#fff' : '#64748b' }}>{l.id}</span>
                                            </div>

                                            <div style={{ position: 'absolute', top: '95px', width: '120px', textAlign: 'center', color: isUnlocked ? '#cbd5e1' : '#475569', fontSize: '12px', fontWeight: 'bold' }}>
                                                {l.title}
                                                {/* Randarea Steluțelor sub nivel */}
                                                {isCompleted && (
                                                    <div style={{ marginTop: '5px', fontSize: '14px', letterSpacing: '2px' }}>
                                                        {Array(3).fill(0).map((_, i) => (
                                                            <span key={i} style={{ color: i < stars ? '#facc15' : '#475569' }}>★</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {index < levels.length - 1 && (
                                            <div style={{
                                                width: '80px', height: '8px',
                                                background: isCompleted ? '#10b981' : '#1e293b',
                                                boxShadow: isCompleted ? '0 0 15px #10b981' : 'none',
                                                transition: 'all 0.3s', marginTop: '-30px'
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <GameBoard levelData={selectedLevel} onComplete={handleLevelComplete} />
                )}
            </main>
        </div>
    );
}

export default App;