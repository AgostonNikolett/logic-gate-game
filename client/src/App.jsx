import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';

function App() {
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);

    // 1. Fetch la lista de niveluri de la backend
    useEffect(() => {
        fetch('http://localhost:5000/api/levels')
            .then(res => res.json())
            .then(data => setLevels(data))
            .catch(err => console.error("Eroare la incarcarea nivelurilor:", err));
    }, []);

    // 2. Fetch la detaliile unui nivel cand este dat click
    const loadLevel = (id) => {
        fetch(`http://localhost:5000/api/levels/${id}`)
            .then(res => res.json())
            .then(data => setSelectedLevel(data))
            .catch(err => console.error("Eroare la incarcarea detaliilor:", err));
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '10px', background: '#222', color: '#fff' }}>
                <h1>LogicGate Academy ⚡</h1>
                {selectedLevel && <button onClick={() => setSelectedLevel(null)}>Back to Menu</button>}
            </header>

            <main style={{ flexGrow: 1, position: 'relative' }}>
                {!selectedLevel ? (
                    <div style={{ padding: '20px' }}>
                        <h2>Levels:</h2>
                        {levels.map(l => (
                            <button key={l.id} onClick={() => loadLevel(l.id)} style={{ margin: '10px', padding: '15px', cursor: 'pointer' }}>
                                {l.title}
                            </button>
                        ))}
                    </div>
                ) : (
                    <GameBoard levelData={selectedLevel} />
                )}
            </main>
        </div>
    );
}

export default App;