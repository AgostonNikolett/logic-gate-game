import validateType1 from './Type1_Classic';
import validateType2 from './Type2_Restricted';
import validateType3 from './Type3_Decoy';
import validateType4 from './Type4_ReverseEngineering';
import validateType5 from './Type5_Debugging';
import validateType6 from './Type6_Universal';
import validateType7 from './Type7_Optimize';

const Strategies = {
    1: validateType1,
    2: validateType2,
    3: validateType3,
    4: validateType4,
    5: validateType5,
    6: validateType6,
    7: validateType7
};

export const evaluateCircuit = (nodes, edges, levelData) => {
    const isBulbOn = nodes.find(n => n.type === 'bulb')?.data?.value === true;

    const switchNodes = nodes.filter(n => n.type === 'switch');
    const allSwitchesUsed = switchNodes.every(sw => edges.some(e => e.source === sw.id));

    const gateNodes = nodes.filter(n => n.type === 'gate');
    const noFloatingGates = gateNodes.every(gate =>
        edges.some(e => e.target === gate.id) && edges.some(e => e.source === gate.id)
    );

    const gateTypesUsed = gateNodes.map(g => g.data.label);
    const gateCount = gateNodes.length;

    const helpers = {
        isBulbOn, allSwitchesUsed, noFloatingGates, gateTypesUsed, gateCount, levelData
    };

    const strategy = Strategies[levelData.typology] || validateType1;
    return strategy(helpers);
};