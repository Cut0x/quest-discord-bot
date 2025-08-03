// commands/user/leaderboard.js - Classement moderne
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'Display member rankings',
        aliases: ['top', 'ranking', 'lb'],
        usage: '[category] [limit]',
        category: 'user',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const validCategories = ['messages', 'voice', 'level', 'experience', 'reactions_given', 'reactions_received', 'achievements', 'camera', 'stream'];
        const category = args[0]?.toLowerCase() || 'level';
        const limit = Math.min(parseInt(args[1]) || 10, 20);
        
        if (!validCategories.includes(category)) {
            const availableCategories = validCategories.map(cat => `\`${cat}\``).join(', ');
            return message.reply(`❌ Invalid category. Available categories: ${availableCategories}`);
        }
        
        try {
            const users = this.getUsersData(bot.database.users, message.guild.id, category);
            
            if (users.length === 0) {
                const embed = bot.functions.createInfoEmbed(
                    'No data',
                    'No users have data for this category.'
                );
                return message.reply({ embeds: [embed] });
            }

            const topUsers = users.slice(0, limit);
            const userPosition = users.findIndex(u => u.userId === message.author.id) + 1;
            const userStats = users.find(u => u.userId === message.author.id);
            
            // Create modern leaderboard image
            let attachment = null;
            try {
                const leaderboardImage = await bot.createModernLeaderboard(message.guild.id, category, limit);
                attachment = new AttachmentBuilder(leaderboardImage, { name: 'leaderboard.png' });
            } catch (canvasError) {
                console.warn('⚠️ Canvas error for leaderboard:', canvasError.message);
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Leaderboard - ${this.getCategoryDisplayName(category)}`)
                .setDescription(`Top ${limit} most active members on **${message.guild.name}**\n\nModern design with visual statistics and progress tracking.`)
                .setColor('#667eea')
                .setFooter({ 
                    text: userPosition > 0 ? 
                        `Your position: #${userPosition} with ${userStats?.value || 0} ${this.getCategoryUnit(category)}` : 
                        'You don\'t appear in this leaderboard yet'
                })
                .setTimestamp();

            if (attachment) {
                embed.setImage('attachment://leaderboard.png');
            } else {
                // Text fallback
                let leaderboardText = '';
                for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
                    const user = topUsers[i];
                    const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `**#${i + 1}**`;
                    
                    try {
                        const discordUser = await bot.client.users.fetch(user.userId);
                        leaderboardText += `${medal} ${discordUser.displayName} - ${bot.formatNumber(user.value)} ${this.getCategoryUnit(category)}\n`;
                    } catch {
                        leaderboardText += `${medal} Unknown User - ${bot.formatNumber(user.value)} ${this.getCategoryUnit(category)}\n`;
                    }
                }
                embed.setDescription(embed.data.description + '\n\n' + leaderboardText);
            }
            
            // Category selection menu
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('leaderboard_category')
                        .setPlaceholder('Choose a category')
                        .addOptions([
                            {
                                label: 'Level',
                                description: 'Ranking by level',
                                value: 'level',
                                emoji: '🎖️',
                                default: category === 'level'
                            },
                            {
                                label: 'Experience',
                                description: 'Ranking by total XP',
                                value: 'experience',
                                emoji: '⭐',
                                default: category === 'experience'
                            },
                            {
                                label: 'Messages',
                                description: 'Ranking by messages sent',
                                value: 'messages',
                                emoji: '💬',
                                default: category === 'messages'
                            },
                            {
                                label: 'Voice Time',
                                description: 'Ranking by voice channel time',
                                value: 'voice',
                                emoji: '🎙️',
                                default: category === 'voice'
                            },
                            {
                                label: 'Achievements',
                                description: 'Ranking by achievements count',
                                value: 'achievements',
                                emoji: '🏆',
                                default: category === 'achievements'
                            },
                            {
                                label: 'Reactions Given',
                                description: 'Ranking by reactions given',
                                value: 'reactions_given',
                                emoji: '👍',
                                default: category === 'reactions_given'
                            }
                        ])
                );
            
            const replyOptions = { embeds: [embed], components: [selectMenu] };
            if (attachment) {
                replyOptions.files = [attachment];
            }
            
            await message.reply(replyOptions);
            
        } catch (error) {
            bot.functions.logError('Leaderboard Command', error, {
                userId: message.author.id,
                guildId: message.guild.id,
                category
            });

            const embed = bot.functions.createErrorEmbed(
                'Leaderboard error',
                'An error occurred while generating the leaderboard.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    getUsersData(usersDb, guildId, category) {
        const users = [];
        
        for (const userId in usersDb) {
            if (usersDb[userId][guildId]) {
                const userData = usersDb[userId][guildId];
                let value = 0;
                
                switch (category) {
                    case 'messages':
                        value = userData.messagesCount || 0;
                        break;
                    case 'voice':
                        value = userData.voiceTime || 0;
                        break;
                    case 'level':
                        value = userData.level || 1;
                        break;
                    case 'experience':
                        value = userData.experience || 0;
                        break;
                    case 'reactions_given':
                        value = userData.reactionsGiven || 0;
                        break;
                    case 'reactions_received':
                        value = userData.reactionsReceived || 0;
                        break;
                    case 'achievements':
                        value = userData.achievements?.length || 0;
                        break;
                    case 'camera':
                        value = userData.cameraTime || 0;
                        break;
                    case 'stream':
                        value = userData.streamTime || 0;
                        break;
                }
                
                if (value > 0) {
                    users.push({ userId, value });
                }
            }
        }
        
        return users.sort((a, b) => b.value - a.value);
    },

    getCategoryDisplayName(category) {
        const names = {
            messages: 'Messages Sent',
            voice: 'Voice Time',
            level: 'Level',
            experience: 'Experience',
            reactions_given: 'Reactions Given',
            reactions_received: 'Reactions Received',
            achievements: 'Achievements',
            camera: 'Camera Time',
            stream: 'Stream Time'
        };
        return names[category] || category;
    },

    getCategoryUnit(category) {
        const units = {
            messages: 'messages',
            voice: 'minutes',
            level: '',
            experience: 'XP',
            reactions_given: 'reactions',
            reactions_received: 'reactions',
            achievements: 'achievements',
            camera: 'minutes',
            stream: 'minutes'
        };
        return units[category] || '';
    }
};