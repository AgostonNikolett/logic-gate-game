import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';

function App() {
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);

    // Stocăm nivelul maxim deblocat. Implicit este 1.
    const [unlockedLevel, setUnlockedLevel] = useState(1);

    useEffect(() => {
        // 1. Încărcăm progresul salvat din browser (dacă există)
        const savedProgress = localStorage.getItem('logicGateProgress');
        if (savedProgress) {
            setUnlockedLevel(parseInt(savedProgress));
        }

        // 2. Încărcăm nivelurile de la backend
        fetch('http://localhost:5000/api/levels')
            .then(res => res.json())
            .then(data => setLevels(data))
            .catch(err => console.error("API Offline", err));
    }, []);

    const loadLevel = (level) => {
        // Permitem accesul doar dacă nivelul este deblocat
        if (level.id <= unlockedLevel) {
            fetch(`http://localhost:5000/api/levels/${level.id}`)
                .then(res => res.json())
                .then(data => setSelectedLevel(data));
        }
    };

    const handleLevelComplete = () => {
        alert('Nivel Completat! Circuitul este funcțional. 🎉');

        // Dacă am completat cel mai mare nivel deblocat curent, deblocăm următorul
        if (selectedLevel.id === unlockedLevel) {
            const nextLevel = unlockedLevel + 1;
            setUnlockedLevel(nextLevel);
            localStorage.setItem('logicGateProgress', nextLevel); // Salvăm noul progres
        }

        setSelectedLevel(null); // Ne întoarcem la harta nivelurilor
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

                        {/* CONTAINERUL PENTRU ROADMAP */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            overflowX: 'auto', // Permite scroll orizontal dacă sunt prea multe niveluri
                            paddingBottom: '50px',
                            paddingTop: '20px'
                        }}>
                            {levels.map((l, index) => {
                                const isUnlocked = l.id <= unlockedLevel;
                                const isCompleted = l.id < unlockedLevel;

                                return (
                                    <div key={l.id} style={{ display: 'flex', alignItems: 'center' }}>

                                        {/* NODUL NIVELULUI */}
                                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div
                                                onClick={() => isUnlocked && loadLevel(l)}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    // Logica culorilor: Verde (Terminat), Albastru (Curent), Gri (Blocat)
                                                    background: isCompleted ? '#059669' : isUnlocked ? '#2563eb' : '#1e293b',
                                                    border: `4px solid ${isUnlocked ? '#f8fafc' : '#334155'}`,
                                                    boxShadow: isUnlocked ? `0 0 25px ${isCompleted ? '#10b981' : '#3b82f6'}` : 'none',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                                    flexShrink: 0,
                                                    transition: 'all 0.3s ease-in-out',
                                                    opacity: isUnlocked ? 1 : 0.4
                                                }}
                                                // Efect simplu de hover pentru nivelurile deblocate
                                                onMouseEnter={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: isUnlocked ? '#fff' : '#64748b' }}>
                          {l.id}
                        </span>
                                            </div>

                                            {/* TEXTUL DE SUB NOD */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '95px',
                                                width: '120px',
                                                textAlign: 'center',
                                                color: isUnlocked ? '#cbd5e1' : '#475569',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {l.title}
                                            </div>
                                        </div>

                                        {/* FIRUL DE CONEXIUNE CĂTRE URMĂTORUL NIVEL */}
                                        {index < levels.length - 1 && (
                                            <div style={{
                                                width: '80px',
                                                height: '8px',
                                                // Firul se aprinde doar dacă nivelul de la care pleacă a fost completat
                                                background: isCompleted ? '#10b981' : '#1e293b',
                                                boxShadow: isCompleted ? '0 0 15px #10b981' : 'none',
                                                transition: 'all 0.3s',
                                                marginTop: '-30px' // Aliniază firul la centrul cercului
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