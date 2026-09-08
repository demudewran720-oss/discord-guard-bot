const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Bot hakkında bilgi gösterir'),
    
    async execute(interaction, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${days}g ${hours}s ${minutes}d ${seconds}sn`;
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🤖 Guard V3 Bot Bilgileri')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '📊 İstatistikler', value: '\u200B', inline: false },
                { name: 'Sunucu Sayısı', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Kullanıcı Sayısı', value: `${client.users.cache.size}`, inline: true },
                { name: 'Komut Sayısı', value: `${client.commands.size}`, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '⚙️ Sistem', value: '\u200B', inline: false },
                { name: 'Çalışma Süresi', value: uptimeString, inline: true },
                { name: 'Bellek Kullanımı', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: 'Node.js', value: process.version, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '🛡️ Guard Durumu', value: client.config.guardEnabled ? '✅ Aktif' : '❌ Pasif', inline: true },
                { name: 'Discord.js', value: require('discord.js').version, inline: true },
                { name: 'Koruma Türü', value: '17 farklı koruma', inline: true }
            )
            .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
