// commands/user/achievements.js - Système d'exploits corrigé
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'achievements',
        description: 'Display achievements and progress',
        aliases: ['exploits', 'badges', 'trophies'],
        usage: '[category] [user]',
        category: 'user',
        cooldown: 15000
    },

    async execute(message, args, bot) {
        try {
            // Determine target user
            let targetUser = message.author;
            let categoryFilter = args[0]?.toLowerCase();
            
            // Check if first argument is a user mention or ID
            const mention = message.mentions.users.first();
            if (mention) {
                targetUser = mention;
                categoryFilter = args[1]?.toLowerCase();
            } else if (args[0]?.match(/^\d+$/)) {
                try {
                    targetUser = await bot.client.users.fetch(args[0]);
                    categoryFilter = args[1]?.toLowerCase();
                } catch {
                    // If not a valid user ID, treat as category
                }
            }

            if (targetUser.bot) {
                const errorEmbed = bot.functions.createErrorEmbed(
                    'Invalid user',
                    'Cannot display achievements for a bot.'
                );
                return message.reply({ embeds: [errorEmbed] });
            }

            const userData = bot.getUserData(targetUser.id, message.guild.id);
            
            // Get available categories from config - with fallback
            const availableCategories = bot.config?.achievements ? 
                Object.keys(bot.config.achievements).filter(cat => bot.config.achievements[cat].length > 0) : 
                [];
            
            // If no categories available, show basic info
            if (availableCategories.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle(`🏆 ${targetUser.displayName}'s Achievements`)
                    .setDescription('Achievement system is currently being configured.\n\nBasic progress information:')
                    .setColor('#667eea')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .addFields([
                        {
                            name: '📊 Current Progress',
                            value: `**Level:** ${userData.level}\n**Experience:** ${bot.formatNumber(userData.experience)} XP\n**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Voice Time:** ${bot.formatDuration(userData.voiceTime)}`,
                            inline: true
                        },
                        {
                            name: '🎯 Activity Stats',
                            value: `**Reactions Given:** ${bot.formatNumber(userData.reactionsGiven)}\n**Reactions Received:** ${bot.formatNumber(userData.reactionsReceived)}\n**Boosts:** ${userData.boosts || 0}`,
                            inline: true
                        }
                    ])
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }
            
            if (categoryFilter && !availableCategories.includes(categoryFilter)) {
                const errorEmbed = bot.functions.createErrorEmbed(
                    'Invalid category',
                    `Available categories: ${availableCategories.map(cat => `\`${cat}\``).join(', ')}`
                );
                return message.reply({ embeds: [errorEmbed] });
            }

            if (categoryFilter) {
                await this.showCategoryAchievements(message, bot, targetUser, userData, categoryFilter);
            } else {
                await this.showAchievementOverview(message, bot, targetUser, userData, availableCategories);
            }

        } catch (error) {
            bot.functions.logError('Achievements Command', error, {
                userId: message.author.id,
                guildId: message.guild.id
            });

            const errorEmbed = bot.functions.createErrorEmbed(
                'Command error',
                'An error occurred while retrieving achievements.'
            );
            await message.reply({ embeds: [errorEmbed] });
        }
    },

    async showAchievementOverview(message, bot, targetUser, userData, availableCategories) {
        const totalAchievements = availableCategories.reduce((total, category) => {
            return total + (bot.config.achievements[category]?.length || 0);
        }, 0);

        const completionRate = totalAchievements > 0 ? 
            Math.round((userData.achievements.length / totalAchievements) * 100) : 0;

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${targetUser.displayName}'s Achievements`)
            .setDescription(`Achievement progress on **${message.guild.name}**\n\nModern achievement system with detailed progress tracking.`)
            .setColor('#667eea')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: '📊 Overall Progress',
                    value: `**${userData.achievements.length}** / **${totalAchievements}** unlocked\n**${completionRate}%** completion rate\n**Level ${userData.level}** • **${bot.formatNumber(userData.experience)} XP**`,
                    inline: true
                },
                {
                    name: '🎯 Recent Achievements',
                    value: this.getRecentAchievements(userData, bot, 5),
                    inline: true
                }
            ])
            .setTimestamp();

        // Add category breakdown if categories exist
        if (availableCategories.length > 0) {
            const categoryProgress = availableCategories.map(category => {
                const categoryAchievements = bot.config.achievements[category] || [];
                const unlockedInCategory = userData.achievements.filter(id => id.startsWith(`${category}_`)).length;
                const percentage = categoryAchievements.length > 0 ? 
                    Math.round((unlockedInCategory / categoryAchievements.length) * 100) : 0;
                
                return `**${this.getCategoryDisplayName(category)}**: ${unlockedInCategory}/${categoryAchievements.length} (${percentage}%)`;
            }).join('\n');

            embed.addFields({
                name: '📈 Category Progress',
                value: categoryProgress,
                inline: false
            });
        }

        // Interactive components - only add if we have categories
        const components = [];
        
        if (availableCategories.length > 0) {
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('achievement_category')
                        .setPlaceholder('View achievements by category')
                        .addOptions(
                            availableCategories.map(category => ({
                                label: this.getCategoryDisplayName(category),
                                description: `View ${category} achievements`,
                                value: category,
                                emoji: this.getCategoryEmoji(category)
                            }))
                        )
                );
            components.push(selectMenu);
        }

        // Always add action buttons
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📊 View Stats')
                    .setCustomId('quick_stats')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('🏆 Leaderboard')
                    .setCustomId('quick_leaderboard')
                    .setStyle(ButtonStyle.Secondary)
            );

        if (targetUser.id === message.author.id) {
            components.push(buttonRow);
        }

        await message.reply({
            embeds: [embed],
            components: components
        });
    },

    async showCategoryAchievements(message, bot, targetUser, userData, category) {
        const categoryAchievements = bot.config.achievements[category] || [];
        
        if (categoryAchievements.length === 0) {
            const errorEmbed = bot.functions.createErrorEmbed(
                'No achievements',
                `No achievements found in category "${category}".`
            );
            return message.reply({ embeds: [errorEmbed] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${this.getCategoryEmoji(category)} ${this.getCategoryDisplayName(category)} Achievements`)
            .setDescription(`${targetUser.displayName}'s progress in **${category}** achievements`)
            .setColor('#667eea')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

        // Sort achievements by unlocked status and difficulty
        const sortedAchievements = categoryAchievements
            .map(achievement => ({
                ...achievement,
                unlocked: userData.achievements.includes(`${category}_${achievement.id}`),
                progress: this.getAchievementProgress(userData, achievement, category)
            }))
            .sort((a, b) => {
                if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
                return (a.requirement || 0) - (b.requirement || 0);
            });

        // Display achievements in pages if needed
        const achievementsPerPage = 8;
        const totalPages = Math.ceil(sortedAchievements.length / achievementsPerPage);
        const currentPage = 0; // For now, show first page
        
        const startIndex = currentPage * achievementsPerPage;
        const endIndex = Math.min(startIndex + achievementsPerPage, sortedAchievements.length);
        const pageAchievements = sortedAchievements.slice(startIndex, endIndex);

        let achievementText = '';
        pageAchievements.forEach(achievement => {
            const status = achievement.unlocked ? '✅' : '⏳';
            const name = achievement.unlocked ? `**${achievement.name}**` : achievement.name;
            const description = achievement.description || 'No description';
            const requirement = achievement.requirement ? `(${achievement.requirement} required)` : '';
            const progress = achievement.unlocked ? '' : ` • Progress: ${achievement.progress}/${achievement.requirement || '?'}`;
            
            achievementText += `${status} ${name}\n`;
            achievementText += `*${description}* ${requirement}${progress}\n\n`;
        });

        embed.setDescription(embed.data.description + '\n\n' + achievementText);

        // Statistics for this category
        const unlockedCount = sortedAchievements.filter(a => a.unlocked).length;
        const completionRate = Math.round((unlockedCount / categoryAchievements.length) * 100);

        embed.addFields([
            {
                name: '📊 Category Stats',
                value: `**${unlockedCount}** / **${categoryAchievements.length}** unlocked\n**${completionRate}%** completion rate`,
                inline: true
            }
        ]);

        if (totalPages > 1) {
            embed.setFooter({ 
                text: `Page ${currentPage + 1} of ${totalPages} • ${categoryAchievements.length} total achievements` 
            });
        }

        await message.reply({ embeds: [embed] });
    },

    getAchievementProgress(userData, achievement, category) {
        switch (category) {
            case 'messages':
                return userData.messagesCount || 0;
            case 'voice':
                return userData.voiceTime || 0;
            case 'reactions':
                return achievement.type === 'given' ? 
                    (userData.reactionsGiven || 0) : 
                    (userData.reactionsReceived || 0);
            case 'camera':
                return userData.cameraTime || 0;
            case 'stream':
                return userData.streamTime || 0;
            case 'boosts':
                return userData.boosts || 0;
            case 'congratulations':
                return achievement.type === 'sent' ? 
                    (userData.congratulationsSent || 0) : 
                    (userData.congratulationsReceived || 0);
            default:
                return 0;
        }
    },

    getRecentAchievements(userData, bot, limit = 5) {
        if (userData.achievements.length === 0) {
            return '*No achievements unlocked yet*';
        }

        const recentAchievements = userData.achievements.slice(-limit).reverse();
        const achievementNames = [];

        for (const achievementId of recentAchievements) {
            const [category, id] = achievementId.split('_');
            const achievement = bot.config?.achievements?.[category]?.find(a => a.id === id);
            
            if (achievement) {
                achievementNames.push(`• **${achievement.name}** (${category})`);
            }
        }

        return achievementNames.length > 0 ? 
            achievementNames.join('\n') : 
            '*Recent achievements unavailable*';
    },

    getCategoryDisplayName(category) {
        const names = {
            messages: 'Messages',
            voice: 'Voice Activity',
            reactions: 'Reactions',
            camera: 'Camera Usage',
            stream: 'Screen Sharing',
            boosts: 'Server Boosts',
            congratulations: 'Congratulations',
            events: 'Event Participation'
        };
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    },

    getCategoryEmoji(category) {
        const emojis = {
            messages: '💬',
            voice: '🎙️',
            reactions: '❤️',
            camera: '📹',
            stream: '📺',
            boosts: '🚀',
            congratulations: '🎉',
            events: '🎭'
        };
        return emojis[category] || '🏆';
    }
};