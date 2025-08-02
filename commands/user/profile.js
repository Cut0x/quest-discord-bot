// commands/user/profile.js
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'profile',
        description: 'Affiche le profil complet d\'un utilisateur',
        aliases: ['profil', 'me', 'moi', 'p'],
        usage: '[utilisateur]',
        category: 'user',
        cooldown: 60000
    },

    async execute(message, args, bot) {
        // Déterminer l'utilisateur cible
        let targetUser = message.author;
        
        if (args[0]) {
            const mention = message.mentions.users.first();
            if (mention) {
                targetUser = mention;
            } else if (args[0].match(/^\d+$/)) {
                try {
                    targetUser = await bot.client.users.fetch(args[0]);
                } catch {
                    return message.reply('❌ Utilisateur non trouvé.');
                }
            }
        }

        if (targetUser.bot) {
            return message.reply('❌ Impossible d\'afficher le profil d\'un bot.');
        }

        try {
            const userData = bot.getUserData(targetUser.id, message.guild.id);
            const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
            
            // Calculer les statistiques avancées
            const totalAchievements = Object.values(bot.achievements).flat().length;
            const completionRate = Math.round((userData.achievements.length / totalAchievements) * 100);
            const nextLevelXP = (userData.level * 1000);
            const currentLevelXP = ((userData.level - 1) * 1000);
            const progressToNext = userData.experience - currentLevelXP;
            const neededForNext = nextLevelXP - userData.experience;

            // Créer l'image de profil
            let attachment = null;
            try {
                const profileImage = await bot.createProgressCard(targetUser.id, message.guild.id, targetUser);
                attachment = new AttachmentBuilder(profileImage, { name: 'profile.png' });
            } catch (canvasError) {
                console.warn('⚠️ Erreur Canvas pour le profil:', canvasError.message);
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎮 Profil de ${targetUser.displayName}`)
                .setDescription(this.getProfileDescription(targetUser, member, userData))
                .setColor(member?.displayHexColor || '#FFD700')
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .addFields([
                    {
                        name: '🎯 Progression',
                        value: `**Niveau:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Prochain niveau:** ${neededForNext > 0 ? `${bot.formatNumber(neededForNext)} XP` : 'MAX'}\n**Progression:** ${progressToNext}/${nextLevelXP - currentLevelXP} XP`,
                        inline: true
                    },
                    {
                        name: '🏆 Exploits',
                        value: `**Débloqués:** ${userData.achievements.length}/${totalAchievements}\n**Complétion:** ${completionRate}%\n**Derniers:** ${this.getRecentAchievements(userData, bot, 2)}`,
                        inline: true
                    },
                    {
                        name: '📊 Activité',
                        value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Temps vocal:** ${bot.formatDuration(userData.voiceTime)}\n**Événements:** ${userData.eventsParticipated}`,
                        inline: true
                    },
                    {
                        name: '❤️ Social',
                        value: `**Réactions données:** ${bot.formatNumber(userData.reactionsGiven)}\n**Réactions reçues:** ${bot.formatNumber(userData.reactionsReceived)}\n**Félicitations:** ${userData.congratulationsSent}/${userData.congratulationsReceived}`,
                        inline: true
                    },
                    {
                        name: '🎥 Multimédia',
                        value: `**Temps caméra:** ${bot.formatDuration(userData.cameraTime)}\n**Temps stream:** ${bot.formatDuration(userData.streamTime)}\n**Boosts serveur:** ${userData.boosts}`,
                        inline: true
                    },
                    {
                        name: '📅 Informations',
                        value: `**Membre depuis:** <t:${Math.floor(new Date(userData.joinedAt).getTime() / 1000)}:R>\n**Dernière activité:** <t:${Math.floor(new Date(userData.lastActivity).getTime() / 1000)}:R>${member?.premiumSince ? `\n**Booste depuis:** <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : ''}`,
                        inline: true
                    }
                ])
                .setFooter({ 
                    text: `ID: ${targetUser.id} • ${targetUser === message.author ? 'Votre profil' : `Profil de ${targetUser.displayName}`}` 
                })
                .setTimestamp();

            if (attachment) {
                embed.setImage('attachment://profile.png');
            }

            // Boutons d'interaction
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`view_achievements_${targetUser.id}`)
                        .setLabel('🏆 Exploits')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`view_detailed_stats_${targetUser.id}`)
                        .setLabel('📊 Stats détaillées')
                        .setStyle(ButtonStyle.Secondary)
                );

            // Ajouter des boutons conditionnels
            if (targetUser !== message.author) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`compare_profiles_${targetUser.id}`)
                        .setLabel('⚖️ Comparer')
                        .setStyle(ButtonStyle.Secondary)
                );
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
                targetUser: targetUser.id
            });

            // Fallback vers la commande stats
            const statsCommand = bot.commands.get('stats');
            if (statsCommand) {
                return statsCommand.execute(message, args, bot);
            }

            const embed = bot.functions.createErrorEmbed(
                'Erreur du profil',
                'Une erreur est survenue lors de la génération du profil.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    getProfileDescription(user, member, userData) {
        let description = `Profil de progression sur **${member?.guild?.name || 'ce serveur'}**\n\n`;
        
        if (member?.nickname) {
            description += `*Aussi connu sous:* **${member.nickname}**\n`;
        }
        
        // Ajouter des badges en fonction des statistiques
        const badges = [];
        if (userData.level >= 10) badges.push('🌟 Vétéran');
        if (userData.messagesCount >= 1000) badges.push('💬 Bavard');
        if (userData.voiceTime >= 600) badges.push('🎙️ Causeur');
        if (userData.achievements.length >= 20) badges.push('🏆 Collectionneur');
        if (member?.premiumSince) badges.push('🚀 Booster');
        
        if (badges.length > 0) {
            description += `**Badges:** ${badges.join(' ')}\n`;
        }
        
        return description;
    },

    getRecentAchievements(userData, bot, limit = 3) {
        if (!userData.achievements.length) return '*Aucun*';
        
        const recentAchievements = userData.achievements.slice(-limit).reverse();
        
        return recentAchievements.map(achievementId => {
            const [category, id] = achievementId.split('_');
            const achievement = bot.achievements[category]?.find(a => a.id === id);
            return achievement ? `${achievement.emoji || '🏆'} ${achievement.name}` : '❓';
        }).join('\n') || '*Aucun*';
    },

    getProgressEmoji(percentage) {
        if (percentage >= 100) return '🟢';
        if (percentage >= 75) return '🟡';
        if (percentage >= 50) return '🟠';
        if (percentage >= 25) return '🔴';
        return '⚫';
    }
};