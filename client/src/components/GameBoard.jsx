import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SwitchNode from './Nodes/SwitchNode';
import GateNode from './Nodes/GateNode';
import BulbNode from './Nodes/BulbNode';

const nodeTypes = { switch: SwitchNode, gate: GateNode, bulb: BulbNode };

const GameBoard = ({ levelData, onComplete }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [hasWon, setHasWon] = useState(false);

    // Inițializarea nivelului
    useEffect(() => {
        setHasWon(false);
        setEdges([]);
        const initialNodes = [];

        levelData.setup.switches.forEach((s) => {
            initialNodes.push({
                id: s.id, type: 'switch', position: { x: s.x, y: s.y },
                data: { label: s.label, value: false, onChange: (id, val) => updateNodeValue(id, val) },
            });
        });

        levelData.setup.gates.forEach((g) => {
            initialNodes.push({ id: g.id, type: 'gate', position: { x: g.x, y: g.y }, data: { label: g.type, value: false } });
        });

        initialNodes.push({
            id: levelData.setup.target.id, type: 'bulb', position: { x: levelData.setup.target.x, y: levelData.setup.target.y },
            data: { label: 'Bulb', value: false },
        });

        setNodes(initialNodes);
    }, [levelData]);

    const updateNodeValue = (id, newValue) => {
        setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, value: newValue } } : node));
    };

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);

    // Motorul de simulare a circuitului
    useEffect(() => {
        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];
        let changed = false;

        // 1. Evaluăm fiecare nod de tip poartă sau bec
        updatedNodes = updatedNodes.map(node => {
            if (node.type === 'switch') return node;

            const incomingEdges = updatedEdges.filter(e => e.target === node.id);
            const inputValues = incomingEdges.map(edge => {
                const sourceNode = updatedNodes.find(n => n.id === edge.source);
                return sourceNode?.data?.value || false;
            });

            let newValue = false;

            if (node.type === 'gate') {
                const valA = inputValues[0] || false;
                const valB = inputValues[1] || false;

                switch (node.data.label) {
                    case 'AND': newValue = valA && valB; break;
                    case 'OR':  newValue = valA || valB; break;
                    case 'NOT': newValue = !valA; break;
                    case 'XOR': newValue = valA !== valB; break;
                    default: newValue = false;
                }
            } else if (node.type === 'bulb') {
                newValue = inputValues[0] || false;
            }

            if (node.data.value !== newValue) {
                changed = true;
                return { ...node, data: { ...node.data, value: newValue } };
            }
            return node;
        });

        // 2. Colorăm firele în funcție de starea lor (1 = Verde, 0 = Roșu)
        updatedEdges = updatedEdges.map(edge => {
            const sourceNode = updatedNodes.find(n => n.id === edge.source);
            const isActive = sourceNode?.data?.value === true;
            const currentClass = edge.className;
            const newClass = isActive ? 'active-edge' : 'inactive-edge';

            if (currentClass !== newClass) {
                changed = true;
                return { ...edge, className: newClass };
            }
            return edge;
        });

        if (changed) {
            setNodes(updatedNodes);
            setEdges(updatedEdges);
        }

        // 3. Verificăm victoria
        const bulbNode = updatedNodes.find(n => n.type === 'bulb');
        if (bulbNode?.data?.value === true && !hasWon) {
            setHasWon(true);
            setTimeout(onComplete, 500);
        }
    }, [nodes, edges, hasWon, onComplete]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 41, 59, 0.9)', padding: '15px 30px', borderRadius: '10px', zIndex: 10, border: '1px solid #475569', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc' }}>{levelData.title}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{levelData.description}</p>
            </div>

            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
                <Background color="#334155" variant="dots" gap={20} size={2} />
                <Controls style={{ background: '#1e293b', fill: '#fff' }} />
            </ReactFlow>
        </div>
    );
};

export default GameBoard;