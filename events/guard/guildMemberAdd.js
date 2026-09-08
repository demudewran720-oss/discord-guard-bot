const { isSafe, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        if (!client.config.guardEnabled) return;
        if (!member.user.bot) return;
        
        // Check if bot is whitelisted
        if (client.config.whitelistedBots.includes(member.user.id)) return;
        
        try {
            // Audit logs can arrive shortly after the member event.
            await new Promise(resolve => setTimeout(resolve, 1000));

            const auditLogs = await member.guild.fetchAuditLogs({
                type: 28, // BOT_ADD
                limit: 1
            });
            
            const botAddLog = auditLogs.entries.find(entry =>
                entry.target?.id === member.user.id &&
                Date.now() - entry.createdTimestamp < 15000
            );
            const executor = botAddLog?.executor || null;
            const executorMember = executor
                ? await member.guild.members.fetch(executor.id).catch(() => null)
                : null;

            if (executor && client.logger?.logBotAdd) {
                await client.logger.logBotAdd(member.guild, member, executor).catch(() => {});
            }

            // A whitelisted administrator may add approved bots. Unknown audit
            // log entries are treated as unsafe instead of silently allowing the bot.
            if (executorMember && isSafe(executorMember, client.config)) return;
            
            // Kick the bot
            await member.kick('[GUARD V3] Yetkisiz bot ekleme').catch(() => {});
            
            // Punish the user who added the bot
            if (executor) {
                await punishUser(member.guild, executor.id, 'Yetkisiz bot ekleme girişimi', client.config);
            }
            
            const embed = createLogEmbed(
                '🛡️ Guard V3 - Bot Ekleme Koruması',
                'Whitelist dışında bir bot sunucuya eklendi ve çıkarıldı.',
                [
                    { name: 'Eklenen Bot', value: `${member.user.tag} (${member.user.id})` },
                    { name: 'Ekleyen', value: executor ? `${executor.tag} (${executor.id})` : 'Tespit edilemedi' }
                ]
            );
            await sendLog(member.guild, embed, client.config);
        } catch (error) {
            console.error('Bot koruma hatası:', error);
        }
    }
};
