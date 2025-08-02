
// commands/utility/info.js
const { EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');

module.exports = {
    data: {
        name: 'info',
        description: 'Informations détaillées sur le bot',
        aliases: ['infos', 'botinfo', 'about'],
        usage: '',
        category: 'utility',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const uptime = Date.now() - bot.stats.uptime;
        const memoryUsage = process.memoryUsage();
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 Informations sur QuestBot Advanced')
            .setDescription(`Bot de gamification et tracking d'exploits pour Discord\n\n**Développé avec ❤️ pour ${message.guild.name}**`)
            .setThumbnail(bot.client.user.displayAvatarURL())
            .setColor('#FFD700')
            .addFields([
                {
                    name: '📊 Statistiques',
                    value: `**Serveurs:** ${bot.client.guilds.cache.size}\n**Utilisateurs:** ${bot.client.users.cache.size}\n**Canaux:** ${bot.client.channels.cache.size}\n**Commandes:** ${bot.commands.size}`,
                    inline: true
                },
                {
                    name: '🎮 Activité',
                    value: `**Messages traités:** ${bot.formatNumber(bot.stats.messagesProcessed)}\n**Exploits débloqués:** ${bot.formatNumber(bot.stats.achievementsUnlocked)}\n**Commandes exécutées:** ${bot.formatNumber(bot.stats.commandsExecuted)}\n**Uptime:** ${this.formatUptime(uptime)}`,
                    inline: true
                },
                {
                    name: '💾 Système',
                    value: `**RAM:** ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n**OS:** ${os.platform()} ${os.arch()}\n**Node.js:** ${process.version}\n**Discord.js:** v${djsVersion}`,
                    inline: true
                },
                {
                    name: '🏆 Exploits configurés',
                    value: this.getAchievementsInfo(bot),
                    inline: false
                },
                {
                    name: '🔗 Liens utiles',
                    value: `[**Code source**](${process.env.GITHUB_REPO_URL || 'https://github.com'})\n[**Support**](${process.env.SUPPORT_URL || 'N/A'})\n[**Invite**](${process.env.INVITE_URL || 'N/A'})`,
                    inline: false
                }
            ])
            .setFooter({ 
                text: `Version ${bot.database.version} • Développé avec Discord.js` 
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}j ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    },

    getAchievementsInfo(bot) {
        const achievements = bot.achievements || {};
        const categories = Object.keys(achievements);
        const totalAchievements = Object.values(achievements).reduce((total, category) => total + category.length, 0);
        
        return `**${totalAchievements}** exploits répartis en **${categories.length}** catégories\n${categories.map(cat => `• ${bot.categories?.[cat]?.emoji || '🏆'} ${bot.categories?.[cat]?.name || cat}: ${achievements[cat].length}`).join('\n')}`;
    }
};