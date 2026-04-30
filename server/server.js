const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const getLevels = () => {
    const dataPath = path.join(__dirname, 'data', 'levels.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

app.get('/api/levels', (req, res) => {
    try {
        const levels = getLevels();
        const summary = levels.map(l => ({ id: l.id, title: l.title, difficulty: l.difficulty }));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: "Eroare la citirea nivelurilor." });
    }
});

app.get('/api/levels/:id', (req, res) => {
    try {
        const levels = getLevels();
        const level = levels.find(l => l.id === parseInt(req.params.id));
        if (!level) return res.status(404).json({ error: 'Nivelul nu a fost găsit.' });
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: "Eroare internă." });
    }
});

app.listen(PORT, () => {
    console.log(`[BACKEND] Serverul rulează pe http://localhost:${PORT}`);
});