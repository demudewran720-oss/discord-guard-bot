const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

class AdvancedLogger {
    constructor(client) {
        this.client = client;
        this.colors = {
            success: '#00FF00',
            warning: '#FFA500',
            danger: '#FF0000',
            info: '#0099FF',
            purple: '#9B59B6'
        };
    }

    async sendDetailedLog(guild, data) {
        const logChannel = guild.channels.cache.get(this.client.config.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(this.colors[data.type] || this.colors.info)
            .setTitle(data.title)
            .setDescription(data.description || 'Guard işlemi kaydedildi.')
            .setFooter({ text: 'Night Hawk ❤️ discord.gg/excode' })
            .setTimestamp();

        if (data.thumbnail) {
            embed.setThumbnail(data.thumbnail);
        }

        if (data.fields && data.fields.length > 0) {
            embed.addFields(data.fields);
        }

        if (data.image) {
            embed.setImage(data.image);
        }

        const components = [];
        if (data.files) {
            await logChannel.send({ embeds: [embed], files: data.files });
        } else {
            await logChannel.send({ embeds: [embed] });
        }
    }

    async logRoleChange(guild, role, action, executor) {
        const permissions = role.permissions.toArray().slice(0, 10).join(', ') || 'Yok';
        
        await this.sendDetailedLog(guild, {
            type: action === 'create' ? 'success' : 'danger',
            title: `🎭 Rol ${action === 'create' ? 'Oluşturuldu' : 'Silindi'}`,
            description: `**${role.name}** rolü ${action === 'create' ? 'oluşturuldu' : 'silindi'}`,
            thumbnail: guild.iconURL(),
            fields: [
                { name: '📝 Rol Adı', value: role.name, inline: true },
                { name: '🆔 Rol ID', value: role.id, inline: true },
                { name: '🎨 Renk', value: role.hexColor, inline: true },
                { name: '👤 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📊 Pozisyon', value: `${role.position}`, inline: true },
                { name: '🔢 Üye Sayısı', value: `${role.members.size}`, inline: true },
                { name: '🔐 İzinler', value: permissions, inline: false },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logChannelChange(guild, channel, action, executor) {
        const channelTypes = {
            0: '💬 Metin Kanalı',
            2: '🔊 Ses Kanalı',
            4: '📁 Kategori',
            5: '📢 Duyuru Kanalı',
            13: '🎭 Stage Kanalı',
            15: '🧵 Forum Kanalı'
        };

        await this.sendDetailedLog(guild, {
            type: action === 'create' ? 'success' : 'danger',
            title: `📢 Kanal ${action === 'create' ? 'Oluşturuldu' : 'Silindi'}`,
            description: `**${channel.name}** kanalı ${action === 'create' ? 'oluşturuldu' : 'silindi'}`,
            thumbnail: guild.iconURL(),
            fields: [
                { name: '📝 Kanal Adı', value: channel.name, inline: true },
                { name: '🆔 Kanal ID', value: channel.id, inline: true },
                { name: '📂 Tip', value: channelTypes[channel.type] || 'Bilinmiyor', inline: true },
                { name: '👤 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📊 Pozisyon', value: `${channel.position || 0}`, inline: true },
                { name: '🔒 NSFW', value: channel.nsfw ? 'Evet' : 'Hayır', inline: true },
                { name: '📝 Konu', value: channel.topic || 'Yok', inline: false },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logMemberAction(guild, member, action, executor, reason) {
        const actionTypes = {
            ban: { emoji: '🔨', title: 'Yasaklandı', color: 'danger' },
            kick: { emoji: '👢', title: 'Atıldı', color: 'warning' },
            unban: { emoji: '✅', title: 'Yasak Kaldırıldı', color: 'success' }
        };

        const actionData = actionTypes[action] || actionTypes.ban;

        await this.sendDetailedLog(guild, {
            type: actionData.color,
            title: `${actionData.emoji} Üye ${actionData.title}`,
            description: `**${member.user?.tag || member.tag}** ${actionData.title.toLowerCase()}`,
            thumbnail: member.user?.displayAvatarURL() || member.displayAvatarURL?.(),
            fields: [
                { name: '👤 Kullanıcı', value: `${member.user?.tag || member.tag}`, inline: true },
                { name: '🆔 Kullanıcı ID', value: member.id, inline: true },
                { name: '🤖 Bot mu?', value: member.user?.bot ? 'Evet' : 'Hayır', inline: true },
                { name: '👮 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📅 Hesap Oluşturma', value: new Date(member.user?.createdTimestamp || 0).toLocaleDateString('tr-TR'), inline: true },
                { name: '📥 Sunucuya Katılma', value: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor', inline: true },
                { name: '📝 Sebep', value: reason || 'Belirtilmemiş', inline: false },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logMessageDelete(guild, message, executor) {
        const attachmentInfo = message.attachments.size > 0 
            ? `${message.attachments.size} ek dosya` 
            : 'Ek yok';

        await this.sendDetailedLog(guild, {
            type: 'warning',
            title: '🗑️ Mesaj Silindi',
            description: `**${message.author.tag}** tarafından gönderilen mesaj silindi`,
            thumbnail: message.author.displayAvatarURL(),
            fields: [
                { name: '👤 Mesaj Sahibi', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: '🗑️ Silen Kişi', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📢 Kanal', value: `${message.channel}`, inline: true },
                { name: '🆔 Mesaj ID', value: message.id, inline: true },
                { name: '📎 Ekler', value: attachmentInfo, inline: true },
                { name: '📊 Embed Sayısı', value: `${message.embeds.length}`, inline: true },
                { name: '💬 İçerik', value: message.content?.substring(0, 1000) || '[İçerik Yok]', inline: false },
                { name: '⏰ Mesaj Zamanı', value: new Date(message.createdTimestamp).toLocaleString('tr-TR'), inline: true },
                { name: '⏰ Silinme Zamanı', value: new Date().toLocaleString('tr-TR'), inline: true }
            ]
        });
    }

    async logGuildUpdate(guild, oldGuild, newGuild, executor) {
        const changes = [];
        
        if (oldGuild.name !== newGuild.name) {
            changes.push({ name: '📝 İsim Değişti', value: `${oldGuild.name} → ${newGuild.name}`, inline: false });
        }
        
        if (oldGuild.iconURL() !== newGuild.iconURL()) {
            changes.push({ name: '🖼️ İkon Değişti', value: 'Sunucu ikonu güncellendi', inline: false });
        }
        
        if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
            changes.push({ name: '🔗 Özel URL', value: `${oldGuild.vanityURLCode || 'Yok'} → ${newGuild.vanityURLCode || 'Yok'}`, inline: false });
        }

        if (oldGuild.description !== newGuild.description) {
            changes.push({ name: '📄 Açıklama', value: 'Sunucu açıklaması değişti', inline: false });
        }

        if (changes.length === 0) return;

        await this.sendDetailedLog(guild, {
            type: 'info',
            title: '⚙️ Sunucu Güncellendi',
            description: `**${newGuild.name}** sunucusunda değişiklikler yapıldı`,
            thumbnail: newGuild.iconURL(),
            fields: [
                { name: '👤 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📊 Değişiklik Sayısı', value: `${changes.length}`, inline: true },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: true },
                ...changes
            ]
        });
    }

    async logEmojiChange(guild, emoji, action, executor) {
        await this.sendDetailedLog(guild, {
            type: action === 'create' ? 'success' : 'danger',
            title: `😀 Emoji ${action === 'create' ? 'Eklendi' : 'Silindi'}`,
            description: `**${emoji.name}** emojisi ${action === 'create' ? 'eklendi' : 'silindi'}`,
            thumbnail: emoji.url,
            fields: [
                { name: '😀 Emoji Adı', value: emoji.name, inline: true },
                { name: '🆔 Emoji ID', value: emoji.id, inline: true },
                { name: '🎭 Animasyonlu', value: emoji.animated ? 'Evet' : 'Hayır', inline: true },
                { name: '👤 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '🔗 URL', value: emoji.url || 'Yok', inline: false },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logWebhookChange(guild, webhook, action, executor) {
        await this.sendDetailedLog(guild, {
            type: action === 'create' ? 'warning' : 'danger',
            title: `🔗 Webhook ${action === 'create' ? 'Oluşturuldu' : 'Silindi'}`,
            description: `**${webhook.name}** webhook'u ${action === 'create' ? 'oluşturuldu' : 'silindi'}`,
            thumbnail: webhook.avatarURL(),
            fields: [
                { name: '🔗 Webhook Adı', value: webhook.name, inline: true },
                { name: '🆔 Webhook ID', value: webhook.id, inline: true },
                { name: '📢 Kanal', value: `<#${webhook.channelId}>`, inline: true },
                { name: '👤 İşlemi Yapan', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '⚠️ Güvenlik', value: 'Webhook\'lar potansiyel güvenlik riski oluşturabilir', inline: false },
                { name: '⏰ İşlem Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logBotAdd(guild, bot, executor) {
        const botPerms = bot.permissions?.toArray().slice(0, 10).join(', ') || 'Yok';

        await this.sendDetailedLog(guild, {
            type: 'danger',
            title: '🤖 Bot Eklendi',
            description: `**${bot.user.tag}** botu sunucuya eklendi`,
            thumbnail: bot.user.displayAvatarURL(),
            fields: [
                { name: '🤖 Bot Adı', value: bot.user.tag, inline: true },
                { name: '🆔 Bot ID', value: bot.id, inline: true },
                { name: '👤 Ekleyen', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📅 Bot Oluşturma', value: new Date(bot.user.createdTimestamp).toLocaleDateString('tr-TR'), inline: true },
                { name: '✅ Doğrulanmış', value: bot.user.flags?.has('VerifiedBot') ? 'Evet' : 'Hayır', inline: true },
                { name: '🔐 İzinler', value: botPerms, inline: false },
                { name: '⚠️ Uyarı', value: 'Bilinmeyen botlar güvenlik riski oluşturabilir', inline: false },
                { name: '⏰ Eklenme Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }

    async logSpamDetection(guild, user, spamType, count) {
        const spamTypes = {
            message: { emoji: '💬', name: 'Mesaj Spam' },
            url: { emoji: '🔗', name: 'URL Spam' },
            mention: { emoji: '@', name: 'Mention Spam' },
            emoji: { emoji: '😀', name: 'Emoji Spam' },
            invite: { emoji: '📨', name: 'Davet Spam' }
        };

        const spam = spamTypes[spamType] || spamTypes.message;

        await this.sendDetailedLog(guild, {
            type: 'danger',
            title: `${spam.emoji} ${spam.name} Tespit Edildi`,
            description: `**${user.tag}** spam yapıyor ve cezalandırıldı`,
            thumbnail: user.displayAvatarURL(),
            fields: [
                { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
                { name: '📊 Spam Türü', value: spam.name, inline: true },
                { name: '🔢 İşlem Sayısı', value: `${count}`, inline: true },
                { name: '⏱️ Zaman Dilimi', value: '10 saniye', inline: true },
                { name: '⚖️ Ceza', value: 'Yetkiler alındı ve yasaklandı', inline: true },
                { name: '🛡️ Koruma', value: 'Guard V3 Otomatik', inline: true },
                { name: '⏰ Tespit Zamanı', value: new Date().toLocaleString('tr-TR'), inline: false }
            ]
        });
    }
}

module.exports = AdvancedLogger;
