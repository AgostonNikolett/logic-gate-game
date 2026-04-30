import React from 'react';

const Avatar = ({ mood, title, message }) => {
    // Definim expresiile faciale și culorile în funcție de emoția avatarului
    const getAvatarProps = () => {
        switch(mood) {
            case 'happy':
                return { face: '🤩', color: '#10b981', glow: '0 0 20px rgba(16, 185, 129, 0.6)' };
            case 'sad':
                return { face: '🤔', color: '#f59e0b', glow: '0 0 20px rgba(245, 158, 11, 0.6)' };
            case 'alert':
                return { face: '😵', color: '#ef4444', glow: '0 0 20px rgba(239, 68, 68, 0.6)' };
            default:
                return { face: '🤖', color: '#3b82f6', glow: '0 0 15px rgba(59, 130, 246, 0.4)' };
        }
    };

    const { face, color, glow } = getAvatarProps();

    return (
        <div style={{
            position: 'absolute', top: 20, left: 20, zIndex: 50,
            display: 'flex', alignItems: 'flex-start', gap: '15px', maxWidth: '450px',
            animation: mood === 'alert' ? 'shake 0.4s' : 'none'
        }}>

            {/* Fața Avatarului (Aici poți pune o imagine reală mai târziu: <img src={spark_happy.png} />) */}
            <div style={{
                width: '70px', height: '70px', borderRadius: '50%', background: '#1e293b',
                border: `3px solid ${color}`, display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '40px', boxShadow: glow, transition: 'all 0.3s ease', flexShrink: 0
            }}>
                {face}
            </div>

            {/* Bula de dialog (Speech Bubble) */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.95)', border: `2px solid ${color}`, borderRadius: '15px',
                padding: '15px', position: 'relative', borderTopLeftRadius: 0,
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)', transition: 'border-color 0.3s'
            }}>
                {/* Numele Avatarului */}
                <h4 style={{ margin: '0 0 5px 0', color: color, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>
                    Spark, Inginerul Șef
                </h4>

                {/* Titlul Misiunii / Contextul */}
                <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '16px' }}>{title}</h3>

                {/* Textul Dinamic */}
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5' }}>
                    {message}
                </p>
            </div>

            {/* Un mic efect de animație pentru avertizări */}
            <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
};

export default Avatar;