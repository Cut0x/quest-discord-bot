// commands/user/stats.js - Commande de statistiques
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stats',
        description: 'Affiche vos statistiques ou celles d\'un autre utilisateur',
        aliases: ['statistiques', 'profil', 'profile'],
        usage: '[utilisateur]',
        category: 'user',
        cooldown: 30000, // 30 secondes
        permissions: [] // Aucune permission requise
    },

    async execute(message, args, bot) {
        try {
            // Déterminer l'utilisateur cible
            let targetUser = message.author;
            let targetMember = message.member;

            if (args.length > 0) {
                // Essayer de récupérer l'utilisateur mentionné ou par ID
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
                            'Utilisateur non trouvé',
                            'L\'utilisateur spécifié n\'a pas été trouvé.'
                        );
                        return message.reply({ embeds: [errorEmbed] });
                    }
                }
            }

            // Vérifier si l'utilisateur est un bot
            if (targetUser.bot) {
                const errorEmbed = bot.functions.createErrorEmbed(
                    'Utilisateur invalide',
                    'Impossible d\'afficher les statistiques d\'un bot.'
                );
                return message.reply({ embeds: [errorEmbed] });
            }

            // Obtenir les données utilisateur
            const userData = bot.getUserData(targetUser.id, message.guild.id);

            // Vérifier si l'utilisateur a des données
            if (userData.messagesCount === 0 && userData.voiceTime === 0 && userData.achievements.length === 0) {
                const embed = bot.functions.createInfoEmbed(
                    'Aucune activité',
                    `${targetUser.displayName} n'a pas encore d'activité enregistrée sur ce serveur.`
                );
                return message.reply({ embeds: [embed] });
            }

            // Créer l'embed de base
            const embed = new EmbedBuilder()
                .setTitle(`📊 Statistiques de ${targetUser.displayName}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setColor(bot.config?.colors?.primary || '#FFD700')
                .setTimestamp()
                .setFooter({ 
                    text: `${bot.config?.serverName || 'Server'} • QuestBot Advanced`,
                    iconURL: message.guild.iconURL()
                });

            // Calculer le niveau et l'XP suivant
            const currentLevelXP = (userData.level - 1) * 1000;
            const nextLevelXP = userData.level * 1000;
            const progressXP = userData.experience - currentLevelXP;
            const neededXP = nextLevelXP - currentLevelXP;
            const progressPercent = Math.round((progressXP / neededXP) * 100);

            // Informations de base
            embed.addFields(
                {
                    name: '🎖️ Niveau et Expérience',
                    value: `**Niveau:** ${userData.level}\n**XP Total:** ${bot.functions.formatNumber(userData.experience)}\n**Progression:** ${bot.functions.formatNumber(progressXP)}/${bot.functions.formatNumber(neededXP)} XP (${progressPercent}%)`,
                    inline: true
                },
                {
                    name: '🏆 Exploits débloqués',
                    value: `**${userData.achievements.length}** exploits\n${this.getTopAchievements(userData, bot)}`,
                    inline: true
                },
                {
                    name: '📅 Membre depuis',
                    value: `<t:${Math.floor(new Date(userData.joinedAt).getTime() / 1000)}:R>`,
                    inline: true
                }
            );

            // Statistiques détaillées
            embed.addFields(
                {
                    name: '💬 Messages',
                    value: bot.functions.formatNumber(userData.messagesCount),
                    inline: true
                },
                {
                    name: '🎙️ Temps vocal',
                    value: bot.functions.formatDuration(userData.voiceTime),
                    inline: true
                },
                {
                    name: '❤️ Réactions',
                    value: `${bot.functions.formatNumber(userData.reactionsGiven)} données\n${bot.functions.formatNumber(userData.reactionsReceived)} reçues`,
                    inline: true
                }
            );

            // Statistiques avancées
            if (userData.cameraTime > 0 || userData.streamTime > 0 || userData.congratulationsSent > 0) {
                embed.addFields(
                    {
                        name: '📹 Caméra & Stream',
                        value: `Caméra: ${bot.functions.formatDuration(userData.cameraTime)}\nStream: ${bot.functions.formatDuration(userData.streamTime)}`,
                        inline: true
                    },
                    {
                        name: '🎉 Félicitations',
                        value: `${bot.functions.formatNumber(userData.congratulationsSent)} envoyées\n${bot.functions.formatNumber(userData.congratulationsReceived)} reçues`,
                        inline: true
                    }
                );
            }

            // Ajouter des informations sur le boost si applicable
            if (targetMember && targetMember.premiumSince) {
                const boostSince = Math.floor(targetMember.premiumSince.getTime() / 1000);
                embed.addFields({
                    name: '🚀 Boost Serveur',
                    value: `Booste depuis <t:${boostSince}:R>`,
                    inline: true
                });
            }

            // Créer l'image de profil avec Canvas
            let attachment = null;
            try {
                const profileImage = await bot.functions.createProgressCard(
                    targetUser.id, 
                    message.guild.id, 
                    targetUser, 
                    userData
                );
                
                attachment = new AttachmentBuilder(profileImage, { name: 'profile.png' });
                embed.setImage('attachment://profile.png');
            } catch (canvasError) {
                console.warn('⚠️ Erreur Canvas pour le profil:', canvasError.message);
                // Continuer sans l'image
            }

            // Envoyer la réponse
            const replyOptions = { embeds: [embed] };
            if (attachment) {
                replyOptions.files = [attachment];
            }

            await message.reply(replyOptions);

            // Ajouter une réaction de succès
            try {
                await message.react('📊');
            } catch (error) {
                // Ignorer les erreurs de réaction
            }

        } catch (error) {
            bot.functions.logError('Stats Command', error, {
                userId: message.author.id,
                guildId: message.guild.id,
                targetUser: args[0] || 'self'
            });

            const errorEmbed = bot.functions.createErrorEmbed(
                'Erreur de commande',
                'Une erreur est survenue lors de la récupération des statistiques.'
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

    /**
     * Récupère les derniers exploits pour l'affichage
     */
    getTopAchievements(userData, bot) {
        if (userData.achievements.length === 0) {
            return '*Aucun exploit débloqué*';
        }

        // Récupérer les 3 derniers exploits
        const recentAchievements = userData.achievements.slice(-3);
        const achievementNames = [];

        for (const achievementId of recentAchievements) {
            const [category, id] = achievementId.split('_');
            const achievement = bot.config?.achievements?.[category]?.find(a => a.id === id);
            
            if (achievement) {
                achievementNames.push(`${achievement.emoji || '🏆'} ${achievement.name}`);
            }
        }

        return achievementNames.length > 0 
            ? achievementNames.join('\n')
            : '*Exploits récents indisponibles*';
    }
};