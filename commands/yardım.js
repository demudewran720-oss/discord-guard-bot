const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Tüm komutları gösterir'),
    
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📚 Guard V3 - Komut Listesi')
            .setDescription('Aşağıda tüm kullanılabilir komutlar listelenmiştir.')
            .addFields(
                {
                    name: '🛡️ Guard Komutları',
                    value: '`/guard durum` - Guard sisteminin durumunu gösterir\n' +
                           '`/guard ac` - Guard sistemini açar\n' +
                           '`/guard kapat` - Guard sistemini kapatır',
                    inline: false
                },
                {
                    name: '🔒 Koruma Komutları',
                    value: '`/koruma liste` - Tüm koruma özelliklerini gösterir\n' +
                           '`/koruma test` - Koruma sistemini test eder',
                    inline: false
                },
                {
                    name: '📋 Whitelist Komutları',
                    value: '`/whitelist ekle` - Kullanıcıyı güvenli listeye ekler\n' +
                           '`/whitelist cikar` - Kullanıcıyı güvenli listeden çıkarır\n' +
                           '`/whitelist liste` - Güvenli kullanıcı listesini gösterir',
                    inline: false
                },
                {
                    name: 'ℹ️ Genel Komutlar',
                    value: '`/info` - Bot hakkında bilgi gösterir\n' +
                           '`/yardim` - Bu yardım menüsünü gösterir\n' +
                           '`/ping` - Botun gecikmesini gösterir',
                    inline: false
                },
                {
                    name: '🔒 Yetkiler',
                    value: '• Guard komutları: Sunucu sahibi veya admin rolleri\n' +
                           '• Whitelist komutları: Sadece sunucu sahibi\n' +
                           '• Genel komutlar: Herkes',
                    inline: false
                }
            )
            .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
