const { AttachmentBuilder } = require('discord.js');
const { isSafe, sendLog, createLogEmbed } = require('../../utils/guardUtils');
const { createMessageHTML } = require('../../utils/htmlGenerator');

// Message cache for tracking
const messageCache = new Map();

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (!client.config.guardEnabled) return;
        if (message.author?.bot) return;
        if (!message.guild) return;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const auditLogs = await message.guild.fetchAuditLogs({
                type: 72, // MESSAGE_DELETE
                limit: 1
            });
            
            const deleteLog = auditLogs.entries.first();
            if (!deleteLog) return;
            
            // Check if it was deleted by someone else (not the author)
            if (deleteLog.target.id !== message.author.id) return;
            
            const executor = deleteLog.executor;
            if (executor.id === message.author.id) return; // User deleted their own message
            
            const member = await message.guild.members.fetch(executor.id).catch(() => null);
            if (isSafe(member, client.config)) return;
            
            // Get last 10 messages from cache
            const channelMessages = messageCache.get(message.channel.id) || [];
            const last10Messages = channelMessages.slice(-10);
            
            // Add deleted message to the list
            const messagesForHTML = [...last10Messages, {
                id: message.id,
                author: {
                    tag: message.author.tag,
                    id: message.author.id,
                    avatar: message.author.displayAvatarURL()
                },
                content: message.content || '[İçerik Yok]',
                createdAt: message.createdAt,
                attachments: Array.from(message.attachments.values()),
                embeds: message.embeds,
                deleted: true
            }];
            
            // Generate HTML
            const html = createMessageHTML(messagesForHTML, {
                deletedBy: executor.tag,
                deletedById: executor.id,
                channelName: message.channel.name,
                guildName: message.guild.name
            });
            
            // Create attachment
            const attachment = new AttachmentBuilder(
                Buffer.from(html, 'utf-8'),
                { name: `mesaj-silme-${Date.now()}.html` }
            );
            
            const embed = createLogEmbed(
                '🛡️ Guard V3 - Mesaj Silme Koruması',
                'Bir mesaj silindi ve geçmişi kaydedildi!',
                [
                    { name: 'Silinen Mesaj Sahibi', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Silen Kişi', value: `${executor.tag} (${executor.id})`, inline: true },
                    { name: 'Kanal', value: `${message.channel}`, inline: true },
                    { name: 'Mesaj İçeriği', value: message.content?.substring(0, 100) || '[İçerik Yok]', inline: false },
                    { name: 'Ek Bilgi', value: `Son 10 mesaj + silinen mesaj HTML dosyasında`, inline: false }
                ]
            );
            
            await sendLog(message.guild, embed, client.config, [attachment]);
            
        } catch (error) {
            console.error('Mesaj silme koruma hatası:', error);
        }
    }
};

// Message tracking for cache
module.exports.trackMessage = (message) => {
    if (!message.guild) return;
    if (message.author?.bot) return;
    
    const channelId = message.channel.id;
    if (!messageCache.has(channelId)) {
        messageCache.set(channelId, []);
    }
    
    const messages = messageCache.get(channelId);
    messages.push({
        id: message.id,
        author: {
            tag: message.author.tag,
            id: message.author.id,
            avatar: message.author.displayAvatarURL()
        },
        content: message.content,
        createdAt: message.createdAt,
        attachments: Array.from(message.attachments.values()),
        embeds: message.embeds,
        deleted: false
    });
    
    // Keep only last 50 messages per channel
    if (messages.length > 50) {
        messages.shift();
    }
};
