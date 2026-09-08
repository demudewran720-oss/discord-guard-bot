const { isSafe, trackAction, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');

module.exports = {
    name: 'webhooksUpdate',
    async execute(channel, client) {
        if (!client.config.guardEnabled) return;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: 50, // WEBHOOK_CREATE
                limit: 1
            });
            
            const webhookLog = auditLogs.entries.first();
            if (!webhookLog) return;
            
            const executor = webhookLog.executor;
            const member = await channel.guild.members.fetch(executor.id).catch(() => null);
            
            if (isSafe(member, client.config)) return;
            
            const actionCount = trackAction(executor.id, 'webhookCreate', client.config);
            
            if (actionCount > client.config.limits.webhookCreate) {
                // Delete the webhook
                const webhooks = await channel.fetchWebhooks();
                const recentWebhook = webhooks.find(w => w.owner.id === executor.id);
                if (recentWebhook) {
                    await recentWebhook.delete('[GUARD V3] Yetkisiz webhook oluşturma').catch(() => {});
                }
                
                await punishUser(channel.guild, executor.id, `Spam webhook oluşturma (${actionCount} webhook)`, client.config);
                
                const embed = createLogEmbed(
                    '🛡️ Guard V3 - Webhook Koruması',
                    'Spam webhook oluşturma engellendi!',
                    [
                        { name: 'Kullanıcı', value: `${executor.tag} (${executor.id})` },
                        { name: 'Kanal', value: `${channel}` },
                        { name: 'İşlem Sayısı', value: `${actionCount} webhook` }
                    ]
                );
                
                await sendLog(channel.guild, embed, client.config);
            }
        } catch (error) {
            console.error('Webhook koruma hatası:', error);
        }
    }
};
