import { Handle, Position } from '@xyflow/react';

// Stiluri simple pentru Handles
const handleStyle = { background: '#555', width: '8px', height: '8px' };

const GateNode = ({ data }) => {
    const isUnary = data.label === 'NOT'; // NOT are o singura intrare

    return (
        <div style={{
            padding: '10px',
            borderRadius: '5px',
            background: '#e0f2fe', // Albastru deschis
            border: '1px solid #0369a1',
            minWidth: '100px',
            textAlign: 'center',
            fontFamily: 'monospace'
        }}>
            {/* Intrarile (Targets) la stanga */}
            {isUnary ? (
                // O singura intrare pe centru pentru NOT
                <Handle type="target" position={Position.Left} id="a" style={handleStyle} />
            ) : (
                // Doua intrari pentru restul (a si b)
                <>
                    <Handle type="target" position={Position.Left} id="a" style={{ ...handleStyle, top: '30%' }} />
                    <Handle type="target" position={Position.Left} id="b" style={{ ...handleStyle, top: '70%' }} />
                </>
            )}

            {/* Simbolul porții */}
            <div style={{ fontWeight: 'bold', fontSize: '18px', padding: '10px 0' }}>
                {data.label}
            </div>

            {/* Iesirea (Source) la dreapta */}
            <Handle type="source" position={Position.Right} id="output" style={handleStyle} />
        </div>
    );
};

export default GateNode;