const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Funcție utilitară pentru a citi nivelurile din JSON
const getLevels = () => {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'levels.json'));
    return JSON.parse(data);
};

// Endpoint pentru a lua toate nivelurile (pentru meniu)
app.get('/api/levels', (req, res) => {
    const levels = getLevels();
    // Trimitem doar informațiile de bază pentru listă
    const summary = levels.map(l => ({ id: l.id, title: l.title, difficulty: l.difficulty }));
    res.json(summary);
});

// Endpoint pentru a lua detaliile unui singur nivel
app.get('/api/levels/:id', (req, res) => {
    const levels = getLevels();
    const level = levels.find(l => l.id === parseInt(req.params.id));
    if (!level) return res.status(404).send('Nivelul nu a fost găsit.');
    res.json(level);
});

// Endpoint pentru salvare progres (momentan doar logăm în consolă)
app.post('/api/progress', (req, res) => {
    const { userId, levelId, stars } = req.body;
    console.log(`Utilizatorul ${userId} a terminat nivelul ${levelId} cu ${stars} stele.`);
    res.json({ success: true, message: "Progres salvat!" });
});

app.listen(PORT, () => {
    console.log(`[BACKEND] Serverul rulează pe http://localhost:${PORT}`);
});