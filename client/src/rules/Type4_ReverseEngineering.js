export default function validateType4(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Conectează toate semnalele pentru a respecta tabelul de adevăr!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Circuitul trebuie să fie complet conectat." };

    // Aici, pe viitor, poți adăuga logică să verifice mai multe stări (00, 01, 10, 11).
    // Momentan verificăm starea statică setată în JSON.
    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}