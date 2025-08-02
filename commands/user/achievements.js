// commands/user/achievements.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'achievements',
        description: 'Affiche tous les exploits disponibles ou vos exploits',
        aliases: ['exploits', 'quests', 'quêtes', 'ach'],
        usage: '[catégorie|@utilisateur]',
        category: 'user',
        cooldown: 15000
    },

    async execute(message, args, bot) {
        // Déterminer si c'est un utilisateur ou une catégorie
        let targetUser = message.author;
        let category = null;

        if (args[0]) {
            const mention = message.mentions.users.first();
            if (mention) {
                targetUser = mention;
            } else if (Object.keys(bot.achievements).includes(args[0].toLowerCase())) {
                category = args[0].toLowerCase();
            } else {
                return message.reply(`❌ Catégorie inconnue. Catégories disponibles: ${Object.keys(bot.achievements).map(c => `\`${c}\``).join(', ')}`);
            }
        }

        const userData = bot.getUserData(targetUser.id, message.guild.id);
        
        if (category) {
            return this.showCategoryAchievements(message, category, userData, bot);
        } else {
            return this.showUserAchievements(message, targetUser, userData, bot);
        }
    },

    async showCategoryAchievements(message, category, userData, bot) {
        const achievements = bot.achievements[category];
        const categoryInfo = bot.categories[category];
        
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Exploits - ${categoryInfo?.name || category}`)
            .setDescription(`${categoryInfo?.description || 'Liste des exploits'}\n\n${categoryInfo?.emoji || '🏆'} **${achievements.length}** exploits dans cette catégorie`)
            .setColor(categoryInfo?.color || '#FFD700')
            .setThumbnail(message.guild.iconURL());
        
        let description = '';
        achievements.forEach((achievement) => {
            const achievementId = `${category}_${achievement.id}`;
            const isUnlocked = userData.achievements.includes(achievementId);
            const currentProgress = this.getCurrentProgress(userData, category, achievement);
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
        
        // Boutons de navigation
        const categories = Object.keys(bot.achievements);
        const currentIndex = categories.indexOf(category);
        
        const row = new ActionRowBuilder();
        if (categories.length > 1) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`achievements_${categories[currentIndex - 1] || categories[categories.length - 1]}`)
                    .setLabel('◀ Précédent')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('achievements_overview')
                    .setLabel('📋 Vue d\'ensemble')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`achievements_${categories[currentIndex + 1] || categories[0]}`)
                    .setLabel('Suivant ▶')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        
        const components = row.components.length > 0 ? [row] : [];
        await message.reply({ embeds: [embed], components });
    },

    async showUserAchievements(message, targetUser, userData, bot) {
        const totalAchievements = Object.values(bot.achievements).flat().length;
        const unlockedAchievements = userData.achievements;
        const completionRate = Math.round((unlockedAchievements.length / totalAchievements) * 100);

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Exploits de ${targetUser.displayName}`)
            .setDescription(`Progression des exploits sur **${message.guild.name}**`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setColor('#FFD700')
            .addFields([
                {
                    name: '📊 Progression globale',
                    value: `**Exploits débloqués:** ${unlockedAchievements.length}/${totalAchievements}\n**Taux de complétion:** ${completionRate}%\n**Niveau:** ${userData.level} (${bot.formatNumber(userData.experience)} XP)`,
                    inline: false
                }
            ]);

        // Afficher les exploits par catégorie
        for (const [categoryName, achievements] of Object.entries(bot.achievements)) {
            const categoryAchievements = achievements.filter(ach => 
                unlockedAchievements.includes(`${categoryName}_${ach.id}`)
            );
            
            const categoryInfo = bot.categories[categoryName];
            const categoryProgress = `${categoryAchievements.length}/${achievements.length}`;
            
            if (categoryAchievements.length > 0) {
                const achievementsList = categoryAchievements
                    .slice(0, 5) // Limiter à 5 pour éviter les messages trop longs
                    .map(ach => `${ach.emoji || '🏆'} ${ach.name}`)
                    .join('\n');
                
                embed.addFields({
                    name: `${categoryInfo?.emoji || '🏆'} ${categoryInfo?.name || categoryName} (${categoryProgress})`,
                    value: achievementsList + (categoryAchievements.length > 5 ? `\n... et ${categoryAchievements.length - 5} autre(s)` : ''),
                    inline: true
                });
            } else {
                embed.addFields({
                    name: `${categoryInfo?.emoji || '🏆'} ${categoryInfo?.name || categoryName} (${categoryProgress})`,
                    value: '*Aucun exploit débloqué*',
                    inline: true
                });
            }
        }

        // Derniers exploits débloqués
        if (unlockedAchievements.length > 0) {
            const recentAchievements = unlockedAchievements.slice(-5).reverse();
            const recentList = recentAchievements.map(achievementId => {
                const [category, id] = achievementId.split('_');
                const achievement = bot.achievements[category]?.find(a => a.id === id);
                return achievement ? `${achievement.emoji || '🏆'} ${achievement.name}` : '❓ Exploit inconnu';
            }).join('\n');

            embed.addFields({
                name: '🆕 Derniers exploits débloqués',
                value: recentList,
                inline: false
            });
        }

        // Boutons d'action
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('view_all_achievements')
                    .setLabel('📋 Tous les exploits')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('achievement_progress')
                    .setLabel('📈 Progression détaillée')
                    .setStyle(ButtonStyle.Secondary)
            );

        embed.setFooter({ 
            text: `${completionRate}% complété • ${unlockedAchievements.length}/${totalAchievements} exploits` 
        }).setTimestamp();

        await message.reply({ embeds: [embed], components: [row] });
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