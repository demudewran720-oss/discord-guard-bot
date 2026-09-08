const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'roleDelete',
    async execute(role, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: 32, // ROLE_DELETE
                limit: 1
            });
            
            const roleLog = auditLogs.entries.first();
            if (!roleLog) return;
            
            const executor = roleLog.executor;
            const member = await role.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logRoleChange(role.guild, role, 'delete', executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'roleDelete', client.config);
            
            if (actionCount > client.config.limits.roleDelete) {
                await punishUser(role.guild, executor.id, `Spam rol silme (${actionCount} rol)`, client.config);
                
                await client.logger.logSpamDetection(role.guild, executor, 'role', actionCount);
            }
        } catch (error) {
            console.error('Rol silme koruma hatası:', error);
        }
    }
};
