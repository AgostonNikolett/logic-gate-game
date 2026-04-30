import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import TheoryGuide from './components/TheoryGuide';

// Funcție ajutătoare pentru a sparge lista de niveluri în rânduri (ex: câte 5 per rând)
const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
        chunked.push(arr.slice(i, i + size));
    }
    return chunked;
};

function App() {
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Stocăm progresul complex: nivelul deblocat + stelele obținute per nivel
    const [progress, setProgress] = useState({
        unlockedLevel: 1,
        levelStars: {}
    });

    useEffect(() => {
        // Încărcăm progresul salvat
        const savedProgress = localStorage.getItem('logicGateProgressData');
        if (savedProgress) setProgress(JSON.parse(savedProgress));

        // Încărcăm harta nivelurilor din backend
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

    const handleLevelComplete = (earnedStars) => {
        setProgress(prev => {
            // Deblocăm următorul nivel doar dacă jucătorul tocmai l-a trecut pe cel mai avansat
            const nextLevel = selectedLevel.id === prev.unlockedLevel ? prev.unlockedLevel + 1 : prev.unlockedLevel;

            // Păstrăm mereu scorul cel mai bun (dacă rejoci și iei mai puțin, rămâne cel vechi)
            const currentBest = prev.levelStars[selectedLevel.id] || 0;
            const newBest = Math.max(currentBest, earnedStars);

            const newData = { unlockedLevel: nextLevel, levelStars: { ...prev.levelStars, [selectedLevel.id]: newBest } };
            localStorage.setItem('logicGateProgressData', JSON.stringify(newData));
            return newData;
        });
        setSelectedLevel(null);
    };

    // Setări Harta Șerpuită
    const ITEMS_PER_ROW = 5;
    const levelRows = chunkArray(levels, ITEMS_PER_ROW);

    // LOGICĂ DE RECOMPENSE (XP și INSIGNE)
    const totalStars = Object.values(progress.levelStars).reduce((sum, stars) => sum + stars, 0);
    const totalXP = totalStars * 50; // 50 XP per stea

    // Acordăm Badges în funcție de performanță
    let badgeTitle = "Ucenic";
    let badgeColor = "#94a3b8"; // Gri
    if (totalXP >= 500) { badgeTitle = "Tehnician"; badgeColor = "#3b82f6"; } // Albastru
    if (totalXP >= 1500) { badgeTitle = "Inginer Logic"; badgeColor = "#10b981"; } // Verde
    if (totalXP >= 3000) { badgeTitle = "Master Arhitect"; badgeColor = "#facc15"; } // Auriu

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#020617' }}>

            {/* HEADER CU SISTEM DE XP */}
            <header style={{ padding: '15px 30px', background: '#1e293b', borderBottom: '2px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <h1 style={{ margin: 0, color: '#60a5fa', textShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}>⚡ LogicGate Academy</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                    {/* BUTONUL DE AJUTOR (NOU) */}
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #475569', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.target.style.background = '#334155'; e.target.style.color = '#fff'; }}
                        onMouseLeave={e => { e.target.style.background = '#0f172a'; e.target.style.color = '#cbd5e1'; }}
                    >
                        <span>💡</span> Teorie & Ajutor
                    </button>

                    {/* BADGE RANK & XP */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#0f172a', padding: '8px 20px', borderRadius: '30px', border: `1px solid ${badgeColor}`, boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px ${badgeColor}40` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                            <span style={{ color: badgeColor, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Rang: {badgeTitle}</span>
                            <span style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '900' }}>{totalXP} XP</span>
                        </div>
                        <span style={{ color: badgeColor, fontSize: '28px', filter: `drop-shadow(0 0 5px ${badgeColor})` }}>🛡️</span>
                    </div>

                    {selectedLevel && (
                        <button onClick={() => setSelectedLevel(null)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#2563eb'} onMouseLeave={e => e.target.style.background = '#3b82f6'}>
                            ⬅ Abandon
                        </button>
                    )}
                </div>
            </header>

            {/* Afișarea Manualului de Teorie (Suprapus) */}
            {isHelpOpen && <TheoryGuide onClose={() => setIsHelpOpen(false)} />}

            <main style={{
                flexGrow: 1,
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundImage: 'radial-gradient(circle, #1e293b 2px, transparent 2px)',
                backgroundSize: '30px 30px'
            }}>

                {!selectedLevel ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px 100px 40px', minHeight: '100%' }}>
                        <h2 style={{ textAlign: 'center', color: '#e2e8f0', marginBottom: '80px', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                            Harta Sistemului
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {levelRows.map((row, rowIndex) => {
                                const isLTR = rowIndex % 2 === 0; // Rândurile pare merg de la Stânga la Dreapta
                                const isLastRow = rowIndex === levelRows.length - 1;

                                return (
                                    <div key={rowIndex} style={{
                                        display: 'flex',
                                        flexDirection: isLTR ? 'row' : 'row-reverse',
                                        position: 'relative',
                                        marginBottom: isLastRow ? '0' : '150px', // Spațiu generos între rânduri
                                        width: '720px', // Lățimea fixă pentru 5 noduri + firele dintre ele
                                        justifyContent: 'flex-start'
                                    }}>

                                        {row.map((l, itemIndex) => {
                                            const isUnlocked = l.id <= progress.unlockedLevel;
                                            const isCompleted = l.id < progress.unlockedLevel || progress.levelStars[l.id] !== undefined;
                                            const stars = progress.levelStars[l.id] || 0;
                                            const isLastInRow = itemIndex === row.length - 1;

                                            return (
                                                <div key={l.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: isLTR ? 'row' : 'row-reverse'
                                                }}>

                                                    {/* NODUL CERC */}
                                                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', height: '80px' }}>
                                                        <div
                                                            onClick={() => isUnlocked && loadLevel(l)}
                                                            style={{
                                                                width: '80px', height: '80px', borderRadius: '50%',
                                                                background: isCompleted ? '#059669' : isUnlocked ? '#2563eb' : '#1e293b',
                                                                border: `4px solid ${isUnlocked ? '#f8fafc' : '#334155'}`,
                                                                boxShadow: isUnlocked ? `0 0 25px ${isCompleted ? '#10b981' : '#3b82f6'}` : 'none',
                                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                                cursor: isUnlocked ? 'pointer' : 'not-allowed', flexShrink: 0,
                                                                transition: 'all 0.3s ease-in-out', opacity: isUnlocked ? 1 : 0.4,
                                                                zIndex: 2
                                                            }}
                                                            onMouseEnter={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                            onMouseLeave={(e) => { if(isUnlocked) e.currentTarget.style.transform = 'scale(1)'; }}
                                                        >
                                                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: isUnlocked ? '#fff' : '#64748b' }}>{l.id}</span>
                                                        </div>

                                                        {/* TEXT + STELUȚE (poziționate absolut dedesubt) */}
                                                        <div style={{
                                                            position: 'absolute', top: '95px',
                                                            width: '140px', left: '50%', transform: 'translateX(-50%)',
                                                            textAlign: 'center', color: isUnlocked ? '#cbd5e1' : '#475569',
                                                            fontSize: '13px', fontWeight: 'bold', zIndex: 2
                                                        }}>
                                                            {l.title}
                                                            {isCompleted && (
                                                                <div style={{ marginTop: '5px', fontSize: '16px', letterSpacing: '2px', filter: 'drop-shadow(0 0 5px rgba(250, 204, 21, 0.5))' }}>
                                                                    {Array(3).fill(0).map((_, i) => (
                                                                        <span key={i} style={{ color: i < stars ? '#facc15' : '#475569' }}>★</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* FIRUL ORIZONTAL */}
                                                    {!isLastInRow && (
                                                        <div style={{
                                                            width: '80px', height: '8px',
                                                            background: isCompleted ? '#10b981' : '#1e293b',
                                                            boxShadow: isCompleted ? '0 0 12px #10b981, 0 0 4px #10b981' : 'none',
                                                            transition: 'all 0.3s',
                                                            zIndex: 1
                                                        }} />
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* CURBA (U-TURN) DE LA MARGINI */}
                                        {!isLastRow && (() => {
                                            const lastItem = row[row.length - 1];
                                            const isRowCompleted = lastItem.id < progress.unlockedLevel || progress.levelStars[lastItem.id] !== undefined;
                                            const uTurnColor = isRowCompleted ? '#10b981' : '#1e293b';
                                            const glow = isRowCompleted ? 'drop-shadow(0 0 6px #10b981)' : 'none';

                                            return (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '36px',
                                                    [isLTR ? 'right' : 'left']: '-40px', // Iese cu 40px pentru a ocoli textul
                                                    width: '80px',
                                                    height: '238px', // Spațierea matematică calculată fix între centrele rândurilor
                                                    boxSizing: 'border-box',
                                                    borderTop: `8px solid ${uTurnColor}`,
                                                    borderBottom: `8px solid ${uTurnColor}`,
                                                    [isLTR ? 'borderRight' : 'borderLeft']: `8px solid ${uTurnColor}`,
                                                    borderRadius: isLTR ? '0 60px 60px 0' : '60px 0 0 60px',
                                                    filter: glow,
                                                    transition: 'all 0.3s',
                                                    zIndex: 0
                                                }} />
                                            );
                                        })()}
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