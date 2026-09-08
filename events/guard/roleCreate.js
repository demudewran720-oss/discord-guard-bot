const { isSafe, trackAction, punishUser } = require('../../utils/guardUtils');

module.exports = {
    name: 'roleCreate',
    async execute(role, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: 30, // ROLE_CREATE
                limit: 1
            });
            
            const roleLog = auditLogs.entries.first();
            if (!roleLog) return;
            
            const executor = roleLog.executor;
            const member = await role.guild.members.fetch(executor.id).catch(() => null);
            
            // Her zaman log at
            await client.logger.logRoleChange(role.guild, role, 'create', executor);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'roleCreate', client.config);
            
            if (actionCount > client.config.limits.roleCreate) {
                await role.delete('[GUARD V3] Spam rol oluşturma').catch(() => {});
                await punishUser(role.guild, executor.id, `Spam rol oluşturma (${actionCount} rol)`, client.config);
                
                await client.logger.logSpamDetection(role.guild, executor, 'role', actionCount);
            }
        } catch (error) {
            console.error('Rol oluşturma koruma hatası:', error);
        }
    }
};
