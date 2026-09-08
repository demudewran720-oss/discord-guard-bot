const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function loadCommands(client) {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
    }
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`✅ Komut yüklendi: ${command.data.name}`);
        } else {
            console.log(`⚠️ Hatalı komut dosyası: ${file}`);
        }
    }
    
    client.commandPayload = commands;
}

async function registerCommands(client) {
    if (!client.commandPayload?.length || !client.user) return;

    const configuredGuild = client.guilds.cache.get(client.config.guildId);
    const guild = configuredGuild || client.guilds.cache.first();

    if (!guild) {
        console.error('Slash komut kayıt hatası: Bot hiçbir sunucuda bulunamıyor.');
        return;
    }

    if (!configuredGuild) {
        console.warn(`⚠️ GUILD_ID bulunamadı; komutlar botun bağlı olduğu ilk sunucuya yükleniyor: ${guild.id}`);
    }

    const rest = new REST().setToken(client.config.token);

    try {
        console.log(`🔄 ${client.commandPayload.length} slash komut kaydediliyor...`);
        const data = await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: client.commandPayload }
        );
        console.log(`✅ ${data.length} slash komut başarıyla kaydedildi: ${guild.name}`);
    } catch (error) {
        console.error('Slash komut kayıt hatası:', error);
    }
}

module.exports = { loadCommands, registerCommands };
