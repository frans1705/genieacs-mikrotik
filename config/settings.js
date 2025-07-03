const fs = require('fs');
const path = require('path');

function getAppSettings() {
    const settingsPath = path.join(__dirname, '../settings.json');
    if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(data);
    }
    return {};
}

module.exports = { getAppSettings }; 