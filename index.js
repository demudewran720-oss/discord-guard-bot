require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const config = require('./config');
const AdvancedLogger = require('./utils/advancedLogger');

function validateConfig(config) {
    const errors = [];
    const placeholderPattern = /BURAYA|YAZILACAK|ÖRN|ORNEK|IDSI|TOKEN/i;
    const required = [
        ['TOKEN', config.token],
        ['CLIENT_ID', config.clientId],
        ['GUILD_ID', config.guildId],
        ['OWNER_ID', config.ownerId]
    ];

    for (const [name, value] of required) {
        if (!value || placeholderPattern.test(value)) {
            errors.push(`${name} .env içinde gerçek bir değer olmalı`);
        }
    }

    for (const [name, value] of [['CLIENT_ID', config.clientId], ['GUILD_ID', config.guildId], ['OWNER_ID', config.ownerId]]) {
        if (value && !/^\d{16,22}$/.test(value)) {
            errors.push(`${name} bir Discord ID'si olmalı`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`[CONFIG] Bot başlatılamadı:\n- ${errors.join('\n- ')}`);
    }
}

validateConfig(config);

// Client Configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

// Initialize Collections
client.commands = new Collection();
client.config = config;
client.logger = new AdvancedLogger(client);

// Load Handlers
(async () => {
    try {
        await loadCommands(client);
        await loadEvents(client);
        
        await client.login(config.token);
    } catch (error) {
        console.error('Bot başlatma hatası:', error);
        process.exit(1);
    }
})();

// Error Handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});
