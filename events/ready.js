// events/ready.js
const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client, bot) {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                🚀 QUESTBOT ADVANCED                      ║
║                                                          ║
║  ✅ Bot connecté: ${client.user.tag.padEnd(35)}║
║  📊 Serveurs: ${client.guilds.cache.size.toString().padEnd(42)}║
║  👥 Utilisateurs: ${client.users.cache.size.toString().padEnd(38)}║
║  🎮 Commandes chargées: ${bot.commands.size.toString().padEnd(30)}║
║  📈 Version: ${bot.database.version.padEnd(42)}║
║                                                          ║
║  🎯 Système d'exploits: ACTIF                           ║
║  🖼️  Canvas: ACTIVÉ                                     ║
║  💾 Base de données: CHARGÉE                            ║
╚══════════════════════════════════════════════════════════╝
        `);

        // Définir l'activité du bot
        const activities = [
            { name: 'les exploits des membres', type: ActivityType.Watching },
            { name: 'le serveur grandir', type: ActivityType.Watching },
            { name: 'les statistiques', type: ActivityType.Competing },
            { name: `${process.env.PREFIX || '!'}help`, type: ActivityType.Listening },
            { name: 'les nouveaux défis', type: ActivityType.Playing }
        ];

        let currentActivity = 0;
        
        // Changer l'activité toutes les 5 minutes
        const updateActivity = () => {
            client.user.setActivity(activities[currentActivity]);
            currentActivity = (currentActivity + 1) % activities.length;
        };

        updateActivity(); // Activité initiale
        setInterval(updateActivity, 5 * 60 * 1000); // 5 minutes

        // Initialiser les statistiques de performance
        bot.stats.uptime = Date.now();
        
        // Envoyer un message de démarrage dans le canal admin si configuré
        const adminLogChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
        if (adminLogChannelId) {
            const adminChannel = client.channels.cache.get(adminLogChannelId);
            if (adminChannel) {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('🚀 QuestBot Advanced - Démarrage')
                    .setDescription(`Le bot a été démarré avec succès !\n\n**Version:** ${bot.database.version}\n**Environnement:** ${process.env.NODE_ENV || 'development'}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                    .setColor('#00FF7F')
                    .setTimestamp();
                
                adminChannel.send({ embeds: [embed] }).catch(console.error);
            }
        }

        // Planifier les sauvegardes automatiques
        if (bot.config?.backup?.enabled) {
            const backupInterval = bot.config.backup.interval || 3600000; // 1 heure par défaut
            setInterval(() => {
                bot.performAutoBackup();
            }, backupInterval);
            
            console.log(`📦 Sauvegardes automatiques planifiées toutes les ${backupInterval / 60000} minutes`);
        }
        
        console.log('🎮 QuestBot Advanced est prêt à traquer les exploits !');
    }
};