const fs = require('fs');
const path = require('path');

const WHITELIST_FILE = path.join(__dirname, '../data/whitelist.json');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Load whitelist from JSON file
function loadWhitelist() {
    try {
        ensureDataDir();
        
        if (!fs.existsSync(WHITELIST_FILE)) {
            return [];
        }
        
        const data = fs.readFileSync(WHITELIST_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.safeUsers || [];
    } catch (error) {
        console.error('Whitelist yükleme hatası:', error);
        return [];
    }
}

// Save whitelist to JSON file
function saveWhitelist(safeUsers) {
    try {
        ensureDataDir();
        
        const data = {
            safeUsers: safeUsers,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Whitelist kaydetme hatası:', error);
        return false;
    }
}

// Add user to whitelist
function addUser(userId, currentList) {
    if (currentList.includes(userId)) {
        return { success: false, message: 'Kullanıcı zaten listede' };
    }
    
    const newList = [...currentList, userId];
    const saved = saveWhitelist(newList);
    
    if (saved) {
        return { success: true, list: newList };
    } else {
        return { success: false, message: 'Dosya kaydetme hatası' };
    }
}

// Remove user from whitelist
function removeUser(userId, currentList) {
    if (!currentList.includes(userId)) {
        return { success: false, message: 'Kullanıcı listede değil' };
    }
    
    const newList = currentList.filter(id => id !== userId);
    const saved = saveWhitelist(newList);
    
    if (saved) {
        return { success: true, list: newList };
    } else {
        return { success: false, message: 'Dosya kaydetme hatası' };
    }
}

// Migrate from .env to JSON (first time setup)
function migrateFromEnv(envUsers) {
    try {
        ensureDataDir();
        
        // If JSON file already exists, don't migrate
        if (fs.existsSync(WHITELIST_FILE)) {
            return loadWhitelist();
        }
        
        // Save env users to JSON
        if (envUsers && envUsers.length > 0) {
            saveWhitelist(envUsers);
            console.log('✅ .env\'deki whitelist verileri JSON\'a aktarıldı');
            return envUsers;
        }
        
        return [];
    } catch (error) {
        console.error('Migration hatası:', error);
        return envUsers || [];
    }
}

module.exports = {
    loadWhitelist,
    saveWhitelist,
    addUser,
    removeUser,
    migrateFromEnv
};
