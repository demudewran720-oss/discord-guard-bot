const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await newGuild.fetchAuditLogs({
                type: 1, // GUILD_UPDATE
                limit: 1
            });
            
            const updateLog = auditLogs.entries.first();
            if (!updateLog) return;
            
            const executor = updateLog.executor;
            const member = await newGuild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logGuildUpdate(newGuild, oldGuild, newGuild, executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'guildUpdate', client.config);
            
            if (actionCount > client.config.limits.guildUpdate) {
                await punishUser(newGuild, executor.id, `Spam sunucu güncelleme (${actionCount} güncelleme)`, client.config);
                
                await client.logger.logSpamDetection(newGuild, executor, 'guild', actionCount);
            }
        } catch (error) {
            console.error('Sunucu güncelleme koruma hatası:', error);
        }
    }
};
