import { Handle, Position } from '@xyflow/react';

const SwitchNode = ({ data }) => {
    return (
        <div style={{
            padding: '15px',
            borderRadius: '8px',
            background: '#1e293b',
            color: 'white',
            border: `2px solid ${data.initialValue ? '#10b981' : '#ef4444'}`,
            width: '110px',
            textAlign: 'center',
            boxShadow: data.value ? '0 0 20px #10b981' : 'none',
            transition: 'all 0.3s'
        }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#f8fafc' }}>
                Sursa {data.label}
            </div>

            {/* Eticheta care arată starea fixă a sursei */}
            <div style={{
                width: '100%',
                padding: '5px',
                background: data.initialValue ? '#059669' : '#9f1239',
                color: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '1px'
            }}>
                {data.initialValue ? 'ON' : 'OFF'}
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#f8fafc', width: '12px', height: '12px', right: '-6px' }} />
        </div>
    );
};

export default SwitchNode;