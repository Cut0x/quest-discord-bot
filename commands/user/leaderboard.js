// commands/user/leaderboard.js
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'Affiche le classement des membres',
        aliases: ['top', 'classement', 'ranking', 'lb'],
        usage: '[catégorie] [limite]',
        category: 'user',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const validCategories = ['messages', 'voice', 'level', 'experience', 'reactions_given', 'reactions_received', 'achievements', 'camera', 'stream'];
        const category = args[0]?.toLowerCase() || 'level';
        const limit = Math.min(parseInt(args[1]) || 10, 20);
        
        if (!validCategories.includes(category)) {
            const availableCategories = validCategories.map(cat => `\`${cat}\``).join(', ');
            return message.reply(`❌ Catégorie invalide. Catégories disponibles: ${availableCategories}`);
        }
        
        try {
            // Récupérer et trier les utilisateurs
            const users = this.getUsersData(bot.database.users, message.guild.id, category);
            
            if (users.length === 0) {
                const embed = bot.functions.createInfoEmbed(
                    'Aucune donnée',
                    'Aucun utilisateur n\'a de données pour cette catégorie.'
                );
                return message.reply({ embeds: [embed] });
            }

            const topUsers = users.slice(0, limit);
            
            // Trouver la position de l'utilisateur actuel
            const userPosition = users.findIndex(u => u.userId === message.author.id) + 1;
            const userStats = users.find(u => u.userId === message.author.id);
            
            // Créer l'image du leaderboard avec Canvas
            let attachment = null;
            try {
                const leaderboardImage = await bot.createLeaderboard(message.guild.id, category, limit);
                attachment = new AttachmentBuilder(leaderboardImage, { name: 'leaderboard.png' });
            } catch (canvasError) {
                console.warn('⚠️ Erreur Canvas pour le leaderboard:', canvasError.message);
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Classement - ${this.getCategoryDisplayName(category)}`)
                .setDescription(`Top ${limit} des membres les plus actifs sur **${message.guild.name}**`)
                .setColor('#FFD700')
                .setFooter({ 
                    text: userPosition > 0 ? 
                        `Votre position: #${userPosition} avec ${userStats?.value || 0} ${this.getCategoryUnit(category)}` : 
                        'Vous n\'apparaissez pas encore dans ce classement'
                })
                .setTimestamp();

            if (attachment) {
                embed.setImage('attachment://leaderboard.png');
            } else {
                // Fallback textuel si Canvas échoue
                let leaderboardText = '';
                for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
                    const user = topUsers[i];
                    const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `**#${i + 1}**`;
                    
                    try {
                        const discordUser = await bot.client.users.fetch(user.userId);
                        leaderboardText += `${medal} ${discordUser.displayName} - ${bot.formatNumber(user.value)} ${this.getCategoryUnit(category)}\n`;
                    } catch {
                        leaderboardText += `${medal} Utilisateur inconnu - ${bot.formatNumber(user.value)} ${this.getCategoryUnit(category)}\n`;
                    }
                }
                embed.setDescription(embed.data.description + '\n\n' + leaderboardText);
            }
            
            // Menu de sélection pour changer de catégorie
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('leaderboard_category')
                        .setPlaceholder('Choisir une catégorie')
                        .addOptions([
                            {
                                label: 'Niveau',
                                description: 'Classement par niveau',
                                value: 'level',
                                emoji: '🎖️',
                                default: category === 'level'
                            },
                            {
                                label: 'Expérience',
                                description: 'Classement par XP total',
                                value: 'experience',
                                emoji: '⭐',
                                default: category === 'experience'
                            },
                            {
                                label: 'Messages',
                                description: 'Classement par messages envoyés',
                                value: 'messages',
                                emoji: '💬',
                                default: category === 'messages'
                            },
                            {
                                label: 'Temps vocal',
                                description: 'Classement par temps en vocal',
                                value: 'voice',
                                emoji: '🎙️',
                                default: category === 'voice'
                            },
                            {
                                label: 'Exploits',
                                description: 'Classement par nombre d\'exploits',
                                value: 'achievements',
                                emoji: '🏆',
                                default: category === 'achievements'
                            },
                            {
                                label: 'Réactions données',
                                description: 'Classement par réactions données',
                                value: 'reactions_given',
                                emoji: '👍',
                                default: category === 'reactions_given'
                            },
                            {
                                label: 'Réactions reçues',
                                description: 'Classement par réactions reçues',
                                value: 'reactions_received',
                                emoji: '❤️',
                                default: category === 'reactions_received'
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
                'Erreur du classement',
                'Une erreur est survenue lors de la génération du classement.'
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
                    case 'congratulations':
                        value = (userData.congratulationsSent || 0) + (userData.congratulationsReceived || 0);
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
            messages: 'Messages envoyés',
            voice: 'Temps vocal',
            level: 'Niveau',
            experience: 'Expérience',
            reactions_given: 'Réactions données',
            reactions_received: 'Réactions reçues',
            achievements: 'Exploits débloqués',
            camera: 'Temps caméra',
            stream: 'Temps stream',
            congratulations: 'Félicitations'
        };
        return names[category] || category;
    },

    getCategoryUnit(category) {
        const units = {
            messages: 'messages',
            voice: 'minutes',
            level: '',
            experience: 'XP',
            reactions_given: 'réactions',
            reactions_received: 'réactions',
            achievements: 'exploits',
            camera: 'minutes',
            stream: 'minutes',
            congratulations: 'félicitations'
        };
        return units[category] || '';
    }
};