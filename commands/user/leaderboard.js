

// commands/user/leaderboard.js
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'Affiche le classement des membres',
        aliases: ['top', 'classement', 'ranking'],
        usage: '[catégorie] [limite]',
        category: 'user',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const validCategories = ['messages', 'voice', 'level', 'experience', 'reactions_given', 'reactions_received', 'achievements'];
        const category = args[0]?.toLowerCase() || 'level';
        const limit = Math.min(parseInt(args[1]) || 10, 20);
        
        if (!validCategories.includes(category)) {
            const availableCategories = validCategories.map(cat => `\`${cat}\``).join(', ');
            return message.reply(`❌ Catégorie invalide. Catégories disponibles: ${availableCategories}`);
        }
        
        try {
            // Créer l'image du leaderboard avec Canvas
            const leaderboardImage = await bot.createLeaderboard(message.guild.id, category, limit);
            const attachment = new AttachmentBuilder(leaderboardImage, { name: 'leaderboard.png' });
            
            // Récupérer et trier les utilisateurs
            const users = this.getUsersData(bot.database.users, message.guild.id, category);
            const topUsers = users.slice(0, limit);
            
            // Trouver la position de l'utilisateur actuel
            const userPosition = users.findIndex(u => u.userId === message.author.id) + 1;
            const userStats = users.find(u => u.userId === message.author.id);
            
            const embed = new EmbedBuilder()
                .setTitle(`🏆 Classement - ${this.getCategoryDisplayName(category)}`)
                .setDescription(`Top ${limit} des membres les plus actifs sur **${message.guild.name}**`)
                .setColor('#FFD700')
                .setImage('attachment://leaderboard.png')
                .setFooter({ 
                    text: userPosition > 0 ? 
                        `Votre position: #${userPosition} avec ${userStats?.value || 0} ${this.getCategoryUnit(category)}` : 
                        'Vous n\'apparaissez pas encore dans ce classement'
                })
                .setTimestamp();
            
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
                            }
                        ])
                );
            
            await message.reply({ 
                embeds: [embed], 
                files: [attachment], 
                components: [selectMenu] 
            });
            
        } catch (error) {
            console.error('Erreur lors de la création du leaderboard:', error);
            
            // Fallback vers un embed texte
            const embed = new EmbedBuilder()
                .setTitle(`🏆 Classement - ${this.getCategoryDisplayName(category)}`)
                .setColor('#FFD700')
                .setDescription('⚠️ Impossible de générer l\'image, voici le classement textuel:')
                .setTimestamp();
            
            const users = this.getUsersData(bot.database.users, message.guild.id, category);
            const topUsers = users.slice(0, limit);
            
            let leaderboardText = '';
            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `**#${i + 1}**`;
                leaderboardText += `${medal} <@${user.userId}> - ${user.value} ${this.getCategoryUnit(category)}\n`;
            }
            
            embed.setDescription(embed.data.description + '\n\n' + leaderboardText);
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
            achievements: 'Exploits débloqués'
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
            achievements: 'exploits'
        };
        return units[category] || '';
    }
};