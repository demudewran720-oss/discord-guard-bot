# Değişiklik Günlüğü

## [3.1.0] - 2024

### ✅ Düzeltmeler

#### Whitelist Sistemi Kalıcı Hale Getirildi
- **Sorun**: Whitelist'e eklenen kullanıcılar bot yeniden başlatıldığında kayboluyor
- **Çözüm**: JSON dosya sistemi eklendi
- **Değişiklikler**:
  - `utils/whitelistManager.js` eklendi - JSON okuma/yazma işlemleri
  - `config.js` güncellendi - JSON'dan veri yükleme
  - `commands/whitelist.js` güncellendi - Her değişiklikte JSON güncelleme
  - `data/whitelist.json` otomatik oluşturuluyor
  - `.gitignore`'a `data/` klasörü eklendi

#### Özellikler:
- ✅ Kalıcı veri saklama
- ✅ Bot yeniden başlatıldığında veriler korunur
- ✅ .env'deki SAFE_USERS ilk başlatmada JSON'a aktarılır
- ✅ Hata durumlarında güvenli çalışma
- ✅ Aynı kullanıcı birden fazla eklenemez

### 🚀 Yeni Özellikler

#### Deploy Commands Sistemi Eklendi
- **Sorun**: Slash komutlar Discord'a manuel yüklenmiyor
- **Çözüm**: Otomatik deploy sistemi
- **Değişiklikler**:
  - `deploy-commands.js` eklendi
  - `package.json`'a `npm run deploy` script'i eklendi

#### Özellikler:
- ✅ Tüm komutları otomatik tarar
- ✅ Discord API'ye yükler
- ✅ Hata yönetimi
- ✅ Başarı/hata mesajları

### 📝 Dokümantasyon

- README.md güncellendi
- Whitelist sorunu ve çözümü eklendi
- Deploy commands kullanımı eklendi
- Proje yapısı güncellendi
- Kurulum adımları güncellendi

## Kullanım

### Whitelist Sistemi
```bash
# Bot ilk kez başlatıldığında .env'deki veriler JSON'a aktarılır
npm start

# Whitelist'e kullanıcı ekle
/whitelist ekle @kullanıcı

# Bot yeniden başlatıldığında veriler korunur
npm start
```

### Deploy Commands
```bash
# Komutları Discord'a yükle
npm run deploy

# Veya
node deploy-commands.js
```

## Teknik Detaylar

### Whitelist JSON Formatı
```json
{
  "safeUsers": ["user_id_1", "user_id_2"],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Dosya Konumları
- Whitelist: `data/whitelist.json`
- Deploy Script: `deploy-commands.js`
- Whitelist Manager: `utils/whitelistManager.js`

## Geriye Dönük Uyumluluk

- ✅ Mevcut .env dosyaları çalışmaya devam eder
- ✅ İlk başlatmada otomatik migration
- ✅ Eski komutlar aynı şekilde çalışır
