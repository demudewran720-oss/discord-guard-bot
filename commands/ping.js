const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikmesini gösterir'),
    
    async execute(interaction, client) {
        const sent = await interaction.reply({ 
            content: '🏓 Ping ölçülüyor...', 
            fetchReply: true 
        });
        
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(client.ws.ping);
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🏓 Pong!')
            .setDescription(`Bot gecikmesi ve API durumu`)
            .addFields(
                { name: '🤖 Bot Gecikmesi', value: `${ping}ms`, inline: true },
                { name: '📡 API Gecikmesi', value: `${apiPing}ms`, inline: true },
                { name: '📊 Durum', value: apiPing < 200 ? '✅ Mükemmel' : apiPing < 500 ? '⚠️ Normal' : '❌ Yavaş', inline: true }
            )
            .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
            .setTimestamp();
        
        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
