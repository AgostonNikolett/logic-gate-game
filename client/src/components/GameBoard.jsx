import {
    ReactFlow,
    Background,
    Controls,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { seCallback, useState, useEffect } from 'react';

// Importam componentele noastre personalizate
import SwitchNode from './Nodes/SwitchNode';
import GateNode from './Nodes/GateNode';
import BulbNode from './Nodes/BulbNode';

// Definim harta dintre TIPUL nodului din JSON si COMPONENTA React
const nodeTypes = {
    switch: SwitchNode,
    gate: GateNode,
    bulb: BulbNode,
};

const GameBoard = ({ levelData }) => {
    // Folosim state pentru noduri, pentru ca se vor schimba (starea ON/OFF)
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]); // Edges goale momentan

    // Funcție pentru mișcarea nodurilor
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Funcție pentru ștergerea firelor
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // Funcție pentru crearea unei conexiuni noi
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    // Functie pentru a gestiona schimbarea unui switch
    const handleSwitchChange = (id, newValue) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    // Actualizam valoarea switch-ului
                    return { ...node, data: { ...node.data, value: newValue } };
                }
                return node;
            })
        );
        // AICI va veni logica de calcul in pasul urmator!
        console.log(`Switch ${id} changed to ${newValue}`);
    };

    // Transformăm datele din backend (setup) în NODURI custom
    useEffect(() => {
        const initialNodes = [];

        // Adăugăm switch-urile
        levelData.setup.switches.forEach((s) => {
            initialNodes.push({
                id: s.id,
                type: 'switch', // Numele cheii din nodeTypes
                data: { label: s.label, onSwitchChange: handleSwitchChange, value: false },
                position: { x: s.x, y: s.y },
            });
        });

        // Adăugăm porțile
        levelData.setup.gates.forEach((g) => {
            initialNodes.push({
                id: g.id,
                type: 'gate',
                data: { label: g.type },
                position: { x: g.x, y: g.y },
            });
        });

        // Adăugăm becul (target)
        initialNodes.push({
            id: levelData.setup.target.id,
            type: 'bulb',
            data: { label: 'Bulb', value: false },
            position: { x: levelData.setup.target.x, y: levelData.setup.target.y },
        });

        setNodes(initialNodes);
    }, [levelData]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes} // Pasam harta de Custom Nodes
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default GameBoard;