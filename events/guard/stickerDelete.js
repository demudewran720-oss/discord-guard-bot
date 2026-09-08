const { isSafe, trackAction, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildStickerDelete',
    async execute(sticker, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await sticker.guild.fetchAuditLogs({
                type: 91, // STICKER_DELETE
                limit: 1
            });
            
            const stickerLog = auditLogs.entries.first();
            if (!stickerLog) return;
            
            const executor = stickerLog.executor;
            const member = await sticker.guild.members.fetch(executor.id).catch(() => null);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'stickerDelete', client.config);
            
            if (actionCount > client.config.limits.stickerDelete) {
                await punishUser(sticker.guild, executor.id, `Spam sticker silme (${actionCount} sticker)`, client.config);
                
                const embed = createLogEmbed(
                    '🛡️ Guard V3 - Sticker Silme Koruması',
                    'Spam sticker silme engellendi!',
                    [
                        { name: 'Kullanıcı', value: `${executor.tag} (${executor.id})` },
                        { name: 'Silinen Sticker', value: `${sticker.name}` },
                        { name: 'İşlem Sayısı', value: `${actionCount} sticker` }
                    ]
                );
                
                await sendLog(sticker.guild, embed, client.config);
            }
        } catch (error) {
            console.error('Sticker silme koruma hatası:', error);
        }
    }
};
