import { Handle, Position } from '@xyflow/react';

const BulbNode = ({ data }) => {
    return (
        <div style={{ borderRadius: '50%', background: data.value ? '#fef08a' : '#334155', border: `3px solid ${data.value ? '#eab308' : '#475569'}`, width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: data.value ? '0 0 40px #facc15' : 'inset 0 4px 6px rgba(0,0,0,0.6)', transition: 'all 0.3s' }}>
            <Handle type="target" position={Position.Left} style={{ background: '#f8fafc', width: '12px', height: '12px', left: '-6px' }} />
            {data.value ? '💡' : '🌑'}
        </div>
    );
};

export default BulbNode;