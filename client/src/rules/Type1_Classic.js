export default function validateType1(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Fiecare sursă (switch) trebuie conectată la circuit!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Orice poartă aflată pe tablă trebuie integrată în circuit!" };
    if (!helpers.isBulbOn) return { isWon: false, msg: null };

    return { isWon: true, msg: null };
}