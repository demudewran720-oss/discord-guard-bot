const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildEmojiDelete',
    async execute(emoji, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await emoji.guild.fetchAuditLogs({
                type: 62, // EMOJI_DELETE
                limit: 1
            });
            
            const emojiLog = auditLogs.entries.first();
            if (!emojiLog) return;
            
            const executor = emojiLog.executor;
            const member = await emoji.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logEmojiChange(emoji.guild, emoji, 'delete', executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'emojiDelete', client.config);
            
            if (actionCount > client.config.limits.emojiDelete) {
                await punishUser(emoji.guild, executor.id, `Spam emoji silme (${actionCount} emoji)`, client.config);
                
                await client.logger.logSpamDetection(emoji.guild, executor, 'emoji', actionCount);
            }
        } catch (error) {
            console.error('Emoji silme koruma hatası:', error);
        }
    }
};
