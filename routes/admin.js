const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../settings.json');

router.get('/api/settings', (req, res) => {
    if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf8');
        res.json(JSON.parse(data));
    } else {
        res.json({});
    }
});

router.post('/api/settings', (req, res) => {
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

module.exports = router; 