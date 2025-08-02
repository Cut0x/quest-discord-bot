// commands/user/stats.js
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stats',
        description: 'Affiche vos statistiques détaillées',
        aliases: ['statistiques', 'stat'],
        usage: '[utilisateur]',
        category: 'user',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const targetUser = message.mentions.users.first() || 
                          await bot.client.users.fetch(args[0]).catch(() => null) || 
                          message.author;
        
        const userData = bot.getUserData(targetUser.id, message.guild.id);
        
        try {
            // Créer l'image de profil avec Canvas
            const profileImage = await bot.createProgressCard(targetUser.id, message.guild.id, targetUser);
            const attachment = new AttachmentBuilder(profileImage, { name: 'profile.png' });
            
            const embed = new EmbedBuilder()
                .setTitle(`📊 Statistiques de ${targetUser.displayName}`)
                .setDescription(`Voici un aperçu détaillé de la progression sur **${bot.client.guilds.cache.get(message.guild.id).name}**`)
                .setColor(bot.config?.colors?.primary || '#FFD700')
                .setImage('attachment://profile.png')
                .addFields([
                    {
                        name: '🏆 Résumé',
                        value: `**Niveau:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Exploits:** ${userData.achievements.length}`,
                        inline: true
                    },
                    {
                        name: '📈 Activité',
                        value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Temps vocal:** ${bot.formatDuration(userData.voiceTime)}\n**Événements:** ${userData.eventsParticipated}`,
                        inline: true
                    },
                    {
                        name: '❤️ Social',
                        value: `**Réactions données:** ${bot.formatNumber(userData.reactionsGiven)}\n**Réactions reçues:** ${bot.formatNumber(userData.reactionsReceived)}\n**Félicitations:** ${userData.congratulationsSent}/${userData.congratulationsReceived}`,
                        inline: true
                    }
                ])
                .setFooter({ text: `Membre depuis • ${new Date(userData.joinedAt).toLocaleDateString('fr-FR')}` })
                .setTimestamp();
            
            await message.reply({ embeds: [embed], files: [attachment] });
            
        } catch (error) {
            console.error('Erreur lors de la création du profil:', error);
            
            // Fallback vers un embed simple en cas d'erreur avec Canvas
            const fallbackEmbed = new EmbedBuilder()
                .setTitle(`📊 Statistiques de ${targetUser.displayName}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setColor('#FFD700')
                .addFields([
                    { name: '💬 Messages', value: userData.messagesCount.toString(), inline: true },
                    { name: '❤️ Réactions données', value: userData.reactionsGiven.toString(), inline: true },
                    { name: '🎙️ Temps vocal', value: `${userData.voiceTime} min`, inline: true },
                    { name: '🎭 Événements', value: userData.eventsParticipated.toString(), inline: true },
                    { name: '🏆 Niveau', value: userData.level.toString(), inline: true },
                    { name: '⭐ XP', value: userData.experience.toString(), inline: true }
                ])
                .setTimestamp();
            
            await message.reply({ embeds: [fallbackEmbed] });
        }
    }
};