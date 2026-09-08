const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
            return interaction.reply({
                content: '❌ Bu komut bulunamadı!',
                ephemeral: true
            });
        }
        
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Komut hatası [${interaction.commandName}]:`, error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Hata')
                .setDescription('Komut çalıştırılırken bir hata oluştu!')
                .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
                .setTimestamp();
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
