export default function validateType7(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Fiecare sursă (switch) trebuie conectată!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Toate porțile de pe ecran trebuie folosite!" };

    if (helpers.gateCount > helpers.levelData.maxGates) {
        return { isWon: false, msg: `Buget depășit! Ai folosit ${helpers.gateCount} porți. Maxim permis: ${helpers.levelData.maxGates}.` };
    }

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}