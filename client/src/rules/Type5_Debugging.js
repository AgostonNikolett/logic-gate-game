export default function validateType5(helpers) {
    if (!helpers.allSwitchesUsed) return { isWon: false, msg: "Asigură-te că toate sursele sunt reconectate după ce ai reparat circuitul!" };
    if (!helpers.noFloatingGates) return { isWon: false, msg: "Ai înlocuit o piesă dar ai uitat să o legi la loc?" };

    if (!helpers.isBulbOn) return { isWon: false, msg: null };
    return { isWon: true, msg: null };
}