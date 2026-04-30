export default function validateType3(helpers) {
    // Logica de victorie e identică cu Tipul 1, dar o ținem separat pentru extinderi viitoare
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Ai uitat să conectezi o sursă de energie!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Șterge porțile de care nu ai nevoie! Nu lăsa piese atârnând." };

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}