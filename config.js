const { migrateFromEnv } = require('./utils/whitelistManager');

function parseList(value) {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function parseLimit(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

// Load safe users from .env first, then migrate to JSON
const envSafeUsers = parseList(process.env.SAFE_USERS);
const safeUsers = migrateFromEnv(envSafeUsers);

module.exports = {
    token: process.env.TOKEN?.trim(),
    clientId: process.env.CLIENT_ID?.trim(),
    guildId: process.env.GUILD_ID?.trim(),
    ownerId: process.env.OWNER_ID?.trim(),
    adminRoles: parseList(process.env.ADMIN_ROLES),
    safeUsers: safeUsers,
    guardEnabled: process.env.GUARD_ENABLED?.trim().toLowerCase() !== 'false',
    logChannelId: process.env.LOG_CHANNEL_ID?.trim(),
    profanityEnabled: process.env.PROFANITY_ENABLED?.trim().toLowerCase() !== 'false',
    profanityWords: parseList(process.env.PROFANITY_WORDS),
    limits: {
        roleCreate: parseLimit(process.env.MAX_ROLE_CREATE, 3),
        roleDelete: parseLimit(process.env.MAX_ROLE_DELETE, 3),
        channelCreate: parseLimit(process.env.MAX_CHANNEL_CREATE, 5),
        channelDelete: parseLimit(process.env.MAX_CHANNEL_DELETE, 5),
        ban: parseLimit(process.env.MAX_BAN, 3),
        kick: parseLimit(process.env.MAX_KICK, 3),
        messageSpam: parseLimit(process.env.MAX_MESSAGE_SPAM, 5),
        urlSpam: parseLimit(process.env.MAX_URL_SPAM, 3),
        mentionSpam: parseLimit(process.env.MAX_MENTION_SPAM, 2),
        emojiSpam: parseLimit(process.env.MAX_EMOJI_SPAM, 3),
        inviteSpam: parseLimit(process.env.MAX_INVITE_SPAM, 2),
        webhookCreate: parseLimit(process.env.MAX_WEBHOOK_CREATE, 2),
        guildUpdate: parseLimit(process.env.MAX_GUILD_UPDATE, 3),
        emojiDelete: parseLimit(process.env.MAX_EMOJI_DELETE, 3),
        stickerDelete: parseLimit(process.env.MAX_STICKER_DELETE, 3)
    },
    whitelistedBots: parseList(process.env.WHITELISTED_BOTS),
    trackDuration: 10000 // 10 seconds
};
