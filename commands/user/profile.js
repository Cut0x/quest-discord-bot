// commands/user/profile.js - Système de profil moderne
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'profile',
        description: 'Display complete user profile',
        aliases: ['profil', 'me', 'moi', 'p'],
        usage: '[user]',
        category: 'user',
        cooldown: 60000
    },

    async execute(message, args, bot) {
        try {
            // Determine target user
            let targetUser = message.author;
            
            if (args[0]) {
                const mention = message.mentions.users.first();
                if (mention) {
                    targetUser = mention;
                } else if (args[0].match(/^\d+$/)) {
                    try {
                        targetUser = await bot.client.users.fetch(args[0]);
                    } catch {
                        const errorEmbed = bot.functions.createErrorEmbed(
                            'User not found',
                            'The specified user was not found.'
                        );
                        return message.reply({ embeds: [errorEmbed] });
                    }
                }
            }

            if (targetUser.bot) {
                const errorEmbed = bot.functions.createErrorEmbed(
                    'Invalid user',
                    'Cannot display profile for a bot.'
                );
                return message.reply({ embeds: [errorEmbed] });
            }

            const userData = bot.getUserData(targetUser.id, message.guild.id);
            const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
            
            // Calculate advanced statistics
            const totalAchievements = bot.config?.achievements ? 
                Object.values(bot.config.achievements).flat().length : 50;
            const completionRate = Math.round((userData.achievements.length / totalAchievements) * 100);
            
            const nextLevelXP = (userData.level * 1000);
            const currentLevelXP = ((userData.level - 1) * 1000);
            const progressToNext = userData.experience - currentLevelXP;
            const neededForNext = nextLevelXP - userData.experience;

            // Create modern profile image
            let attachment = null;
            try {
                const profileImage = await bot.createModernProfileCard(
                    targetUser.id, 
                    message.guild.id, 
                    targetUser, 
                    member
                );
                attachment = new AttachmentBuilder(profileImage, { name: 'profile.png' });
            } catch (canvasError) {
                console.warn('⚠️ Canvas error for profile:', canvasError.message);
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎮 ${targetUser.displayName}'s Complete Profile`)
                .setDescription(this.getProfileDescription(targetUser, member, userData))
                .setColor(member?.displayHexColor || '#667eea')
                .setThumbnail(targetUser.displayAvatarURL({ size: 256, dynamic: true }))
                .addFields([
                    {
                        name: '🎯 Progression System',
                        value: `**Level:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Next Level:** ${neededForNext > 0 ? `${bot.formatNumber(neededForNext)} XP` : 'MAX'}\n**Progress:** ${progressToNext}/${nextLevelXP - currentLevelXP} XP`,
                        inline: true
                    },
                    {
                        name: '🏆 Achievement System',
                        value: `**Unlocked:** ${userData.achievements.length}/${totalAchievements}\n**Completion:** ${completionRate}%\n**Recent:** ${this.getRecentAchievements(userData, bot, 2)}`,
                        inline: true
                    },
                    {
                        name: '📊 Core Activity',
                        value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Voice Time:** ${bot.formatDuration(userData.voiceTime)}\n**Events:** ${userData.eventsParticipated || 0}`,
                        inline: true
                    },
                    {
                        name: '❤️ Social Interactions',
                        value: `**Reactions Given:** ${bot.formatNumber(userData.reactionsGiven)}\n**Reactions Received:** ${bot.formatNumber(userData.reactionsReceived)}\n**Congratulations:** ${userData.congratulationsSent || 0}/${userData.congratulationsReceived || 0}`,
                        inline: true
                    },
                    {
                        name: '🎥 Media Activity',
                        value: `**Camera Time:** ${bot.formatDuration(userData.cameraTime || 0)}\n**Stream Time:** ${bot.formatDuration(userData.streamTime || 0)}\n**Server Boosts:** ${userData.boosts || 0}`,
                        inline: true
                    },
                    {
                        name: '📅 Membership Info',
                        value: `**Joined Server:** <t:${Math.floor(new Date(userData.joinedAt).getTime() / 1000)}:R>\n**Last Activity:** <t:${Math.floor(new Date(userData.lastActivity).getTime() / 1000)}:R>${member?.premiumSince ? `\n**Boosting Since:** <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : ''}`,
                        inline: true
                    }
                ])
                .setFooter({ 
                    text: `ID: ${targetUser.id} • ${targetUser === message.author ? 'Your profile' : `${targetUser.displayName}'s profile`}` 
                })
                .setTimestamp();

            if (attachment) {
                embed.setImage('attachment://profile.png');
            }

            // Interactive buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🏆 View Achievements')
                        .setCustomId(`view_achievements_${targetUser.id}`)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel('📊 Detailed Stats')
                        .setCustomId(`view_detailed_stats_${targetUser.id}`)
                        .setStyle(ButtonStyle.Secondary)
                );

            // Add conditional buttons
            if (targetUser !== message.author) {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('⚖️ Compare Profiles')
                        .setCustomId(`compare_profiles_${targetUser.id}`)
                        .setStyle(ButtonStyle.Success)
                );
            }

            // Admin-only button for profile management
            const adminIds = process.env.ADMIN_IDS?.split(',') || [];
            if (adminIds.includes(message.author.id)) {
                const adminRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('🛠️ Manage Profile')
                            .setCustomId(`admin_manage_${targetUser.id}`)
                            .setStyle(ButtonStyle.Danger)
                    );
                
                const replyOptions = { 
                    embeds: [embed], 
                    components: [row, adminRow] 
                };
                if (attachment) {
                    replyOptions.files = [attachment];
                }
                
                return message.reply(replyOptions);
            }

            const replyOptions = { embeds: [embed], components: [row] };
            if (attachment) {
                replyOptions.files = [attachment];
            }

            await message.reply(replyOptions);
            
        } catch (error) {
            bot.functions.logError('Profile Command', error, {
                userId: message.author.id,
                guildId: message.guild.id,
                targetUser: args[0] || 'self'
            });

            // Fallback to basic stats command
            const statsCommand = bot.commands.get('stats');
            if (statsCommand) {
                console.log('📊 Falling back to stats command...');
                return statsCommand.execute(message, args, bot);
            }

            const embed = bot.functions.createErrorEmbed(
                'Profile error',
                'An error occurred while generating the profile.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    getProfileDescription(user, member, userData) {
        let description = `Complete progression profile for **${member?.guild?.name || 'this server'}**\n\n`;
        
        if (member?.nickname) {
            description += `*Also known as:* **${member.nickname}**\n`;
        }
        
        // Add profile badges based on statistics
        const badges = [];
        if (userData.level >= 10) badges.push('🌟 Veteran');
        if (userData.messagesCount >= 1000) badges.push('💬 Chatty');
        if (userData.voiceTime >= 600) badges.push('🎙️ Speaker');
        if (userData.achievements.length >= 20) badges.push('🏆 Collector');
        if (member?.premiumSince) badges.push('🚀 Booster');
        if (userData.congratulationsSent >= 50) badges.push('🎉 Supporter');
        if (userData.cameraTime >= 120) badges.push('📹 Streamer');
        
        if (badges.length > 0) {
            description += `**Profile Badges:** ${badges.join(' ')}\n`;
        }
        
        // Add server rank
        description += `\n*Modern Canvas profile with glassmorphism design*`;
        
        return description;
    },

    getRecentAchievements(userData, bot, limit = 3) {
        if (!userData.achievements.length) return '*None yet*';
        
        const recentAchievements = userData.achievements.slice(-limit).reverse();
        
        return recentAchievements.map(achievementId => {
            const [category, id] = achievementId.split('_');
            const achievement = bot.config?.achievements?.[category]?.find(a => a.id === id);
            return achievement ? achievement.name : 'Unknown';
        }).join('\n') || '*None available*';
    },

    getProgressEmoji(percentage) {
        if (percentage >= 100) return '🟢';
        if (percentage >= 75) return '🟡';
        if (percentage >= 50) return '🟠';
        if (percentage >= 25) return '🔴';
        return '⚫';
    },

    calculateServerRank(userData, allUsersData, category = 'experience') {
        const users = Object.values(allUsersData)
            .filter(user => user[category] !== undefined)
            .sort((a, b) => (b[category] || 0) - (a[category] || 0));
        
        const rank = users.findIndex(user => user === userData) + 1;
        return rank || users.length + 1;
    }
};