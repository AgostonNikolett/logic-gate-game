export default function validateType6(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Fiecare sursă trebuie conectată!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Toate porțile NAND/NOR de pe ecran trebuie folosite!" };

    // Verificăm strict dacă jucătorul a trișat și a pus altă poartă (dacă cumva UI-ul a permis asta)
    const allowedGates = helpers.levelData.availableGates || [];
    const invalidGates = helpers.gateTypesUsed.filter(g => !allowedGates.includes(g));

    if (invalidGates.length > 0) {
        return { isWon: false, msg: `Nivel invalid! Ai voie să folosești DOAR porți de tipul: ${allowedGates.join(', ')}` };
    }

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}