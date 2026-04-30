import { Handle, Position } from '@xyflow/react';

const BulbNode = ({ data }) => {
    return (
        <div style={{
            padding: '15px',
            borderRadius: '50%', // Il facem rotund
            background: data.value ? '#fbbf24' : '#6b7280', // Galben daca e aprins, Gri daca e stins
            color: data.value ? '#000' : '#fff',
            border: '2px solid #333',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: data.value ? '0 0 15px #fbbf24' : 'none' // Efect de stralucire
        }}>
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            {data.value ? '💡' : '🌑'}
        </div>
    );
};

export default BulbNode;