# 🛡️ Discord Guard V3 Bot

Modern ve güçlü Discord sunucu koruma botu. **16 farklı koruma türü** ile eşsiz güvenlik.

---

## � Hızlı Kurulum (3 Adım)

### 1️⃣ Projeyi İndir ve Kur
```bash
git clone <repo-url>
cd discord-guard-v3
npm install
```

### 2️⃣ .env Dosyasını Oluştur
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Sonra `.env` dosyasını aç ve doldur:
```env
TOKEN=bot_token_buraya
CLIENT_ID=bot_client_id
GUILD_ID=sunucu_id
OWNER_ID=owner_id
LOG_CHANNEL_ID=log_kanal_id
GUARD_ENABLED=true
```

### 3️⃣ Botu Başlat
```bash
# Önce komutları Discord'a yükle
npm run deploy

# Sonra botu başlat
npm start
```

**Bot hazır!** Sunucunda `/guard durum` komutunu kullan.

---

## 📋 Bot Nasıl Oluşturulur?

1. [Discord Developer Portal](https://discord.com/developers/applications) → "New Application"
2. Bot sekmesi → "Add Bot" → Token'ı kopyala
3. **Intents'leri aç**: Server Members, Message Content, Presence
4. OAuth2 → URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (veya gerekli izinler)
5. Oluşan URL ile botu sunucuna ekle

**ID'leri nasıl alırım?**
- Discord Ayarlar → Gelişmiş → Geliştirici Modu (aç)
- Artık her şeye sağ tıklayıp "ID'yi Kopyala" yapabilirsin

---

## 🛡️ Koruma Özellikleri

### 🔐 Temel Korumalar
✅ Bot Ekleme Koruması (whitelist desteği)  
✅ Rol Oluşturma/Silme Koruması  
✅ Kanal Oluşturma/Silme Koruması  
✅ Yasaklama/Atma Koruması  

### 💬 Mesaj Korumaları (YENİ!)
✅ Mesaj Spam Koruması (5 mesaj/10sn)  
✅ URL/Link Spam Koruması (3 link/10sn)  
✅ Mention Spam Koruması (5+ etiket tetikler)  
✅ Emoji Spam Koruması (10+ emoji tetikler)  
✅ Davet Linki Spam Koruması (2 davet/10sn)  
✅ **Mesaj Silme Koruması** - Silinen mesaj + son 10 mesajı HTML olarak kaydeder! 🔥  

### 🎨 Sunucu Korumaları (YENİ!)
✅ Emoji/Sticker Silme Koruması  
✅ Webhook Koruması  
✅ Sunucu Güncelleme Koruması  

**Toplam: 17 farklı koruma türü!**

### 🔥 ÖZEL ÖZELLİK: HTML Mesaj Geçmişi
Bir mesaj silindiğinde:
- Silinen mesaj + son 10 mesaj HTML dosyası olarak kaydedilir
- Güzel tasarımlı, okunabilir format
- Avatar, tarih, içerik, ekler dahil
- Silinen mesaj vurgulanır
- Log kanalına otomatik gönderilir

---

## 💻 Komutlar

```
/guard durum          Guard durumunu göster
/guard ac             Guard'ı aktif et
/guard kapat          Guard'ı kapat

/koruma liste         Tüm korumaları ve limitleri göster
/koruma test          Sistemi test et

/whitelist ekle       Güvenli kullanıcı ekle
/whitelist cikar      Güvenli kullanıcı çıkar
/whitelist liste      Güvenli kullanıcıları listele

/info                 Bot bilgileri
/yardim               Komut listesi
/ping                 Ping testi
```

---

## ⚙️ Yapılandırma (.env)

### Zorunlu Ayarlar
```env
TOKEN=bot_token                    # Bot token'ı
CLIENT_ID=bot_client_id            # Bot ID
GUILD_ID=sunucu_id                 # Sunucu ID
OWNER_ID=owner_id                  # Sunucu sahibi ID
LOG_CHANNEL_ID=log_kanal_id        # Log kanalı ID
GUARD_ENABLED=true                 # Guard aktif mi?
```

### Opsiyonel Ayarlar
```env
# Güvenli kullanıcılar ve roller (virgülle ayır)
ADMIN_ROLES=rol_id1,rol_id2
SAFE_USERS=user_id1,user_id2
WHITELISTED_BOTS=bot_id1,bot_id2

# Koruma limitleri (10 saniye içinde)
MAX_ROLE_CREATE=3
MAX_ROLE_DELETE=3
MAX_CHANNEL_CREATE=5
MAX_CHANNEL_DELETE=5
MAX_BAN=3
MAX_KICK=3
MAX_MESSAGE_SPAM=5
MAX_URL_SPAM=3
MAX_MENTION_SPAM=2
MAX_EMOJI_SPAM=3
MAX_INVITE_SPAM=2
MAX_WEBHOOK_CREATE=2
MAX_GUILD_UPDATE=3
MAX_EMOJI_DELETE=3
MAX_STICKER_DELETE=3
```

---

## 🎯 Nasıl Çalışır?

1. **İzleme**: Bot, Discord audit log'larını ve mesajları takip eder
2. **Analiz**: 10 saniye içindeki işlem sayısını kontrol eder
3. **Koruma**: Limit aşılırsa:
   - İşlemi geri alır (rol/kanal siler, mesajı siler, vb.)
   - Kullanıcının tehlikeli yetkilerini alır
   - Kullanıcıyı sunucudan yasaklar
   - Log kanalına detaylı bildirim gönderir

### Güvenlik Katmanları
1. **Owner** → Hiçbir koruma uygulanmaz
2. **Admin Rolleri** → Korumalardan muaf
3. **Whitelist Kullanıcılar** → Korumalardan muaf
4. **Diğer Herkes** → Tüm korumalar aktif

---

## 📁 Proje Yapısı

```
discord-guard-v3/
├── commands/          # 6 slash komut
│   ├── guard.js
│   ├── koruma.js
│   ├── whitelist.js
│   ├── info.js
│   ├── yardım.js
│   └── ping.js
├── events/
│   ├── client/        # Bot event'leri (ready, interaction)
│   └── guard/         # 12 koruma event'i
├── handlers/          # Komut ve event yükleyiciler
├── utils/             # Yardımcı fonksiyonlar
│   ├── guardUtils.js
│   ├── whitelistManager.js  # Whitelist JSON yönetimi
│   ├── advancedLogger.js
│   └── htmlGenerator.js
├── data/              # Kalıcı veriler (gitignore'da)
│   └── whitelist.json # Whitelist kullanıcıları
├── config.js          # Yapılandırma
├── index.js           # Ana dosya
└── deploy-commands.js # Komut deploy sistemi
```

---

## 🔧 Sorun Giderme

### Bot çevrimiçi olmuyor
- Token doğru mu kontrol et
- Intents'leri açtın mı? (Developer Portal)
- Konsol hatalarına bak

### Slash komutlar görünmüyor
- CLIENT_ID ve GUILD_ID doğru mu?
- 5-10 dakika bekle (Discord cache)
- Botu sunucudan at ve tekrar ekle

### Guard çalışmıyor
- `GUARD_ENABLED=true` olmalı
- Bot'un gerekli izinleri var mı?
- Bot rolü, korunacak rollerden ÜSTTE mi?

### Log mesajları gelmiyor
- LOG_CHANNEL_ID doğru mu?
- Bot'un kanala mesaj gönderme yetkisi var mı?

---

## 🌟 Öne Çıkan Özellikler

### Neden Guard V3?

✨ **17 Farklı Koruma** - En kapsamlı koruma sistemi  
✨ **HTML Mesaj Geçmişi** - Silinen mesajları güzel HTML formatında kaydet (BENZERSIZ!)  
✨ **Mesaj Korumaları** - Çoğu guard'da yok (spam, url, mention, emoji, davet)  
✨ **Regex Tabanlı** - Gelişmiş pattern matching  
✨ **Component V2** - Modern ve modüler mimari  
✨ **Environment Variables** - GitHub'a güvenli yükleme  
✨ **Otomatik Cezalandırma** - Yetki alma + ban  
✨ **4 Seviyeli Güvenlik** - Owner → Admin → Whitelist → Tracking  
✨ **Detaylı Loglar** - Embed mesajlarla bilgilendirme  
✨ **Kolay Kurulum** - 3 adımda hazır  
✨ **Türkçe Destek** - Komutlar ve loglar Türkçe  

---

## 🔒 Bot İzinleri

Gerekli izinler:
- View Audit Log
- Manage Roles
- Manage Channels
- Kick Members
- Ban Members
- View Channels
- Send Messages
- Embed Links
- Manage Webhooks
- Manage Emojis and Stickers

**Öneri**: Administrator yetkisi ver (tüm izinleri kapsar)

---

## 🚀 Geliştirme

### Yeni Komut Ekle
```javascript
// commands/yenikomut.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yenikomut')
        .setDescription('Açıklama'),
    async execute(interaction, client) {
        // Komut mantığı
    }
};
```

### Yeni Koruma Ekle
```javascript
// events/guard/yenikoruma.js
const { isSafe, trackAction, punishUser, sendLog, createLogEmbed } = require('../../utils/guardUtils');

module.exports = {
    name: 'discordEventName',
    async execute(arg, client) {
        if (!client.config.guardEnabled) return;
        // Koruma mantığı
    }
};
```

Bot'u yeniden başlat, otomatik yüklenir!

---

## 📊 Performans

- **Collection Kullanımı**: O(1) hızlı veri erişimi
- **Audit Log Cache**: Minimum API çağrısı
- **Otomatik Temizleme**: Bellek optimizasyonu
- **Async/Await**: Non-blocking işlemler
- **Error Handling**: Hata durumunda çalışmaya devam

---

## 📝 Notlar

- Bot, güvenli kullanıcıları ve admin rollerine sahip kullanıcıları asla cezalandırmaz
- Tüm koruma işlemleri audit log üzerinden takip edilir
- Spam tespiti 10 saniyelik zaman diliminde yapılır
- Cezalandırılan kullanıcıların tehlikeli yetkileri alınır ve sunucudan yasaklanır
- Whitelist botlar otomatik korunur

---

## 🔄 Güncelleme

```bash
git pull
npm install
npm start
```

---

## ⚠️ Bilinen Sorunlar ve Çözümler

### ✅ Whitelist Sistemi Sorunu (ÇÖZÜLDÜ)

**Sorun**: `/whitelist ekle` komutu ile eklenen kullanıcılar bot yeniden başlatıldığında kayboluyor.

**Neden**: Whitelist verileri sadece bellekte tutuluyor (client.config.safeUsers). Bot yeniden başladığında .env dosyasından tekrar yükleniyor ve değişiklikler kayboluyor.

**Çözüm**: ✅ Whitelist verileri artık `data/whitelist.json` dosyasında kalıcı olarak saklanıyor.

#### Yeni Sistem Özellikleri:
- ✅ Kalıcı veri saklama (JSON dosyası)
- ✅ Bot yeniden başlatıldığında veriler korunur
- ✅ .env'deki SAFE_USERS ilk başlatmada JSON'a aktarılır
- ✅ Hata durumlarında güvenli çalışma
- ✅ Aynı kullanıcı birden fazla eklenemez
- ✅ Otomatik data/ klasörü oluşturma

#### Nasıl Çalışır:
1. Bot ilk kez başlatıldığında `.env`'deki `SAFE_USERS` verileri `data/whitelist.json`'a aktarılır
2. `/whitelist ekle` komutu hem bellekte hem JSON dosyasında güncelleme yapar
3. Bot yeniden başlatıldığında JSON dosyasından veriler yüklenir
4. Artık whitelist değişiklikleri kalıcıdır!

---

## 🚀 Deploy Commands Sistemi (EKLENDİ)

**Sorun**: Slash komutlar Discord'a manuel olarak yüklenmiyor, bazen görünmüyor.

**Çözüm**: ✅ Otomatik komut deploy sistemi eklendi.

### Kullanım:

```bash
# Tüm komutları Discord'a yükle
node deploy-commands.js

# Veya npm script ile
npm run deploy
```

### Özellikler:
- ✅ Tüm komutları otomatik tarar
- ✅ Discord API'ye yükler
- ✅ Global veya guild-specific deploy
- ✅ Hata yönetimi
- ✅ Başarı/hata mesajları

### deploy-commands.js Dosyası:
```javascript
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`${commands.length} komut yükleniyor...`);
        
        // Guild-specific deploy (hızlı test için)
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        
        console.log('✅ Komutlar başarıyla yüklendi!');
    } catch (error) {
        console.error('❌ Hata:', error);
    }
})();
```

### package.json'a ekle:
```json
"scripts": {
    "start": "node index.js",
    "deploy": "node deploy-commands.js"
}
```

---

## 📞 Destek

Sorun yaşıyorsan:
1. Konsol loglarını kontrol et
2. .env dosyasının doğru yapılandırıldığından emin ol
3. Bot izinlerini kontrol et
4. GitHub Issues'da sorun bildir

---

## 📄 Lisans

MIT License

---

## 🎉 Başarılar!

Guard V3 botun artık çalışıyor ve sunucunu koruyor! 🛡️

**İlk adımlar:**
1. `npm run deploy` ile komutları Discord'a yükle
2. `npm start` ile botu başlat
3. `/guard durum` ile sistemi kontrol et
4. `/whitelist ekle @yönetici` ile güvenilir yöneticileri ekle
5. `/koruma liste` ile tüm korumaları gör
6. Test için bir kanal oluştur/sil (limit aşmadan)
7. Log kanalını kontrol et

**Herhangi bir sorun olursa konsol loglarına bak!**
