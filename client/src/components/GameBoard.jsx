import { useState, useEffect, useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SwitchNode from './Nodes/SwitchNode';
import GateNode from './Nodes/GateNode';
import BulbNode from './Nodes/BulbNode';
import { evaluateCircuit } from '../rules/RuleEngine';

const nodeTypes = { switch: SwitchNode, gate: GateNode, bulb: BulbNode };

const GameBoardContent = ({ levelData, onComplete }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [warningMessage, setWarningMessage] = useState(null);
    const [isPowerOn, setIsPowerOn] = useState(false);
    const [ruleErrorMsg, setRuleErrorMsg] = useState(null);

    // NOU: Sistem de Punctaj
    const [testAttempts, setTestAttempts] = useState(0);
    const [showWinModal, setShowWinModal] = useState(false);
    const [earnedStars, setEarnedStars] = useState(0);

    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();

    useEffect(() => {
        setHasWon(false); setIsPowerOn(false); setEdges([]); setWarningMessage(null); setRuleErrorMsg(null);
        setTestAttempts(0); setShowWinModal(false); setEarnedStars(0); // Resetăm stările

        const initialNodes = [];
        levelData.setup.switches.forEach((s) => {
            initialNodes.push({ id: s.id, type: 'switch', position: { x: s.x, y: s.y }, data: { label: s.label, initialValue: s.value !== undefined ? s.value : true, value: false } });
        });
        levelData.setup.gates.forEach((g) => {
            initialNodes.push({ id: g.id, type: 'gate', position: { x: g.x, y: g.y }, data: { label: g.type, value: false } });
        });
        initialNodes.push({ id: levelData.setup.target.id, type: 'bulb', position: { x: levelData.setup.target.x, y: levelData.setup.target.y }, data: { label: 'Bulb', value: false } });

        setNodes(initialNodes);
    }, [levelData]);

    const onDragStart = (event, nodeType) => { event.dataTransfer.setData('application/reactflow', nodeType); event.dataTransfer.effectAllowed = 'move'; };
    const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = { id: `gate_${Date.now()}`, type: 'gate', position, data: { label: type, value: false } };
        setNodes((nds) => nds.concat(newNode));
        setIsPowerOn(false);
    }, [screenToFlowPosition]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => { setEdges((eds) => applyEdgeChanges(changes, eds)); setIsPowerOn(false); }, []);
    const onConnect = useCallback((params) => { setEdges((eds) => addEdge({ ...params, animated: true }, eds)); setIsPowerOn(false); }, []);

    const isValidConnection = useCallback((connection) => {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) return false;

        const hasPreplacedGates = levelData.setup.gates && levelData.setup.gates.length > 0;
        const hasInventoryGates = levelData.availableGates && levelData.availableGates.length > 0;

        if ((hasPreplacedGates || hasInventoryGates) && sourceNode.type === 'switch' && targetNode.type === 'bulb') {
            showWarning("Strict: Trece semnalul prin porți!");
            return false;
        }

        return true;
    }, [nodes, levelData]);

    const showWarning = (msg) => { setWarningMessage(msg); setTimeout(() => setWarningMessage(null), 3500); };

    // NOU: Funcția de pornire care numără încercările
    const handleTogglePower = () => {
        if (!isPowerOn && !hasWon) {
            setTestAttempts(prev => prev + 1);
        }
        setIsPowerOn(!isPowerOn);
    };

    useEffect(() => {
        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];
        let changed = false;

        updatedNodes = updatedNodes.map(node => {
            if (node.type === 'switch') {
                const expectedVal = isPowerOn ? node.data.initialValue : false;
                if (node.data.value !== expectedVal) { changed = true; return { ...node, data: { ...node.data, value: expectedVal } }; }
                return node;
            }
            const incomingEdges = updatedEdges.filter(e => e.target === node.id);
            const inputValues = incomingEdges.map(edge => updatedNodes.find(n => n.id === edge.source)?.data?.value || false);

            let newValue = false;
            if (node.type === 'gate') {
                const [valA, valB] = inputValues;
                switch (node.data.label) {
                    case 'AND': newValue = valA && valB; break;
                    case 'OR':  newValue = valA || valB; break;
                    case 'NOT': newValue = !valA; break;
                    case 'XOR': newValue = valA !== valB; break;
                    case 'NAND': newValue = !(valA && valB); break;
                    case 'NOR': newValue = !(valA || valB); break;
                    case 'XNOR': newValue = valA === valB; break;
                }
            } else if (node.type === 'bulb') {
                newValue = inputValues[0] || false;
            }

            if (node.data.value !== newValue) { changed = true; return { ...node, data: { ...node.data, value: newValue } }; }
            return node;
        });

        updatedEdges = updatedEdges.map(edge => {
            const isActive = updatedNodes.find(n => n.id === edge.source)?.data?.value === true;
            const newClass = isActive ? 'active-edge' : 'inactive-edge';
            if (edge.className !== newClass) { changed = true; return { ...edge, className: newClass }; }
            return edge;
        });

        if (changed) { setNodes(updatedNodes); setEdges(updatedEdges); }

        if (isPowerOn && !changed && !hasWon) {
            const evaluation = evaluateCircuit(updatedNodes, updatedEdges, levelData);
            setRuleErrorMsg(evaluation.msg);

            // NOU: CALCULUL STELELOR LA VICTORIE
            if (evaluation.isWon) {
                setHasWon(true);

                let stars = 3; // Începem cu maxim

                // Penalizare pentru încercări multiple
                if (testAttempts > 1) stars -= 1;

                // Penalizare pentru piese extra
                const gateCount = updatedNodes.filter(n => n.type === 'gate').length;
                const minG = levelData.minGates || 0;
                const extraGates = gateCount - minG;

                if (extraGates >= 1 && extraGates <= 2) stars -= 1;
                else if (extraGates >= 3 && extraGates <= 4) stars -= 2;
                else if (extraGates >= 5) stars -= 3;

                stars = Math.max(0, stars); // Nu poți avea stele negative
                setEarnedStars(stars);

                setTimeout(() => setShowWinModal(true), 1500); // Afișăm modalul după animație
            }
        } else if (!isPowerOn) {
            setRuleErrorMsg(null);
        }
    }, [nodes, edges, hasWon, isPowerOn, levelData, testAttempts]);

    const isBulbOn = nodes.find(n => n.type === 'bulb')?.data?.value === true;
    const isToolboxVisible = levelData.availableGates && levelData.availableGates.length > 0;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>

            {/* MODAL DE VICTORIE */}
            {showWinModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: '#1e293b', padding: '40px', borderRadius: '15px', border: '2px solid #10b981', textAlign: 'center', boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)' }}>
                        <h2 style={{ color: '#10b981', margin: '0 0 20px 0', fontSize: '32px' }}>Nivel Completat!</h2>
                        <div style={{ fontSize: '50px', letterSpacing: '10px', marginBottom: '20px' }}>
                            {Array(3).fill(0).map((_, i) => (
                                <span key={i} style={{ color: i < earnedStars ? '#facc15' : '#475569', textShadow: i < earnedStars ? '0 0 20px #facc15' : 'none' }}>★</span>
                            ))}
                        </div>
                        <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>
                            Încercări: <strong>{testAttempts}</strong> | Piese folosite: <strong>{nodes.filter(n => n.type === 'gate').length}</strong> (Minim ideal: {levelData.minGates})
                        </p>
                        <button
                            onClick={() => onComplete(earnedStars)}
                            style={{ background: '#3b82f6', color: 'white', padding: '15px 40px', fontSize: '18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Continuă ➔
                        </button>
                    </div>
                </div>
            )}

            {isToolboxVisible && (
                <div style={{ width: '150px', background: '#0f172a', borderRight: '2px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', textAlign: 'center' }}>INVENTAR</h4>
                    {levelData.availableGates.map((gateType) => (
                        <div key={gateType} onDragStart={(event) => onDragStart(event, gateType)} draggable style={{ padding: '15px', background: '#1e293b', border: '2px dashed #3b82f6', color: '#60a5fa', textAlign: 'center', borderRadius: '8px', cursor: 'grab', fontWeight: 'bold' }}>
                            {gateType}
                        </div>
                    ))}
                    {levelData.maxGates && (
                        <div style={{ color: '#facc15', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                            Max piese: {levelData.maxGates}
                        </div>
                    )}
                </div>
            )}

            <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
                <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 41, 59, 0.9)', padding: '15px 30px', borderRadius: '10px', zIndex: 10, border: '1px solid #475569', textAlign: 'center', minWidth: '350px' }}>
                    <h3 style={{ margin: 0, color: '#f8fafc' }}>{levelData.title}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{levelData.description}</p>
                </div>

                {warningMessage && <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#9f1239', padding: '10px 20px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold' }}>⚠️ {warningMessage}</div>}
                {ruleErrorMsg && isPowerOn && <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#b45309', padding: '15px 25px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold' }}>🚧 {ruleErrorMsg}</div>}
                {!ruleErrorMsg && isPowerOn && !isBulbOn && !hasWon && <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: '#334155', padding: '15px 25px', borderRadius: '8px', zIndex: 20, color: 'white', fontWeight: 'bold', border: '2px solid #94a3b8' }}>🔌 Circuit asamblat corect, dar logica ta nu a aprins becul. Mai încearcă!</div>}

                <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <button onClick={handleTogglePower} style={{ padding: '15px 40px', fontSize: '20px', fontWeight: '900', borderRadius: '40px', background: isPowerOn ? '#ef4444' : '#10b981', color: 'white', border: 'none', cursor: 'pointer', boxShadow: isPowerOn ? '0 0 20px #ef4444' : '0 0 25px rgba(16, 185, 129, 0.6)' }}>
                        {isPowerOn ? '⚡ OPREȘTE CURENTUL' : '🔌 TESTEAZĂ CIRCUITUL'}
                    </button>
                </div>

                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} isValidConnection={isValidConnection} nodeTypes={nodeTypes} fitView>
                    <Background color="#334155" variant="dots" gap={20} size={2} />
                    <Controls style={{ background: '#1e293b', fill: '#fff' }} />
                </ReactFlow>
            </div>
        </div>
    );
};

export default function GameBoard(props) {
    return <ReactFlowProvider><GameBoardContent {...props} /></ReactFlowProvider>;
}