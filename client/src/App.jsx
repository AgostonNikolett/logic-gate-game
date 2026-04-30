import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import TheoryGuide from './components/TheoryGuide';

const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
        chunked.push(arr.slice(i, i + size));
    }
    return chunked;
};

const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bună dimineața";
    if (hour >= 12 && hour < 18) return "Salutare";
    if (hour >= 18 && hour < 23) return "Seara bună";
    return "Tura de noapte, eh";
};

function App() {
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const [progress, setProgress] = useState({
        unlockedLevel: 1,
        levelStars: {},
        profile: null
    });

    // Stări pentru Prologul Practic
    const [onboardStep, setOnboardStep] = useState(0);
    const [swA, setSwA] = useState(false);
    const [swB, setSwB] = useState(false);
    const [bulbGlow, setBulbGlow] = useState(false);

    const timeGreeting = getTimeContext();

    useEffect(() => {
        const savedProgress = localStorage.getItem('logicGateProgressData');
        if (savedProgress) setProgress(JSON.parse(savedProgress));

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
            const nextLevel = selectedLevel.id === prev.unlockedLevel ? prev.unlockedLevel + 1 : prev.unlockedLevel;
            const currentBest = prev.levelStars[selectedLevel.id] || 0;
            const newBest = Math.max(currentBest, earnedStars);

            const newData = { ...prev, unlockedLevel: nextLevel, levelStars: { ...prev.levelStars, [selectedLevel.id]: newBest } };
            localStorage.setItem('logicGateProgressData', JSON.stringify(newData));
            return newData;
        });
        setSelectedLevel(null);
    };

    // Salvează profilul și pornește jocul
    const finishCalibration = (levelToUnlock, profileName) => {
        setProgress(prev => {
            const newData = { ...prev, unlockedLevel: levelToUnlock, profile: profileName };
            localStorage.setItem('logicGateProgressData', JSON.stringify(newData));
            return newData;
        });
    };

    // Verificarea în timp real a mini-jocului din Prolog
    useEffect(() => {
        if (progress.profile !== null) return;

        let isCorrect = false;

        // Logica pentru Step 1: Poarta AND
        if (onboardStep === 1) {
            isCorrect = swA && swB;
        }
        // Logica pentru Step 2: Poarta XOR
        else if (onboardStep === 2) {
            isCorrect = swA !== swB;
        }

        if (isCorrect) {
            setBulbGlow(true);
            setTimeout(() => {
                setBulbGlow(false);
                setSwA(false);
                setSwB(false);

                if (onboardStep === 1) setOnboardStep(2); // Trece la puzzle-ul 2
                else if (onboardStep === 2) finishCalibration(9, 'Tehnician'); // Terminare glorioasă

            }, 1500); // Așteaptă 1.5s să savureze jucătorul becul aprins
        } else {
            setBulbGlow(false);
        }
    }, [swA, swB, onboardStep, progress.profile]);

    const ITEMS_PER_ROW = 5;
    const levelRows = chunkArray(levels, ITEMS_PER_ROW);

    const totalStars = Object.values(progress.levelStars).reduce((sum, stars) => sum + stars, 0);
    const totalXP = totalStars * 50;

    let badgeTitle = progress.profile || "Ucenic";
    let badgeColor = "#94a3b8";
    if (totalXP >= 500) { badgeTitle = "Tehnician"; badgeColor = "#3b82f6"; }
    if (totalXP >= 1500) { badgeTitle = "Inginer Logic"; badgeColor = "#10b981"; }
    if (totalXP >= 3000) { badgeTitle = "Master Arhitect"; badgeColor = "#facc15"; }

    // =========================================================
    // PROLOG INTERACTIV (FĂRĂ CUVÂNTUL "TEST", DOAR JOACĂ)
    // =========================================================
    if (progress.profile === null) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617', backgroundImage: 'radial-gradient(circle, #1e293b 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '40px', borderRadius: '20px', border: '2px solid #3b82f6', maxWidth: '650px', textAlign: 'center', boxShadow: '0 0 50px rgba(59, 130, 246, 0.3)' }}>

                    <div style={{ fontSize: '60px', marginBottom: '10px', animation: 'bounce 2s infinite' }}>🤖</div>

                    {onboardStep === 0 ? (
                        <div>
                            <h2 style={{ color: '#60a5fa', marginBottom: '15px', fontSize: '24px' }}>{timeGreeting}, inginerule!</h2>
                            <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '35px', lineHeight: '1.6' }}>
                                Eu sunt Spark, sistemul bazei. Avem o mică pană de curent. Știi cum funcționează porțile logice ca să mă ajuți să le reconectăm acum, sau vrei să o luăm de la zero cu un tutorial?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button
                                    onClick={() => setOnboardStep(1)}
                                    style={{ padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
                                    🔧 Știu cum funcționează! Dă-mi acces la panou!
                                </button>
                                <button
                                    onClick={() => finishCalibration(1, 'Începător')}
                                    style={{ padding: '15px', background: 'transparent', border: '2px dashed #64748b', borderRadius: '10px', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
                                    onMouseEnter={e => e.target.style.color = '#cbd5e1'}
                                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                >
                                    📖 Sunt la început. Arată-mi cum funcționează.
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ color: '#facc15', marginBottom: '10px', fontSize: '20px' }}>Diagnosticare Sistem...</h3>
                            <p style={{ color: '#f8fafc', fontSize: '16px', marginBottom: '30px', minHeight: '50px' }}>
                                {onboardStep === 1
                                    ? "Generatorul are o siguranță de tip ȘI (AND). Apasă pe comutatoare pentru a aprinde becul!"
                                    : "Super! Acum panoul de filtrare are o poartă SAU-Exclusiv (XOR). Găsește combinația corectă!"}
                            </p>

                            {/* PANOU INTERACTIV MINI-JOC */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', background: '#0f172a', padding: '30px', borderRadius: '15px', border: '1px solid #334155' }}>

                                {/* Comutatoare */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <button
                                        onClick={() => setSwA(!swA)}
                                        style={{ width: '80px', height: '40px', borderRadius: '20px', background: swA ? '#10b981' : '#ef4444', border: 'none', cursor: 'pointer', boxShadow: swA ? '0 0 15px #10b981' : 'none', color: 'white', fontWeight: 'bold' }}>
                                        {swA ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setSwB(!swB)}
                                        style={{ width: '80px', height: '40px', borderRadius: '20px', background: swB ? '#10b981' : '#ef4444', border: 'none', cursor: 'pointer', boxShadow: swB ? '0 0 15px #10b981' : 'none', color: 'white', fontWeight: 'bold' }}>
                                        {swB ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                {/* Săgeți Vizuale */}
                                <div style={{ color: '#475569', fontSize: '30px' }}>➔</div>

                                {/* Becul */}
                                <div style={{ fontSize: '60px', filter: bulbGlow ? 'drop-shadow(0 0 30px #facc15)' : 'brightness(0.3)', transition: 'all 0.3s' }}>
                                    {bulbGlow ? '💡' : '💡'}
                                </div>

                            </div>

                            {/* Opțiunea de Ieșire Rapidă în caz că se blochează */}
                            <button
                                onClick={() => finishCalibration(onboardStep === 1 ? 1 : 5, 'Ucenic')}
                                style={{ marginTop: '25px', padding: '10px 20px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                M-am blocat. Du-mă la harta principală.
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    // JOCUL PROPRIU-ZIS (HARTA ȘI NIVELELE RĂMÂN IDENTICE)
    // =========================================================
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#020617' }}>
            <header style={{ padding: '15px 30px', background: '#1e293b', borderBottom: '2px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, color: '#60a5fa', textShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}>⚡ LogicGate Academy</h1>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{timeGreeting} | Jucător: {progress.profile}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #475569', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.target.style.background = '#334155'; e.target.style.color = '#fff'; }}
                        onMouseLeave={e => { e.target.style.background = '#0f172a'; e.target.style.color = '#cbd5e1'; }}
                    >
                        <span>💡</span> Teorie & Ajutor
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#0f172a', padding: '8px 20px', borderRadius: '30px', border: `1px solid ${badgeColor}`, boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px ${badgeColor}40` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                            <span style={{ color: badgeColor, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Rang: {badgeTitle}</span>
                            <span style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '900' }}>{totalXP} XP</span>
                        </div>
                        <span style={{ color: badgeColor, fontSize: '28px', filter: `drop-shadow(0 0 5px ${badgeColor})` }}>🛡️</span>
                    </div>

                    {selectedLevel && (
                        <button onClick={() => setSelectedLevel(null)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ⬅ Abandon
                        </button>
                    )}
                </div>
            </header>

            {isHelpOpen && <TheoryGuide onClose={() => setIsHelpOpen(false)} />}

            <main style={{ flexGrow: 1, position: 'relative', overflowY: 'auto', overflowX: 'hidden', backgroundImage: 'radial-gradient(circle, #1e293b 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                {!selectedLevel ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px 100px 40px', minHeight: '100%' }}>
                        <h2 style={{ textAlign: 'center', color: '#e2e8f0', marginBottom: '80px', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Harta Sistemului</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {levelRows.map((row, rowIndex) => {
                                const isLTR = rowIndex % 2 === 0;
                                const isLastRow = rowIndex === levelRows.length - 1;

                                return (
                                    <div key={rowIndex} style={{ display: 'flex', flexDirection: isLTR ? 'row' : 'row-reverse', position: 'relative', marginBottom: isLastRow ? '0' : '150px', width: '720px', justifyContent: 'flex-start' }}>
                                        {row.map((l, itemIndex) => {
                                            const isUnlocked = l.id <= progress.unlockedLevel;
                                            const isCompleted = l.id < progress.unlockedLevel || progress.levelStars[l.id] !== undefined;
                                            const stars = progress.levelStars[l.id] || 0;
                                            const isLastInRow = itemIndex === row.length - 1;

                                            return (
                                                <div key={l.id} style={{ display: 'flex', alignItems: 'center', flexDirection: isLTR ? 'row' : 'row-reverse' }}>
                                                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', height: '80px' }}>
                                                        <div onClick={() => isUnlocked && loadLevel(l)} style={{ width: '80px', height: '80px', borderRadius: '50%', background: isCompleted ? '#059669' : isUnlocked ? '#2563eb' : '#1e293b', border: `4px solid ${isUnlocked ? '#f8fafc' : '#334155'}`, boxShadow: isUnlocked ? `0 0 25px ${isCompleted ? '#10b981' : '#3b82f6'}` : 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: isUnlocked ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.3s ease-in-out', opacity: isUnlocked ? 1 : 0.4, zIndex: 2 }}>
                                                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: isUnlocked ? '#fff' : '#64748b' }}>{l.id}</span>
                                                        </div>
                                                        <div style={{ position: 'absolute', top: '95px', width: '140px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: isUnlocked ? '#cbd5e1' : '#475569', fontSize: '13px', fontWeight: 'bold', zIndex: 2 }}>
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
                                                    {!isLastInRow && (
                                                        <div style={{ width: '80px', height: '8px', background: isCompleted ? '#10b981' : '#1e293b', boxShadow: isCompleted ? '0 0 12px #10b981, 0 0 4px #10b981' : 'none', transition: 'all 0.3s', zIndex: 1 }} />
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {!isLastRow && (() => {
                                            const lastItem = row[row.length - 1];
                                            const isRowCompleted = lastItem.id < progress.unlockedLevel || progress.levelStars[lastItem.id] !== undefined;
                                            const uTurnColor = isRowCompleted ? '#10b981' : '#1e293b';
                                            const glow = isRowCompleted ? 'drop-shadow(0 0 6px #10b981)' : 'none';

                                            return (
                                                <div style={{ position: 'absolute', top: '36px', [isLTR ? 'right' : 'left']: '-40px', width: '80px', height: '238px', boxSizing: 'border-box', borderTop: `8px solid ${uTurnColor}`, borderBottom: `8px solid ${uTurnColor}`, [isLTR ? 'borderRight' : 'borderLeft']: `8px solid ${uTurnColor}`, borderRadius: isLTR ? '0 60px 60px 0' : '60px 0 0 60px', filter: glow, transition: 'all 0.3s', zIndex: 0 }} />
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