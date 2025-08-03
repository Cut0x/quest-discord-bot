// commands/user/stats.js - Commande de statistiques moderne
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stats',
        description: 'Display your statistics or another user\'s statistics',
        aliases: ['statistics', 'profile', 'me'],
        usage: '[user]',
        category: 'user',
        cooldown: 30000,
        permissions: []
    },

    async execute(message, args, bot) {
        try {
            let targetUser = message.author;
            let targetMember = message.member;

            if (args.length > 0) {
                const mention = message.mentions.users.first();
                if (mention) {
                    targetUser = mention;
                    targetMember = await message.guild.members.fetch(mention.id).catch(() => null);
                } else if (args[0].match(/^\d+$/)) {
                    try {
                        targetUser = await bot.client.users.fetch(args[0]);
                        targetMember = await message.guild.members.fetch(args[0]).catch(() => null);
                    } catch (error) {
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
                    'Cannot display statistics for a bot.'
                );
                return message.reply({ embeds: [errorEmbed] });
            }

            const userData = bot.getUserData(targetUser.id, message.guild.id);

            if (userData.messagesCount === 0 && userData.voiceTime === 0 && userData.achievements.length === 0) {
                const embed = bot.functions.createInfoEmbed(
                    'No activity',
                    `${targetUser.displayName} has no recorded activity on this server yet.`
                );
                return message.reply({ embeds: [embed] });
            }

            // Create modern profile card
            let attachment = null;
            try {
                const profileImage = await bot.createModernProfileCard(
                    targetUser.id,
                    message.guild.id,
                    targetUser,
                    targetMember
                );
                attachment = new AttachmentBuilder(profileImage, { name: 'profile.png' });
            } catch (canvasError) {
                console.warn('⚠️ Canvas error for profile:', canvasError.message);
            }

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${targetUser.displayName}'s Statistics`)
                .setColor('#667eea')
                .setTimestamp()
                .setFooter({ 
                    text: `QuestBot Advanced • Modern Profile System`,
                    iconURL: message.guild.iconURL()
                });

            if (attachment) {
                embed.setImage('attachment://profile.png');
                embed.setDescription('Complete profile with modern design and statistics visualization.');
            } else {
                // Fallback text statistics
                const currentLevelXP = (userData.level - 1) * 1000;
                const nextLevelXP = userData.level * 1000;
                const progressXP = userData.experience - currentLevelXP;
                const neededXP = nextLevelXP - currentLevelXP;
                const progressPercent = Math.round((progressXP / neededXP) * 100);

                embed.addFields([
                    {
                        name: '🎖️ Level & Experience',
                        value: `**Level:** ${userData.level}\n**Total XP:** ${bot.formatNumber(userData.experience)}\n**Progress:** ${bot.formatNumber(progressXP)}/${bot.formatNumber(neededXP)} XP (${progressPercent}%)`,
                        inline: true
                    },
                    {
                        name: '🏆 Achievements',
                        value: `**${userData.achievements.length}** unlocked\n${this.getTopAchievements(userData, bot)}`,
                        inline: true
                    },
                    {
                        name: '📊 Activity Statistics',
                        value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Voice Time:** ${bot.formatDuration(userData.voiceTime)}\n**Reactions:** ${bot.formatNumber(userData.reactionsGiven)}/${bot.formatNumber(userData.reactionsReceived)}`,
                        inline: false
                    }
                ]);

                if (userData.cameraTime > 0 || userData.streamTime > 0) {
                    embed.addFields({
                        name: '🎥 Media Activity',
                        value: `**Camera Time:** ${bot.formatDuration(userData.cameraTime)}\n**Stream Time:** ${bot.formatDuration(userData.streamTime)}`,
                        inline: true
                    });
                }

                if (targetMember?.premiumSince) {
                    const boostSince = Math.floor(targetMember.premiumSince.getTime() / 1000);
                    embed.addFields({
                        name: '🚀 Server Boost',
                        value: `Boosting since <t:${boostSince}:R>`,
                        inline: true
                    });
                }
            }

            const replyOptions = { embeds: [embed] };
            if (attachment) {
                replyOptions.files = [attachment];
            }

            await message.reply(replyOptions);

            try {
                await message.react('📊');
            } catch (error) {
                // Ignore reaction errors
            }

        } catch (error) {
            bot.functions.logError('Stats Command', error, {
                userId: message.author.id,
                guildId: message.guild.id,
                targetUser: args[0] || 'self'
            });

            const errorEmbed = bot.functions.createErrorEmbed(
                'Command error',
                'An error occurred while retrieving statistics.'
            );

            if (process.env.DEBUG_MODE === 'true') {
                errorEmbed.addFields({
                    name: '🐛 Debug',
                    value: `\`\`\`${error.message.slice(0, 500)}\`\`\``,
                    inline: false
                });
            }

            await message.reply({ embeds: [errorEmbed] });
        }
    },

    getTopAchievements(userData, bot) {
        if (userData.achievements.length === 0) {
            return '*No achievements unlocked*';
        }

        const recentAchievements = userData.achievements.slice(-3);
        const achievementNames = [];

        for (const achievementId of recentAchievements) {
            const [category, id] = achievementId.split('_');
            const achievement = bot.config?.achievements?.[category]?.find(a => a.id === id);
            
            if (achievement) {
                achievementNames.push(`${achievement.name}`);
            }
        }

        return achievementNames.length > 0 
            ? achievementNames.join('\n')
            : '*Recent achievements unavailable*';
    }
};