

// commands/user/achievements.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'achievements',
        description: 'Affiche tous les exploits disponibles',
        aliases: ['exploits', 'quests', 'quêtes'],
        usage: '[catégorie]',
        category: 'user',
        cooldown: 15000
    },

    async execute(message, args, bot) {
        const category = args[0]?.toLowerCase();
        const categories = Object.keys(bot.achievements);
        
        if (category && !categories.includes(category)) {
            const availableCategories = categories.map(cat => `\`${cat}\``).join(', ');
            return message.reply(`❌ Catégorie inconnue. Catégories disponibles: ${availableCategories}`);
        }
        
        const targetCategory = category || categories[0];
        const achievements = bot.achievements[targetCategory];
        const userData = bot.getUserData(message.author.id, message.guild.id);
        
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Exploits - ${bot.categories[targetCategory]?.name || targetCategory}`)
            .setDescription(`${bot.categories[targetCategory]?.description || 'Liste des exploits'}\n\n${bot.categories[targetCategory]?.emoji || '🏆'} **${achievements.length}** exploits dans cette catégorie`)
            .setColor(bot.categories[targetCategory]?.color || '#FFD700')
            .setThumbnail(message.guild.iconURL());
        
        // Afficher les exploits avec progression
        let description = '';
        achievements.forEach((achievement, index) => {
            const achievementId = `${targetCategory}_${achievement.id}`;
            const isUnlocked = userData.achievements.includes(achievementId);
            const currentProgress = this.getCurrentProgress(userData, targetCategory, achievement);
            const progressBar = this.createProgressBar(currentProgress, achievement.requirement);
            const percentage = Math.min(Math.round((currentProgress / achievement.requirement) * 100), 100);
            
            const statusEmoji = isUnlocked ? '✅' : percentage >= 100 ? '🎯' : '⏳';
            const rarity = bot.config?.rarities?.[achievement.rarity];
            const rarityEmoji = rarity?.emoji || '';
            
            description += `${statusEmoji} **${achievement.name}** ${achievement.emoji || ''} ${rarityEmoji}\n`;
            description += `${achievement.description || 'Pas de description'}\n`;
            description += `${progressBar} ${bot.formatNumber(currentProgress)}/${bot.formatNumber(achievement.requirement)} (${percentage}%)\n`;
            if (achievement.xp) description += `💫 **${achievement.xp} XP**\n`;
            description += '\n';
        });
        
        embed.setDescription(embed.data.description + '\n\n' + description);
        
        // Boutons de navigation entre catégories
        const row = new ActionRowBuilder();
        const currentIndex = categories.indexOf(targetCategory);
        
        if (categories.length > 1) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`achievements_${categories[currentIndex - 1] || categories[categories.length - 1]}`)
                    .setLabel('◀ Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(categories.length <= 1),
                new ButtonBuilder()
                    .setCustomId(`achievements_overview`)
                    .setLabel('📋 Vue d\'ensemble')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`achievements_${categories[currentIndex + 1] || categories[0]}`)
                    .setLabel('Suivant ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(categories.length <= 1)
            );
        }
        
        const components = row.components.length > 0 ? [row] : [];
        await message.reply({ embeds: [embed], components });
    },

    getCurrentProgress(userData, category, achievement) {
        switch (category) {
            case 'messages':
                return userData.messagesCount;
            case 'reactions':
                return achievement.type === 'given' ? userData.reactionsGiven : userData.reactionsReceived;
            case 'voice':
                return userData.voiceTime;
            case 'events':
                return userData.eventsParticipated;
            case 'camera':
                return userData.cameraTime;
            case 'stream':
                return userData.streamTime;
            case 'boosts':
                return userData.boosts;
            case 'congratulations':
                return achievement.type === 'sent' ? userData.congratulationsSent : userData.congratulationsReceived;
            default:
                return 0;
        }
    },

    createProgressBar(current, max, length = 10) {
        const percentage = Math.min(current / max, 1);
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }
};