const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('📦 Komutlar yükleniyor...\n');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    console.log(`✓ ${command.data.name} komutu yüklendi`);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`\n🚀 ${commands.length} komut Discord'a aktarılıyor...\n`);
        
        // Guild-specific deploy (hızlı test için)
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        
        console.log('✅ Komutlar başarıyla Discord\'a yüklendi!');
        console.log('💡 Sunucuda slash komutları kullanabilirsiniz.\n');
    } catch (error) {
        console.error('❌ Komut yükleme hatası:', error);
    }
})();
