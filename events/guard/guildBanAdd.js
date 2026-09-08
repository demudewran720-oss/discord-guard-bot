const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: 22, // MEMBER_BAN_ADD
                limit: 1
            });
            
            const banLog = auditLogs.entries.first();
            if (!banLog) return;
            
            const executor = banLog.executor;
            const member = await ban.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logMemberAction(ban.guild, ban.user, 'ban', executor, banLog.reason);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'ban', client.config);
            
            if (actionCount > client.config.limits.ban) {
                await ban.guild.members.unban(ban.user.id, '[GUARD V3] Yetkisiz yasaklama').catch(() => {});
                await punishUser(ban.guild, executor.id, `Spam yasaklama (${actionCount} kişi)`, client.config);
                
                await client.logger.logSpamDetection(ban.guild, executor, 'ban', actionCount);
            }
        } catch (error) {
            console.error('Yasaklama koruma hatası:', error);
        }
    }
};
