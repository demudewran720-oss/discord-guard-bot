const { isSafe, trackAction, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for audit log
            
            const auditLogs = await member.guild.fetchAuditLogs({
                type: 20, // MEMBER_KICK
                limit: 1
            });
            
            const kickLog = auditLogs.entries.first();
            if (!kickLog || kickLog.target.id !== member.id) return;
            
            const executor = kickLog.executor;
            const executorMember = await member.guild.members.fetch(executor.id).catch(() => null);
            
            if (isSafe(executorMember, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'kick', client.config);
            
            if (actionCount > client.config.limits.kick) {
                await punishUser(member.guild, executor.id, `Spam atma (${actionCount} kişi)`, client.config);
                
                const embed = createLogEmbed(
                    '🛡️ Guard V3 - Atma Koruması',
                    'Spam atma engellendi!',
                    [
                        { name: 'Kullanıcı', value: `${executor.tag} (${executor.id})` },
                        { name: 'İşlem Sayısı', value: `${actionCount} atma` }
                    ]
                );
                
                await sendLog(member.guild, embed, client.config);
            }
        } catch (error) {
            console.error('Atma koruma hatası:', error);
        }
    }
};
