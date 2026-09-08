function createMessageHTML(messages, metadata) {
    const formatDate = (date) => {
        return new Date(date).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    
    const formatTime = (date) => {
        return new Date(date).toLocaleString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Count messages per user
    const userStats = {};
    messages.forEach(msg => {
        if (!userStats[msg.author.id]) {
            userStats[msg.author.id] = {
                tag: msg.author.tag,
                count: 0
            };
        }
        userStats[msg.author.id].count++;
    });
    
    const userStatsHTML = Object.entries(userStats)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([id, data]) => `${data.count} - ${escapeHtml(data.tag)} (${id})`)
        .join('\n     ');
    
    const messagesHTML = messages.map(msg => {
        const isDeleted = msg.deleted ? 'deleted-message' : '';
        const deletedBadge = msg.deleted ? '<span class="deleted-badge">🗑️ SİLİNEN MESAJ</span>' : '';
        
        let attachmentsHTML = '';
        if (msg.attachments && msg.attachments.length > 0) {
            attachmentsHTML = '<div class="attachments">' +
                msg.attachments.map(att => {
                    const isImage = att.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    if (isImage) {
                        return `<div class="attachment-image">
                            <img src="${att.url}" alt="${att.name}" loading="lazy">
                            <div class="attachment-info">📎 ${att.name} (${(att.size / 1024).toFixed(2)} KB)</div>
                        </div>`;
                    }
                    return `<div class="attachment-file">📎 ${att.name} (${(att.size / 1024).toFixed(2)} KB)</div>`;
                }).join('') +
                '</div>';
        }
        
        let embedsHTML = '';
        if (msg.embeds && msg.embeds.length > 0) {
            embedsHTML = '<div class="embeds-info">📋 ' + msg.embeds.length + ' Embed içeriği</div>';
        }
        
        return `
            <div class="message ${isDeleted}" data-message-id="${msg.id}">
                <div class="message-side">
                    <img src="${msg.author.avatar}" alt="${msg.author.tag}" class="avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                    <span class="message-time">${formatTime(msg.createdAt)}</span>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="author">${escapeHtml(msg.author.tag)}</span>
                        <span class="author-id">${msg.author.id}</span>
                        <span class="timestamp">${formatDate(msg.createdAt)}</span>
                        ${deletedBadge}
                    </div>
                    <div class="message-text">${escapeHtml(msg.content) || '<em class="no-content">[İçerik Yok]</em>'}</div>
                    ${attachmentsHTML}
                    ${embedsHTML}
                </div>
            </div>
        `;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guard V3 - Mesaj Transcript</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #36393f;
            color: #dcddde;
            line-height: 1.6;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: #36393f;
        }
        
        .header {
            background: #202225;
            padding: 20px 30px;
            border-bottom: 1px solid #202225;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        
        .header-title h1 {
            font-size: 24px;
            font-weight: 600;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .shield-icon {
            font-size: 32px;
            filter: drop-shadow(0 0 10px rgba(255, 68, 68, 0.5));
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            background: #2f3136;
            padding: 15px;
            border-radius: 8px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #b9bbbe;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 14px;
            color: #dcddde;
            word-break: break-word;
        }
        
        .info-value.highlight {
            color: #ff4444;
            font-weight: 600;
        }
        
        .user-stats {
            background: #2f3136;
            padding: 20px;
            margin: 20px 30px;
            border-radius: 8px;
            border-left: 4px solid #5865f2;
        }
        
        .user-stats-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            color: #b9bbbe;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        
        .user-stats-content {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            color: #dcddde;
            white-space: pre-wrap;
            line-height: 1.8;
        }
        
        .messages {
            padding: 20px 30px;
        }
        
        .message {
            display: flex;
            gap: 15px;
            padding: 8px 0;
            position: relative;
            transition: background 0.1s ease;
        }
        
        .message:hover {
            background: rgba(4, 4, 5, 0.07);
        }
        
        .message.deleted-message {
            background: rgba(255, 68, 68, 0.1);
            border-left: 4px solid #ff4444;
            padding-left: 12px;
            margin-left: -16px;
            animation: highlight-pulse 2s ease-in-out infinite;
        }
        
        @keyframes highlight-pulse {
            0%, 100% { background: rgba(255, 68, 68, 0.1); }
            50% { background: rgba(255, 68, 68, 0.2); }
        }
        
        .message-side {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            width: 50px;
            flex-shrink: 0;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            flex-shrink: 0;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .avatar:hover {
            transform: scale(1.1);
        }
        
        .message-time {
            font-size: 10px;
            color: #72767d;
            font-weight: 500;
        }
        
        .message-content {
            flex: 1;
            min-width: 0;
        }
        
        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            flex-wrap: wrap;
        }
        
        .author {
            font-weight: 600;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
        }
        
        .author:hover {
            text-decoration: underline;
        }
        
        .author-id {
            color: #72767d;
            font-size: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            background: rgba(0, 0, 0, 0.2);
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .timestamp {
            color: #72767d;
            font-size: 12px;
            margin-left: auto;
        }
        
        .deleted-badge {
            background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            animation: badge-pulse 2s ease-in-out infinite;
            box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
        }
        
        @keyframes badge-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .message-text {
            color: #dcddde;
            line-height: 1.5;
            word-wrap: break-word;
            font-size: 15px;
        }
        
        .no-content {
            color: #72767d;
            font-style: italic;
        }
        
        .attachments {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .attachment-image {
            max-width: 400px;
            border-radius: 8px;
            overflow: hidden;
            background: #2f3136;
        }
        
        .attachment-image img {
            width: 100%;
            height: auto;
            display: block;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .attachment-image img:hover {
            transform: scale(1.02);
        }
        
        .attachment-info,
        .attachment-file {
            padding: 8px 12px;
            background: #2f3136;
            border-radius: 4px;
            color: #00aff4;
            font-size: 13px;
            display: inline-block;
            margin-top: 4px;
        }
        
        .attachment-file {
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .attachment-file:hover {
            background: #36393f;
        }
        
        .embeds-info {
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(88, 101, 242, 0.1);
            border-left: 4px solid #5865f2;
            border-radius: 4px;
            color: #00aff4;
            font-size: 13px;
            display: inline-block;
        }
        
        .footer {
            background: #202225;
            padding: 20px 30px;
            text-align: center;
            color: #72767d;
            font-size: 13px;
            border-top: 1px solid #202225;
            margin-top: 30px;
        }
        
        .footer-brand {
            color: #5865f2;
            font-weight: 700;
        }
        
        .footer-warning {
            margin-top: 10px;
            padding: 12px;
            background: rgba(255, 68, 68, 0.1);
            border-left: 4px solid #ff4444;
            border-radius: 4px;
            color: #ff4444;
            font-size: 12px;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 14px;
        }
        
        ::-webkit-scrollbar-track {
            background: #2f3136;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #202225;
            border-radius: 8px;
            border: 3px solid #2f3136;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #18191c;
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
                color: black;
            }
            
            .header, .footer {
                background: #f5f5f5;
            }
            
            .message:hover {
                background: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-title">
                <span class="shield-icon">🛡️</span>
                <h1>Guard V3 - Mesaj Silme Transcript</h1>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">🏰 Sunucu</div>
                    <div class="info-value">${escapeHtml(metadata.guildName)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">📢 Kanal</div>
                    <div class="info-value">#${escapeHtml(metadata.channelName)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">🗑️ Mesajı Silen</div>
                    <div class="info-value highlight">${escapeHtml(metadata.deletedBy)} (${metadata.deletedById})</div>
                </div>
                <div class="info-item">
                    <div class="info-label">⏰ Kayıt Zamanı</div>
                    <div class="info-value">${formatDate(new Date())}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">📊 Toplam Mesaj</div>
                    <div class="info-value">${messages.length} mesaj kaydedildi</div>
                </div>
                <div class="info-item">
                    <div class="info-label">👥 Kullanıcı Sayısı</div>
                    <div class="info-value">${Object.keys(userStats).length} farklı kullanıcı</div>
                </div>
            </div>
        </div>
        
        <div class="user-stats">
            <div class="user-stats-title">👥 Kullanıcı İstatistikleri</div>
            <div class="user-stats-content">${userStatsHTML}</div>
        </div>
        
        <div class="messages">
            ${messagesHTML}
        </div>
        
        <div class="footer">
            <div>
                <span class="footer-brand">Guard V3</span> tarafından otomatik oluşturuldu
            </div>
            <div style="margin-top: 8px; font-size: 12px;">
                Bu transcript, mesaj silme olayını ve önceki mesaj geçmişini içerir
            </div>
            <div class="footer-warning">
                ⚠️ Bu kayıt, güvenlik amaçlı oluşturulmuştur ve yetkisiz paylaşımı yasaktır
            </div>
        </div>
    </div>
    
    <script>
        // Image click to open in new tab
        document.querySelectorAll('.attachment-image img').forEach(img => {
            img.addEventListener('click', () => {
                window.open(img.src, '_blank');
            });
        });
        
        // Copy message ID on avatar click
        document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => {
                const messageId = e.target.closest('.message').dataset.messageId;
                navigator.clipboard.writeText(messageId).then(() => {
                    alert('Mesaj ID kopyalandı: ' + messageId);
                });
            });
        });
    </script>
</body>
</html>`;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = { createMessageHTML };
