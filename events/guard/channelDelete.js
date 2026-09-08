const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: 12, // CHANNEL_DELETE
                limit: 1
            });
            
            const channelLog = auditLogs.entries.first();
            if (!channelLog) return;
            
            const executor = channelLog.executor;
            const member = await channel.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logChannelChange(channel.guild, channel, 'delete', executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'channelDelete', client.config);
            
            if (actionCount > client.config.limits.channelDelete) {
                await punishUser(channel.guild, executor.id, `Spam kanal silme (${actionCount} kanal)`, client.config);
                
                await client.logger.logSpamDetection(channel.guild, executor, 'channel', actionCount);
            }
        } catch (error) {
            console.error('Kanal silme koruma hatası:', error);
        }
    }
};
