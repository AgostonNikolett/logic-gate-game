import React from 'react';

const TheoryGuide = ({ onClose }) => {
    const gates = [
        { name: 'NOT (NU)', icon: '!', desc: 'Inversează semnalul. Dacă intră 1, iese 0. Dacă intră 0, iese 1.', color: '#facc15' },
        { name: 'AND (ȘI)', icon: '&', desc: 'Înmulțire logică. Ieșirea este 1 DOAR dacă TOATE intrările sunt 1.', color: '#3b82f6' },
        { name: 'OR (SAU)', icon: '||', desc: 'Adunare logică. Ieșirea este 1 dacă CEL PUȚIN O intrare este 1.', color: '#10b981' },
        { name: 'XOR (SAU-Exclusiv)', icon: '=1', desc: 'Ieșirea este 1 doar dacă intrările sunt DIFERITE (ex: 1 și 0).', color: '#8b5cf6' },
        { name: 'NAND (ȘI-NU)', icon: '&-○', desc: 'Inversul lui AND. Ieșirea este 0 DOAR dacă toate intrările sunt 1. În rest e 1.', color: '#ef4444' },
        { name: 'NOR (SAU-NU)', icon: '≥1-○', desc: 'Inversul lui OR. Ieșirea este 1 DOAR dacă toate intrările sunt 0.', color: '#f97316' },
        { name: 'XNOR (Egalitate)', icon: '=1-○', desc: 'Inversul lui XOR. Ieșirea este 1 doar dacă intrările sunt EGALE (1-1 sau 0-0).', color: '#d946ef' }
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#1e293b', width: '800px', maxWidth: '90%', borderRadius: '15px', border: '2px solid #3b82f6', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                {/* Header-ul Manualului */}
                <div style={{ background: '#0f172a', padding: '20px 30px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>📖</span> Manualul Inginerului
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '24px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                        ✖
                    </button>
                </div>

                {/* Conținutul (Scrollabil) */}
                <div style={{ padding: '30px', overflowY: 'auto', display: 'grid', gap: '15px' }}>
                    <p style={{ color: '#cbd5e1', margin: '0 0 10px 0', fontSize: '15px' }}>
                        Aici găsești cum funcționează fiecare componentă din joc. Reține: <strong style={{color: '#10b981'}}>1 = ON (Curent)</strong>, iar <strong style={{color: '#ef4444'}}>0 = OFF (Oprit)</strong>.
                    </p>

                    {gates.map((gate, idx) => (
                        <div key={idx} style={{ display: 'flex', background: '#0f172a', borderRadius: '10px', borderLeft: `5px solid ${gate.color}`, padding: '15px', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: gate.color, fontSize: '20px', fontWeight: 'bold', flexShrink: 0 }}>
                                {gate.icon}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '18px' }}>{gate.name}</h3>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{gate.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TheoryGuide;