// events/guildMemberUpdate.js - Suivi moderne des mises à jour de membres
const config = require('../config.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, bot) {
        try {
            // =================== BOOST MANAGEMENT ===================
            
            const oldBoostingSince = oldMember.premiumSince;
            const newBoostingSince = newMember.premiumSince;
            
            // User started boosting
            if (!oldBoostingSince && newBoostingSince) {
                const userData = bot.getUserData(newMember.id, newMember.guild.id);
                userData.boosts++;
                
                const boostXP = config.experience?.rewards?.boost || 500;
                userData.experience += boostXP;
                
                console.log(`🚀 ${newMember.displayName} started boosting the server!`);
                
                // Thank you message for boost
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('🚀 New Server Boost!')
                    .setDescription(`Thank you ${newMember} for boosting **${newMember.guild.name}**!\n\n🎁 **+${boostXP} XP** bonus added to your profile!\n\nYour support helps make this server even better!`)
                    .setColor('#667eea')
                    .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
                    .addFields([
                        {
                            name: '📊 Server Boost Level',
                            value: `Level ${newMember.guild.premiumTier}`,
                            inline: true
                        },
                        {
                            name: '💎 Total Boosts',
                            value: `${newMember.guild.premiumSubscriptionCount || 0} boosts`,
                            inline: true
                        }
                    ])
                    .setTimestamp();
                
                const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
                if (notificationChannelId) {
                    const channel = newMember.guild.channels.cache.get(notificationChannelId);
                    if (channel) {
                        channel.send({ embeds: [embed] }).catch(console.error);
                    }
                }
                
                // Check achievements
                bot.checkAchievements(newMember.id, newMember.guild.id, newMember.guild, { silent: false });
                bot.saveDatabase();
            }
            
            // User stopped boosting
            else if (oldBoostingSince && !newBoostingSince) {
                console.log(`💔 ${newMember.displayName} stopped boosting the server`);
                
                // Optional: Send farewell boost message
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('💔 Boost Ended')
                    .setDescription(`${newMember.displayName} is no longer boosting the server. Thank you for your past support!`)
                    .setColor('#94a3b8')
                    .setTimestamp();
                
                const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
                if (notificationChannelId) {
                    const channel = newMember.guild.channels.cache.get(notificationChannelId);
                    if (channel) {
                        // Only send if configured to do so
                        if (process.env.NOTIFY_BOOST_END === 'true') {
                            channel.send({ embeds: [embed] }).catch(console.error);
                        }
                    }
                }
            }

            // =================== ROLE MANAGEMENT ===================
            
            // Detect important role changes
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            
            if (addedRoles.size > 0) {
                console.log(`🏷️ Roles added to ${newMember.displayName}: ${addedRoles.map(r => r.name).join(', ')}`);
                
                // Check if any added roles are achievement-related
                const achievementRoles = addedRoles.filter(role => {
                    return config.achievements && Object.values(config.achievements)
                        .flat()
                        .some(achievement => achievement.roleId === role.id);
                });
                
                if (achievementRoles.size > 0) {
                    console.log(`🏆 Achievement role(s) added: ${achievementRoles.map(r => r.name).join(', ')}`);
                }
            }
            
            if (removedRoles.size > 0) {
                console.log(`🏷️ Roles removed from ${newMember.displayName}: ${removedRoles.map(r => r.name).join(', ')}`);
            }

            // =================== NICKNAME MANAGEMENT ===================
            
            if (oldMember.nickname !== newMember.nickname) {
                console.log(`📝 ${newMember.user.tag} changed nickname: "${oldMember.nickname || oldMember.user.username}" → "${newMember.nickname || newMember.user.username}"`);
                
                // Optional: Log nickname changes to admin channel
                if (process.env.LOG_NICKNAME_CHANGES === 'true') {
                    const adminLogChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
                    if (adminLogChannelId) {
                        const adminChannel = newMember.guild.channels.cache.get(adminLogChannelId);
                        if (adminChannel) {
                            const { EmbedBuilder } = require('discord.js');
                            const embed = new EmbedBuilder()
                                .setTitle('📝 Nickname Change')
                                .setDescription(`**${newMember.user.tag}** changed their nickname`)
                                .addFields([
                                    {
                                        name: 'Previous',
                                        value: oldMember.nickname || oldMember.user.username,
                                        inline: true
                                    },
                                    {
                                        name: 'Current',
                                        value: newMember.nickname || newMember.user.username,
                                        inline: true
                                    }
                                ])
                                .setColor('#94a3b8')
                                .setTimestamp();
                            
                            adminChannel.send({ embeds: [embed] }).catch(console.error);
                        }
                    }
                }
            }

            // =================== AVATAR CHANGE DETECTION ===================
            
            if (oldMember.user.avatar !== newMember.user.avatar) {
                console.log(`🖼️ ${newMember.user.tag} changed their avatar`);
            }

        } catch (error) {
            bot.functions.logError('GuildMemberUpdate', error, {
                userId: newMember.id,
                guildId: newMember.guild.id
            });
        }
    }
};