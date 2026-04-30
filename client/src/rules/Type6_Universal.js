export default function validateType6(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Fiecare sursă trebuie conectată!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Toate porțile de pe ecran trebuie folosite!" };

    // Verificăm strict dacă jucătorul a trișat și a pus altă poartă
    const allowedGates = helpers.levelData.availableGates || [];
    const invalidGates = helpers.gateTypesUsed.filter(g => !allowedGates.includes(g));

    if (invalidGates.length > 0) {
        return { isWon: false, msg: `Sinteză invalidă! Ai voie să folosești DOAR porți de tipul: ${allowedGates.join(', ')}` };
    }

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}