

// commands/utility/user.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'user',
        description: 'Informations sur un utilisateur Discord',
        aliases: ['userinfo', 'membre', 'member'],
        usage: '[utilisateur]',
        category: 'utility',
        cooldown: 10000
    },

    async execute(message, args, bot) {
        const targetUser = message.mentions.users.first() || 
                          await bot.client.users.fetch(args[0]).catch(() => null) || 
                          message.author;
        
        const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
        const userData = bot.getUserData(targetUser.id, message.guild.id);

        const embed = new EmbedBuilder()
            .setTitle(`👤 Informations sur ${targetUser.displayName}`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
            .setColor(member?.displayHexColor || '#7289DA')
            .addFields([
                {
                    name: '🏷️ Identité',
                    value: `**Tag:** ${targetUser.tag}\n**ID:** ${targetUser.id}\n**Pseudo:** ${member?.nickname || 'Aucun'}`,
                    inline: true
                },
                {
                    name: '📅 Dates',
                    value: `**Compte créé:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>\n**Rejoint le serveur:** ${member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A'}`,
                    inline: true
                },
                {
                    name: '🎮 Activité QuestBot',
                    value: `**Niveau:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Exploits:** ${userData.achievements.length}`,
                    inline: true
                }
            ]);

        // Informations sur le membre (si disponible)
        if (member) {
            // Rôles (limiter à 10)
            const roles = member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10);

            if (roles.length > 0) {
                embed.addFields({
                    name: '🏷️ Rôles',
                    value: roles.join(' ') + (member.roles.cache.size > 11 ? `\n... et ${member.roles.cache.size - 11} autre(s)` : ''),
                    inline: false
                });
            }

            // Permissions clés
            const keyPermissions = [];
            if (member.permissions.has('Administrator')) keyPermissions.push('👑 Administrateur');
            if (member.permissions.has('ManageGuild')) keyPermissions.push('⚙️ Gérer le serveur');
            if (member.permissions.has('ManageRoles')) keyPermissions.push('🏷️ Gérer les rôles');
            if (member.permissions.has('ManageChannels')) keyPermissions.push('📺 Gérer les salons');
            if (member.permissions.has('KickMembers')) keyPermissions.push('👢 Expulser');
            if (member.permissions.has('BanMembers')) keyPermissions.push('🔨 Bannir');

            if (keyPermissions.length > 0) {
                embed.addFields({
                    name: '🔑 Permissions clés',
                    value: keyPermissions.slice(0, 6).join('\n') + (keyPermissions.length > 6 ? '\n...' : ''),
                    inline: true
                });
            }

            // Boost
            if (member.premiumSince) {
                embed.addFields({
                    name: '🚀 Boost',
                    value: `Booste depuis <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`,
                    inline: true
                });
            }

            // Status et activité
            const presence = member.presence;
            if (presence) {
                const statusEmojis = {
                    'online': '🟢 En ligne',
                    'idle': '🟡 Absent',
                    'dnd': '🔴 Ne pas déranger',
                    'offline': '⚫ Hors ligne'
                };

                embed.addFields({
                    name: '💬 Statut',
                    value: statusEmojis[presence.status] || '❓ Inconnu',
                    inline: true
                });

                if (presence.activities && presence.activities.length > 0) {
                    const activity = presence.activities[0];
                    embed.addFields({
                        name: '🎮 Activité',
                        value: `**${activity.type === 0 ? 'Joue à' : 'Activité'}:** ${activity.name}`,
                        inline: true
                    });
                }
            }
        }

        // Statistiques détaillées
        embed.addFields({
            name: '📊 Statistiques détaillées',
            value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Temps vocal:** ${bot.formatDuration ? bot.formatDuration(userData.voiceTime) : userData.voiceTime + 'min'}\n**Réactions:** ${userData.reactionsGiven}/${userData.reactionsReceived}\n**Événements:** ${userData.eventsParticipated}`,
            inline: false
        });

        // Avatar en grand si différent de la miniature
        if (targetUser.avatar) {
            embed.setImage(targetUser.displayAvatarURL({ size: 512 }));
        }

        embed.setFooter({ 
            text: `Informations demandées par ${message.author.tag}` 
        })
        .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};