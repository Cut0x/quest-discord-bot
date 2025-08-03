// events/ready.js - Événement ready moderne
const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client, bot) {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                🚀 QUESTBOT ADVANCED v3.0                ║
║                     MODERN EDITION                       ║
║                                                          ║
║  ✅ Bot connected: ${client.user.tag.padEnd(35)}║
║  📊 Servers: ${client.guilds.cache.size.toString().padEnd(42)}║
║  👥 Users: ${client.users.cache.size.toString().padEnd(44)}║
║  🎮 Commands loaded: ${bot.commands.size.toString().padEnd(32)}║
║  📈 Version: ${bot.database.version.padEnd(42)}║
║                                                          ║
║  🎨 Modern Canvas: ENABLED                              ║
║  🖼️  Glassmorphism: ACTIVE                              ║
║  🏆 Achievement System: ACTIVE                          ║
║  💾 Database: LOADED                                    ║
╚══════════════════════════════════════════════════════════╝
        `);

        const activities = [
            { name: 'Modern Statistics', type: ActivityType.Watching },
            { name: 'Canvas Art Generation', type: ActivityType.Creating },
            { name: 'Achievement Progress', type: ActivityType.Competing },
            { name: `${process.env.PREFIX || '!'}help`, type: ActivityType.Listening },
            { name: 'Beautiful Visuals', type: ActivityType.Playing }
        ];

        let currentActivity = 0;
        
        const updateActivity = () => {
            client.user.setActivity(activities[currentActivity]);
            currentActivity = (currentActivity + 1) % activities.length;
        };

        updateActivity();
        setInterval(updateActivity, 5 * 60 * 1000);

        bot.stats.uptime = Date.now();
        
        const adminLogChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
        if (adminLogChannelId) {
            const adminChannel = client.channels.cache.get(adminLogChannelId);
            if (adminChannel) {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('🚀 QuestBot Advanced v3.0 - Started')
                    .setDescription(`Modern Canvas Edition successfully started!\n\n**Version:** ${bot.database.version}\n**Environment:** ${process.env.NODE_ENV || 'development'}\n**Features:** Modern Canvas, Glassmorphism, Advanced Stats\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                    .setColor('#4ade80')
                    .setTimestamp();
                
                adminChannel.send({ embeds: [embed] }).catch(console.error);
            }
        }
        
        console.log('🎨 QuestBot Advanced Modern Edition is ready to generate beautiful visuals!');
    }
};