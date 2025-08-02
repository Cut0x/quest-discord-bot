// commands/admin/achievements-manage.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'achievements-manage',
        description: 'Gestion des exploits des utilisateurs',
        aliases: ['manage-achievements', 'exploits-manage'],
        usage: '[give|remove|list] [utilisateur] [exploit]',
        category: 'admin',
        cooldown: 5000,
        permissions: ['admin']
    },

    async execute(message, args, bot) {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            return this.showManagePanel(message, bot);
        }

        switch (action) {
            case 'give':
                return this.giveAchievement(message, args[1], args[2], bot);
            case 'remove':
                return this.removeAchievement(message, args[1], args[2], bot);
            case 'list':
                return this.listUserAchievements(message, args[1], bot);
            case 'force':
                return this.forceCheckAchievements(message, args[1], bot);
            default:
                return message.reply('❌ Action invalide. Utilisez: `give`, `remove`, `list`, ou `force`');
        }
    },

    async showManagePanel(message, bot) {
        const totalAchievements = Object.values(bot.achievements).flat().length;
        const categories = Object.keys(bot.achievements);

        const embed = new EmbedBuilder()
            .setTitle('🏆 Gestion des Exploits')
            .setDescription('Panel de gestion des exploits utilisateur')
            .setColor('#9932CC')
            .addFields([
                {
                    name: '📊 Statistiques',
                    value: `**Total exploits:** ${totalAchievements}\n**Catégories:** ${categories.length}\n**Exploits débloqués:** ${bot.stats.achievementsUnlocked}`,
                    inline: true
                },
                {
                    name: '🔧 Actions disponibles',
                    value: '`give [user] [exploit]` - Donner un exploit\n`remove [user] [exploit]` - Retirer un exploit\n`list [user]` - Lister les exploits\n`force [user]` - Vérifier les exploits',
                    inline: true
                },
                {
                    name: '📋 Catégories disponibles',
                    value: categories.map(cat => `• **${cat}** (${bot.achievements[cat].length})`).join('\n'),
                    inline: false
                }
            ])
            .setFooter({ text: 'Utilisez !achievements-manage [action] pour commencer' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async giveAchievement(message, userId, achievementId, bot) {
        if (!userId || !achievementId) {
            return message.reply('❌ Usage: `!achievements-manage give @user category_id`\nEx: `!achievements-manage give @user messages_bavard`');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            const userData = bot.getUserData(cleanUserId, message.guild.id);
            
            // Vérifier si l'exploit existe
            const [category, id] = achievementId.split('_');
            const achievement = bot.achievements[category]?.find(a => a.id === id);
            
            if (!achievement) {
                return message.reply('❌ Exploit non trouvé. Utilisez le format: `category_id`');
            }

            // Vérifier si l'utilisateur a déjà l'exploit
            if (userData.achievements.includes(achievementId)) {
                return message.reply(`❌ ${user.displayName} possède déjà l'exploit **${achievement.name}**.`);
            }

            // Donner l'exploit
            userData.achievements.push(achievementId);
            userData.experience += achievement.xp || 100;
            
            // Calculer le nouveau niveau
            const newLevel = Math.floor(userData.experience / 1000) + 1;
            const leveledUp = newLevel > userData.level;
            userData.level = newLevel;

            bot.saveDatabase();

            const embed = bot.functions.createSuccessEmbed(
                'Exploit accordé',
                `**${achievement.name}** ${achievement.emoji || '🏆'} accordé à ${user.displayName}!\n\n**XP ajoutée:** ${achievement.xp || 100}${leveledUp ? `\n**Nouveau niveau:** ${newLevel}` : ''}`
            );

            await message.reply({ embeds: [embed] });

            // Envoyer une notification si configuré
            if (process.env.NOTIFICATION_CHANNEL_ID) {
                const notificationChannel = message.guild.channels.cache.get(process.env.NOTIFICATION_CHANNEL_ID);
                if (notificationChannel) {
                    const notifEmbed = new EmbedBuilder()
                        .setTitle('🏆 Exploit accordé par un administrateur')
                        .setDescription(`${user} a reçu l'exploit **${achievement.name}** ${achievement.emoji || '🏆'}`)
                        .setColor(bot.config.colors.primary)
                        .setTimestamp();
                    
                    notificationChannel.send({ embeds: [notifEmbed] });
                }
            }

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur',
                'Impossible de trouver cet utilisateur ou d\'accorder l\'exploit.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async removeAchievement(message, userId, achievementId, bot) {
        if (!userId || !achievementId) {
            return message.reply('❌ Usage: `!achievements-manage remove @user category_id`');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            const userData = bot.getUserData(cleanUserId, message.guild.id);
            
            // Vérifier si l'exploit existe
            const [category, id] = achievementId.split('_');
            const achievement = bot.achievements[category]?.find(a => a.id === id);
            
            if (!achievement) {
                return message.reply('❌ Exploit non trouvé.');
            }

            // Vérifier si l'utilisateur a l'exploit
            const achievementIndex = userData.achievements.indexOf(achievementId);
            if (achievementIndex === -1) {
                return message.reply(`❌ ${user.displayName} ne possède pas l'exploit **${achievement.name}**.`);
            }

            // Retirer l'exploit
            userData.achievements.splice(achievementIndex, 1);
            userData.experience = Math.max(0, userData.experience - (achievement.xp || 100));
            
            // Recalculer le niveau
            userData.level = Math.floor(userData.experience / 1000) + 1;

            bot.saveDatabase();

            const embed = bot.functions.createSuccessEmbed(
                'Exploit retiré',
                `**${achievement.name}** ${achievement.emoji || '🏆'} retiré de ${user.displayName}.\n\n**XP retirée:** ${achievement.xp || 100}`
            );

            await message.reply({ embeds: [embed] });

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur',
                'Impossible de trouver cet utilisateur ou de retirer l\'exploit.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async listUserAchievements(message, userId, bot) {
        if (!userId) {
            return message.reply('❌ Usage: `!achievements-manage list @user`');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            const userData = bot.getUserData(cleanUserId, message.guild.id);
            
            if (userData.achievements.length === 0) {
                const embed = bot.functions.createInfoEmbed(
                    'Aucun exploit',
                    `${user.displayName} n'a débloqué aucun exploit.`
                );
                return message.reply({ embeds: [embed] });
            }

            const achievementsList = userData.achievements.map(achievementId => {
                const [category, id] = achievementId.split('_');
                const achievement = bot.achievements[category]?.find(a => a.id === id);
                return achievement ? 
                    `${achievement.emoji || '🏆'} **${achievement.name}** (${category})` : 
                    `❓ **Exploit inconnu** (${achievementId})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Exploits de ${user.displayName}`)
                .setDescription(`**${userData.achievements.length}** exploit(s) débloqué(s)\n\n${achievementsList}`)
                .setColor('#9932CC')
                .addFields([
                    {
                        name: '📊 Statistiques',
                        value: `**Niveau:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Progression:** ${Math.round((userData.achievements.length / Object.values(bot.achievements).flat().length) * 100)}%`,
                        inline: false
                    }
                ])
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur',
                'Impossible de trouver cet utilisateur.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async forceCheckAchievements(message, userId, bot) {
        if (!userId) {
            return message.reply('❌ Usage: `!achievements-manage force @user`');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            
            const newAchievements = await bot.checkAchievements(
                cleanUserId, 
                message.guild.id, 
                message.guild, 
                { silent: false }
            );

            const embed = new EmbedBuilder()
                .setTitle('🔍 Vérification forcée des exploits')
                .setDescription(`Vérification terminée pour ${user.displayName}`)
                .setColor('#4ECDC4')
                .addFields([
                    {
                        name: '📊 Résultats',
                        value: newAchievements.length > 0 ? 
                            `**${newAchievements.length}** nouvel(le)(s) exploit(s) débloqué(s) !\n\n${newAchievements.map(({achievement}) => `${achievement.emoji || '🏆'} ${achievement.name}`).join('\n')}` :
                            'Aucun nouvel exploit débloqué.',
                        inline: false
                    }
                ])
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur',
                'Impossible de vérifier les exploits pour cet utilisateur.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
};