import { Handle, Position } from '@xyflow/react';

const SwitchNode = ({ data, id }) => {
    // Functie pentru a trimite schimbarea de stare catre parinte (GameBoard)
    const onChange = (evt) => {
        if (data.onSwitchChange) {
            data.onSwitchChange(id, evt.target.checked);
        }
    };

    return (
        <div style={{
            padding: '10px',
            borderRadius: '5px',
            background: data.value ? '#a7f3d0' : '#fecaca', // Verde daca e ON, Rosu daca e OFF
            border: '1px solid #777',
            minWidth: '80px',
            textAlign: 'center'
        }}>
            <div style={{ fontWeight: 'bold' }}>{data.label}</div>
            <input
                type="checkbox"
                checked={data.value || false}
                onChange={onChange}
                style={{ cursor: 'pointer', marginTop: '5px' }}
            />
            {/* Handle de iesire (Source) la dreapta */}
            <Handle
                type="source"
                position={Position.Right}
                id="output"
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
        </div>
    );
};

export default SwitchNode;