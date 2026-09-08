const { isSafe, trackAction, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');
const messageDeleteEvent = require('./messageDelete');
const { containsProfanity } = require('../../utils/profanityFilter');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Track message for deletion logs
        messageDeleteEvent.trackMessage(message);
        if (!client.config.guardEnabled) return;
        if (message.author.bot) return;
        if (!message.guild) return;
        
        const member = message.member;
        if (isSafe(member, client.config)) return;
        
        try {
            // Profanity Protection
            if (client.config.profanityEnabled) {
                const detectedWord = containsProfanity(message.content, client.config.profanityWords);
                if (detectedWord) {
                    await message.delete().catch(() => {});

                    const warning = await message.channel.send({
                        content: `⚠️ ${message.author}, küfür kullanımı bu sunucuda yasaktır.`
                    }).catch(() => null);

                    if (warning) {
                        setTimeout(() => warning.delete().catch(() => {}), 5000);
                    }

                    const embed = createLogEmbed(
                        '🛡️ Guard V3 - Küfür Koruması',
                        'Küfür içeren mesaj silindi.',
                        [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Kanal', value: `${message.channel}` },
                            { name: 'İşlem', value: 'Mesaj silindi ve kullanıcı uyarıldı' }
                        ]
                    );

                    return await sendLog(message.guild, embed, client.config);
                }
            }

            // Message Spam Detection
            const messageCount = trackAction(message.author.id, 'messageSpam', client.config);
            if (messageCount > client.config.limits.messageSpam) {
                await message.delete().catch(() => {});
                await punishUser(message.guild, message.author.id, `Mesaj spam (${messageCount} mesaj)`, client.config);
                
                const embed = createLogEmbed(
                    '🛡️ Guard V3 - Mesaj Spam Koruması',
                    'Spam mesaj gönderme engellendi!',
                    [
                        { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                        { name: 'Kanal', value: `${message.channel}` },
                        { name: 'Mesaj Sayısı', value: `${messageCount} mesaj` }
                    ]
                );
                
                return await sendLog(message.guild, embed, client.config);
            }
            
            // URL/Link Spam Detection
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = message.content.match(urlRegex);
            if (urls && urls.length > 0) {
                const urlCount = trackAction(message.author.id, 'urlSpam', client.config);
                if (urlCount > client.config.limits.urlSpam) {
                    await message.delete().catch(() => {});
                    await punishUser(message.guild, message.author.id, `URL spam (${urlCount} link)`, client.config);
                    
                    const embed = createLogEmbed(
                        '🛡️ Guard V3 - URL Spam Koruması',
                        'Spam link paylaşımı engellendi!',
                        [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Kanal', value: `${message.channel}` },
                            { name: 'Link Sayısı', value: `${urlCount} link` }
                        ]
                    );
                    
                    return await sendLog(message.guild, embed, client.config);
                }
            }
            
            // Mention Spam Detection
            const mentions = message.mentions.users.size + message.mentions.roles.size;
            if (mentions > 5) {
                const mentionCount = trackAction(message.author.id, 'mentionSpam', client.config);
                if (mentionCount > client.config.limits.mentionSpam) {
                    await message.delete().catch(() => {});
                    await punishUser(message.guild, message.author.id, `Mention spam (${mentionCount} toplu etiketleme)`, client.config);
                    
                    const embed = createLogEmbed(
                        '🛡️ Guard V3 - Mention Spam Koruması',
                        'Toplu etiketleme engellendi!',
                        [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Kanal', value: `${message.channel}` },
                            { name: 'Etiket Sayısı', value: `${mentions} kişi/rol` }
                        ]
                    );
                    
                    return await sendLog(message.guild, embed, client.config);
                }
            }
            
            // Emoji Spam Detection
            const emojiRegex = /<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
            const emojis = message.content.match(emojiRegex);
            if (emojis && emojis.length > 10) {
                const emojiCount = trackAction(message.author.id, 'emojiSpam', client.config);
                if (emojiCount > client.config.limits.emojiSpam) {
                    await message.delete().catch(() => {});
                    await punishUser(message.guild, message.author.id, `Emoji spam (${emojiCount} mesaj)`, client.config);
                    
                    const embed = createLogEmbed(
                        '🛡️ Guard V3 - Emoji Spam Koruması',
                        'Aşırı emoji kullanımı engellendi!',
                        [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Kanal', value: `${message.channel}` },
                            { name: 'Emoji Sayısı', value: `${emojis.length} emoji` }
                        ]
                    );
                    
                    return await sendLog(message.guild, embed, client.config);
                }
            }
            
            // Discord Invite Spam Detection
            const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
            const invites = message.content.match(inviteRegex);
            if (invites && invites.length > 0) {
                const inviteCount = trackAction(message.author.id, 'inviteSpam', client.config);
                if (inviteCount > client.config.limits.inviteSpam) {
                    await message.delete().catch(() => {});
                    await punishUser(message.guild, message.author.id, `Davet linki spam (${inviteCount} davet)`, client.config);
                    
                    const embed = createLogEmbed(
                        '🛡️ Guard V3 - Davet Spam Koruması',
                        'Spam davet linki paylaşımı engellendi!',
                        [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Kanal', value: `${message.channel}` },
                            { name: 'Davet Sayısı', value: `${inviteCount} davet` }
                        ]
                    );
                    
                    return await sendLog(message.guild, embed, client.config);
                }
            }
            
        } catch (error) {
            console.error('Mesaj koruma hatası:', error);
        }
    }
};
