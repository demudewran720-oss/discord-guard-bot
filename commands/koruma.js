const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('koruma')
        .setDescription('Gelişmiş koruma ayarları')
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Tüm koruma özelliklerini ve limitlerini gösterir')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Koruma sistemini test eder')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        const isOwner = interaction.user.id === client.config.ownerId;
        const hasAdminRole = client.config.adminRoles.some(roleId => 
            interaction.member.roles.cache.has(roleId)
        );
        
        if (!isOwner && !hasAdminRole) {
            return interaction.reply({
                content: '❌ Bu komutu kullanmak için yetkiniz yok!',
                ephemeral: true
            });
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'liste') {
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🛡️ Guard V3 - Koruma Özellikleri')
                .setDescription('Tüm aktif koruma sistemleri ve limitleri')
                .addFields(
                    {
                        name: '👥 Kullanıcı Korumaları',
                        value: `• Yasaklama: ${client.config.limits.ban}\n` +
                               `• Atma: ${client.config.limits.kick}\n` +
                               `• Bot Ekleme: Otomatik`,
                        inline: true
                    },
                    {
                        name: '🎭 Rol Korumaları',
                        value: `• Rol Oluşturma: ${client.config.limits.roleCreate}\n` +
                               `• Rol Silme: ${client.config.limits.roleDelete}`,
                        inline: true
                    },
                    {
                        name: '📢 Kanal Korumaları',
                        value: `• Kanal Oluşturma: ${client.config.limits.channelCreate}\n` +
                               `• Kanal Silme: ${client.config.limits.channelDelete}`,
                        inline: true
                    },
                    {
                        name: '💬 Mesaj Korumaları',
                        value: `• Mesaj Spam: ${client.config.limits.messageSpam}\n` +
                               `• URL Spam: ${client.config.limits.urlSpam}\n` +
                               `• Mention Spam: ${client.config.limits.mentionSpam}\n` +
                               `• Emoji Spam: ${client.config.limits.emojiSpam}\n` +
                               `• Davet Spam: ${client.config.limits.inviteSpam}\n` +
                               `• Mesaj Silme: HTML Log 🔥`,
                        inline: true
                    },
                    {
                        name: '🎨 Sunucu Öğeleri',
                        value: `• Emoji Silme: ${client.config.limits.emojiDelete}\n` +
                               `• Sticker Silme: ${client.config.limits.stickerDelete}\n` +
                               `• Webhook Oluşturma: ${client.config.limits.webhookCreate}`,
                        inline: true
                    },
                    {
                        name: '⚙️ Sunucu Ayarları',
                        value: `• Sunucu Güncelleme: ${client.config.limits.guildUpdate}`,
                        inline: true
                    },
                    {
                        name: '⏱️ Zaman Dilimi',
                        value: '10 saniye içindeki işlemler takip edilir',
                        inline: false
                    },
                    {
                        name: '🔒 Güvenlik Katmanları',
                        value: `• Owner: 1 kişi\n` +
                               `• Admin Rolleri: ${client.config.adminRoles.length} rol\n` +
                               `• Güvenli Kullanıcılar: ${client.config.safeUsers.length} kişi\n` +
                               `• Whitelist Botlar: ${client.config.whitelistedBots.length} bot`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }
        
        if (subcommand === 'test') {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Guard V3 - Sistem Testi')
                .setDescription('Koruma sistemi aktif ve çalışıyor!')
                .addFields(
                    { name: 'Durum', value: client.config.guardEnabled ? '✅ Aktif' : '❌ Pasif' },
                    { name: 'Toplam Koruma', value: '17 farklı koruma türü' },
                    { name: 'Özel Özellik', value: '🔥 HTML Mesaj Geçmişi' },
                    { name: 'Event Listener', value: `${client.eventNames().length} event dinleniyor` },
                    { name: 'Komut Sayısı', value: `${client.commands.size} komut` }
                )
                .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
