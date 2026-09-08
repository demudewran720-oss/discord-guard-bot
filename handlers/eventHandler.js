const fs = require('fs');
const path = require('path');

async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
    }
    
    const eventFolders = fs.readdirSync(eventsPath);
    
    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);
        
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);
            const event = require(filePath);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            console.log(`✅ Event yüklendi: ${folder}/${event.name}`);
        }
    }
}

module.exports = { loadEvents };
