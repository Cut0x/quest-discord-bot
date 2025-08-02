

// commands/user/profile.js
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'profile',
        description: 'Affiche le profil complet d\'un utilisateur',
        aliases: ['profil', 'me', 'moi'],
        usage: '[utilisateur]',
        category: 'user',
        cooldown: 60000
    },

    async execute(message, args, bot) {
        const targetUser = message.mentions.users.first() || 
                          await bot.client.users.fetch(args[0]).catch(() => null) || 
                          message.author;
        
        const userData = bot.getUserData(targetUser.id, message.guild.id);
        const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
        
        try {
            // Créer l'image de profil avancée
            const profileImage = await bot.createAdvancedProfile(targetUser, userData, member);
            const attachment = new AttachmentBuilder(profileImage, { name: 'advanced_profile.png' });
            
            // Calculer les statistiques avancées
            const totalAchievements = Object.values(bot.achievements).flat().length;
            const completionRate = Math.round((userData.achievements.length / totalAchievements) * 100);
            const nextLevelXP = (userData.level * 1000);
            const currentLevelXP = ((userData.level - 1) * 1000);
            const progressToNext = userData.experience - currentLevelXP;
            const neededForNext = nextLevelXP - userData.experience;
            
            const embed = new EmbedBuilder()
                .setTitle(`🎮 Profil de ${targetUser.displayName}`)
                .setDescription(`${member?.nickname ? `*Aussi connu sous:* **${member.nickname}**\n` : ''}Membre actif de **${message.guild.name}** depuis le ${new Date(userData.joinedAt).toLocaleDateString('fr-FR')}`)
                .setColor(member?.displayHexColor || '#FFD700')
                .setImage('attachment://advanced_profile.png')
                .addFields([
                    {
                        name: '🎯 Progression',
                        value: `**Niveau:** ${userData.level} (${progressToNext}/${nextLevelXP - currentLevelXP} XP)\n**Prochain niveau:** ${neededForNext > 0 ? `${neededForNext} XP restants` : 'MAX'}\n**Complétion:** ${completionRate}% (${userData.achievements.length}/${totalAchievements})`,
                        inline: false
                    },
                    {
                        name: '🏆 Derniers exploits',
                        value: this.getLatestAchievements(userData, bot) || 'Aucun exploit débloqué',
                        inline: false
                    }
                ])
                .setFooter({ text: `ID: ${targetUser.id} • Dernière activité: ${new Date(userData.lastActivity).toLocaleDateString('fr-FR')}` })
                .setTimestamp();
            
            // Boutons d'interaction
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`view_achievements_${targetUser.id}`)
                        .setLabel('🏆 Exploits')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`view_stats_${targetUser.id}`)
                        .setLabel('📊 Stats détaillées')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`compare_${targetUser.id}`)
                        .setLabel('⚖️ Comparer')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            await message.reply({ embeds: [embed], files: [attachment], components: [row] });
            
        } catch (error) {
            console.error('Erreur lors de la création du profil avancé:', error);
            
            // Utiliser la commande stats en fallback
            const statsCommand = bot.commands.get('stats');
            if (statsCommand) {
                return statsCommand.execute(message, args, bot);
            }
        }
    },

    getLatestAchievements(userData, bot, limit = 3) {
        if (!userData.achievements.length) return null;
        
        // Récupérer les derniers exploits (simulé par ordre inverse)
        const latestAchievements = userData.achievements.slice(-limit).reverse();
        
        return latestAchievements.map(achievementId => {
            const [category, id] = achievementId.split('_');
            const achievement = bot.achievements[category]?.find(a => a.id === id);
            return achievement ? `${achievement.emoji || '🏆'} ${achievement.name}` : '❓ Exploit inconnu';
        }).join('\n') || 'Aucun exploit récent';
    }
};