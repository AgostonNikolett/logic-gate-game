import { Handle, Position } from '@xyflow/react';

const SwitchNode = ({ data, id }) => {
    return (
        <div style={{ padding: '15px', borderRadius: '8px', background: data.value ? '#059669' : '#9f1239', color: 'white', border: '2px solid #cbd5e1', width: '100px', textAlign: 'center', boxShadow: data.value ? '0 0 20px #10b981' : 'none', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{data.label}</div>
            <button
                onClick={() => data.onChange(id, !data.value)}
                style={{ width: '100%', padding: '8px', cursor: 'pointer', background: '#f8fafc', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                {data.value ? 'ON' : 'OFF'}
            </button>
            <Handle type="source" position={Position.Right} style={{ background: '#f8fafc', width: '12px', height: '12px', right: '-6px' }} />
        </div>
    );
};

export default SwitchNode;