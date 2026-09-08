const { Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Action Tracking System
const actionTracker = new Collection();

function isProtected(userId, config) {
    return userId === config.ownerId || config.safeUsers.includes(userId);
}

function hasAdminRole(member, config) {
    if (!member || !member.roles) return false;
    return config.adminRoles.some(roleId => member.roles.cache.has(roleId));
}

function isSafe(member, config) {
    if (!member) return false;
    return isProtected(member.id, config) || hasAdminRole(member, config);
}

function trackAction(userId, actionType, config) {
    const key = `${userId}-${actionType}`;
    const now = Date.now();
    
    if (!actionTracker.has(key)) {
        actionTracker.set(key, []);
    }
    
    const actions = actionTracker.get(key);
    actions.push(now);
    
    // Clean old actions
    const filtered = actions.filter(time => now - time < config.trackDuration);
    actionTracker.set(key, filtered);
    
    return filtered.length;
}

async function sendLog(guild, embed, config, files = []) {
    if (!config.logChannelId) return;
    
    try {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send({ embeds: [embed], files });
        }
    } catch (error) {
        console.error('Log gönderme hatası:', error);
    }
}

async function punishUser(guild, userId, reason, config) {
    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        
        if (member && !isSafe(member, config)) {
            // Remove dangerous permissions
            const dangerousRoles = member.roles.cache.filter(role => 
                role.permissions.has(PermissionFlagsBits.Administrator) ||
                role.permissions.has(PermissionFlagsBits.ManageGuild) ||
                role.permissions.has(PermissionFlagsBits.ManageRoles) ||
                role.permissions.has(PermissionFlagsBits.ManageChannels) ||
                role.permissions.has(PermissionFlagsBits.BanMembers) ||
                role.permissions.has(PermissionFlagsBits.KickMembers)
            );
            
            for (const role of dangerousRoles.values()) {
                await member.roles.remove(role).catch(() => {});
            }
            
            // Ban the user
            await guild.members.ban(userId, { reason: `[GUARD V3] ${reason}` }).catch(() => {});
            
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🛡️ Guard V3 - Kullanıcı Cezalandırıldı')
                .setDescription(`<@${userId}> sunucudan yasaklandı.`)
                .addFields(
                    { name: 'Sebep', value: reason },
                    { name: 'İşlem', value: 'Yetkili roller alındı ve yasaklandı' }
                )
                .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
                .setTimestamp();
            
            await sendLog(guild, embed, config);
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Cezalandırma hatası:', error);
        return false;
    }
}

function createLogEmbed(title, description, fields = []) {
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(title)
        .setDescription(description)
        .addFields(fields)
        .setFooter({ 
            text: 'Night Hawk ❤️ discord.gg/excode',
            iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' // Opsiyonel: Emoji/logo URL'i
        })
        .setTimestamp();
}

module.exports = {
    isProtected,
    hasAdminRole,
    isSafe,
    trackAction,
    sendLog,
    punishUser,
    createLogEmbed
};
