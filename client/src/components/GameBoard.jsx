import { useState, useEffect, useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SwitchNode from './Nodes/SwitchNode';
import GateNode from './Nodes/GateNode';
import BulbNode from './Nodes/BulbNode';

const nodeTypes = { switch: SwitchNode, gate: GateNode, bulb: BulbNode };

// Componenta internă care conține logica (trebuie să fie în interiorul Provider-ului)
const GameBoardContent = ({ levelData, onComplete }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [warningMessage, setWarningMessage] = useState(null);
    const [isPowerOn, setIsPowerOn] = useState(false);

    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow(); // Folosit pentru Drag & Drop

    // Inițializare Nivel
    useEffect(() => {
        setHasWon(false);
        setIsPowerOn(false);
        setEdges([]);
        setWarningMessage(null);
        const initialNodes = [];

        levelData.setup.switches.forEach((s) => {
            initialNodes.push({
                id: s.id, type: 'switch', position: { x: s.x, y: s.y },
                data: { label: s.label, initialValue: s.value !== undefined ? s.value : true, value: false },
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

    // Funcții Drag & Drop din Sidebar
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (typeof type === 'undefined' || !type) return;

        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

        const newNode = {
            id: `gate_${Date.now()}`,
            type: 'gate',
            position,
            data: { label: type, value: false },
        };

        setNodes((nds) => nds.concat(newNode));
        setIsPowerOn(false); // Oprim curentul dacă adăugăm o piesă
    }, [screenToFlowPosition]);

    // Handlere React Flow
    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
        setIsPowerOn(false);
    }, []);
    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        setIsPowerOn(false);
    }, []);

    // Reguli stricte de conectare
    const isValidConnection = useCallback((connection) => {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return false;
        if (sourceNode.id === targetNode.id) return false;

        // Regula universală: Fără direct Switch -> Bulb
        if (sourceNode.type === 'switch' && targetNode.type === 'bulb') {
            showWarning("Strict: Trece semnalul prin porți!");
            return false;
        }
        return true;
    }, [nodes]);

    const showWarning = (msg) => {
        setWarningMessage(msg);
        setTimeout(() => setWarningMessage(null), 3500);
    };

    // Simulare și Verificare Victorie
    useEffect(() => {
        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];
        let changed = false;

        // 1. Calcul Curent
        updatedNodes = updatedNodes.map(node => {
            if (node.type === 'switch') {
                const expectedVal = isPowerOn ? node.data.initialValue : false;
                if (node.data.value !== expectedVal) {
                    changed = true;
                    return { ...node, data: { ...node.data, value: expectedVal } };
                }
                return node;
            }

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
                    case 'NAND': newValue = !(valA && valB); break;
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

        updatedEdges = updatedEdges.map(edge => {
            const sourceNode = updatedNodes.find(n => n.id === edge.source);
            const isActive = sourceNode?.data?.value === true;
            const newClass = isActive ? 'active-edge' : 'inactive-edge';
            if (edge.className !== newClass) {
                changed = true;
                return { ...edge, className: newClass };
            }
            return edge;
        });

        if (changed) {
            setNodes(updatedNodes);
            setEdges(updatedEdges);
        }

        // 2. LOGICA DE VICTORIE PER TIPOLOGIE
        if (isPowerOn && !changed && !hasWon) {
            const bulbNode = updatedNodes.find(n => n.type === 'bulb');
            const isBulbOn = bulbNode?.data?.value === true;

            const gateNodes = updatedNodes.filter(n => n.type === 'gate');
            const switchNodes = updatedNodes.filter(n => n.type === 'switch');

            // Regula A: Toate switch-urile trebuie folosite
            const allSwitchesUsed = switchNodes.every(sw => updatedEdges.some(e => e.source === sw.id));

            // Regula B: Toate porțile DE PE ECRAN trebuie folosite complet (fără porți lăsate în aer)
            const noFloatingGates = gateNodes.every(gate =>
                updatedEdges.some(e => e.target === gate.id) && updatedEdges.some(e => e.source === gate.id)
            );

            // Regula C (Tipologia 2): Au fost folosite porțile cerute?
            let hasUsedRequiredGates = true;
            if (levelData.typology === 2 && levelData.requiredGates) {
                const usedGateTypes = gateNodes.map(g => g.data.label);
                hasUsedRequiredGates = levelData.requiredGates.every(requiredGate => usedGateTypes.includes(requiredGate));
            }

            // Verificare Finală
            if (isBulbOn && allSwitchesUsed && noFloatingGates && hasUsedRequiredGates) {
                setHasWon(true);
                setTimeout(onComplete, 1500);
            }
        }
    }, [nodes, edges, hasWon, onComplete, isPowerOn, levelData]);

    // Extragere status pentru UI Erori
    const isBulbOn = nodes.find(n => n.type === 'bulb')?.data?.value === true;
    const gateNodes = nodes.filter(n => n.type === 'gate');
    const noFloatingGates = gateNodes.every(gate => edges.some(e => e.target === gate.id) && edges.some(e => e.source === gate.id));
    const switchNodes = nodes.filter(n => n.type === 'switch');
    const allSwitchesUsed = switchNodes.every(sw => edges.some(e => e.source === sw.id));

    let hasUsedRequiredGates = true;
    if (levelData.typology === 2 && levelData.requiredGates) {
        const usedGateTypes = gateNodes.map(g => g.data.label);
        hasUsedRequiredGates = levelData.requiredGates.every(rg => usedGateTypes.includes(rg));
    }

    const isInvalidSetup = !noFloatingGates || !allSwitchesUsed || !hasUsedRequiredGates;
    const showIncompleteWarning = isPowerOn && isBulbOn && isInvalidSetup && !hasWon;
    const showLogicFailed = isPowerOn && !isBulbOn && !isInvalidSetup && !hasWon;

    let incompleteMsg = "Circuit INCOMPLET!";
    if (!allSwitchesUsed) incompleteMsg = "Fiecare sursă (switch) trebuie conectată la circuit!";
    else if (!noFloatingGates) incompleteMsg = "Orice poartă aflată pe tablă trebuie integrată în circuit!";
    else if (!hasUsedRequiredGates) incompleteMsg = `Trebuie să folosești cel puțin aceste porți: ${levelData.requiredGates.join(', ')}`;

    const isToolboxVisible = levelData.typology === 2 || levelData.typology === 3;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>

            {/* TOOLBOX (Apare doar la Typology 2 și 3) */}
            {isToolboxVisible && (
                <div style={{ width: '150px', background: '#0f172a', borderRight: '2px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', textAlign: 'center' }}>INVENTAR</h4>
                    {levelData.availableGates.map((gateType) => (
                        <div
                            key={gateType}
                            onDragStart={(event) => onDragStart(event, gateType)}
                            draggable
                            style={{ padding: '15px', background: '#1e293b', border: '2px dashed #3b82f6', color: '#60a5fa', textAlign: 'center', borderRadius: '8px', cursor: 'grab', fontWeight: 'bold' }}
                        >
                            {gateType}
                        </div>
                    ))}
                    <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: 'auto' }}>
                        Trage pe ecran ➔
                    </p>
                </div>
            )}

            {/* ZONA DE JOC */}
            <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
                <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 41, 59, 0.9)', padding: '15px 30px', borderRadius: '10px', zIndex: 10, border: '1px solid #475569', textAlign: 'center', minWidth: '350px' }}>
                    <h3 style={{ margin: 0, color: '#f8fafc' }}>{levelData.title}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{levelData.description}</p>
                    {levelData.typology === 2 && <p style={{ margin: '5px 0 0 0', color: '#facc15', fontSize: '12px', fontWeight: 'bold' }}>Necesar: {levelData.requiredGates.join(', ')}</p>}
                </div>

                {warningMessage && (
                    <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#9f1239', padding: '10px 20px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold' }}>⚠️ {warningMessage}</div>
                )}
                {showIncompleteWarning && (
                    <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#b45309', padding: '15px 25px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold' }}>🚧 {incompleteMsg}</div>
                )}
                {showLogicFailed && (
                    <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#334155', padding: '15px 25px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold', border: '2px solid #94a3b8' }}>🔌 Logica ta nu a aprins becul. Mai încearcă!</div>
                )}

                <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <button onClick={() => setIsPowerOn(!isPowerOn)} style={{ padding: '15px 40px', fontSize: '20px', fontWeight: '900', borderRadius: '40px', background: isPowerOn ? '#ef4444' : '#10b981', color: 'white', border: 'none', cursor: 'pointer', boxShadow: isPowerOn ? '0 0 20px #ef4444' : '0 0 25px rgba(16, 185, 129, 0.6)' }}>
                        {isPowerOn ? '⚡ OPREȘTE CURENTUL' : '🔌 TESTEAZĂ CIRCUITUL'}
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes} edges={edges}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
                    onDrop={onDrop} onDragOver={onDragOver} // Evenimente pentru Drag & Drop
                    isValidConnection={isValidConnection} nodeTypes={nodeTypes} fitView
                >
                    <Background color="#334155" variant="dots" gap={20} size={2} />
                    <Controls style={{ background: '#1e293b', fill: '#fff' }} />
                </ReactFlow>
            </div>
        </div>
    );
};

// Împachetăm componenta în Provider-ul necesar pentru calculul Drag & Drop
export default function GameBoard(props) {
    return (
        <ReactFlowProvider>
            <GameBoardContent {...props} />
        </ReactFlowProvider>
    );
}