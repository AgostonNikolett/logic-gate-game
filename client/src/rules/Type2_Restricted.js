export default function validateType2(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Fiecare sursă (switch) trebuie conectată!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Nu lăsa porți neconectate pe ecran!" };

    const required = helpers.levelData.requiredGates || [];
    const missing = required.filter(gate => !helpers.gateTypesUsed.includes(gate));

    if (missing.length > 0) {
        return { isWon: false, msg: `Trebuie să folosești obligatoriu porțile: ${missing.join(', ')}` };
    }

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}