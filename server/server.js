const express = require('express');
const { getAllUsers, getAllSolanaWallets } = require('./DBModules');
const app = express();
const PORT = process.env.PORT || 9090;
const cors = require('cors');

app.use(cors());

app.get('/api', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/api/data', (req, res) => {
    getAllUsers((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/solana-wallets', (req, res) => {
    getAllSolanaWallets((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});