const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'channelCreate',
    async execute(channel, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: 10, // CHANNEL_CREATE
                limit: 1
            });
            
            const channelLog = auditLogs.entries.first();
            if (!channelLog) return;
            
            const executor = channelLog.executor;
            const member = await channel.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logChannelChange(channel.guild, channel, 'create', executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'channelCreate', client.config);
            
            if (actionCount > client.config.limits.channelCreate) {
                await channel.delete('[GUARD V3] Spam kanal oluşturma').catch(() => {});
                await punishUser(channel.guild, executor.id, `Spam kanal oluşturma (${actionCount} kanal)`, client.config);
                
                await client.logger.logSpamDetection(channel.guild, executor, 'channel', actionCount);
            }
        } catch (error) {
            console.error('Kanal oluşturma koruma hatası:', error);
        }
    }
};
