// audio.js - Generator de sunete 8-bit folosind Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol = 0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

export const playSound = {
    // Sunet când pornești/oprești curentul (un click mecanic)
    switch: () => playTone(600, 'square', 0.1, 0.05),

    // Sunet scurt și grav pentru când faci o greșeală (Scurtcircuit)
    error: () => {
        playTone(150, 'sawtooth', 0.3, 0.1);
        setTimeout(() => playTone(100, 'sawtooth', 0.4, 0.1), 100);
    },

    // Arpegiu fericit pentru victorie (Level Up!)
    win: () => {
        playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(500, 'sine', 0.1, 0.1), 100);
        setTimeout(() => playTone(600, 'sine', 0.1, 0.1), 200);
        setTimeout(() => playTone(800, 'sine', 0.4, 0.1), 300);
    }
};