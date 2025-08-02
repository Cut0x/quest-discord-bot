

// commands/utility/server.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'server',
        description: 'Informations sur le serveur Discord',
        aliases: ['serveur', 'serverinfo', 'guild'],
        usage: '',
        category: 'utility',
        cooldown: 30000
    },

    async execute(message, args, bot) {
        const guild = message.guild;
        const owner = await guild.fetchOwner();
        
        // Compter les statistiques des utilisateurs
        const usersWithData = Object.keys(bot.database.users).filter(userId => 
            bot.database.users[userId][guild.id]
        ).length;
        
        const totalMessages = Object.values(bot.database.users)
            .filter(user => user[guild.id])
            .reduce((total, user) => total + (user[guild.id].messagesCount || 0), 0);
        
        const totalVoiceTime = Object.values(bot.database.users)
            .filter(user => user[guild.id])
            .reduce((total, user) => total + (user[guild.id].voiceTime || 0), 0);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Informations sur ${guild.name}`)
            .setDescription(guild.description || 'Aucune description configurée')
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setColor('#7289DA')
            .addFields([
                {
                    name: '👑 Propriétaire',
                    value: `${owner.user.tag}\n${owner}`,
                    inline: true
                },
                {
                    name: '📅 Création',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: '🆔 ID',
                    value: guild.id,
                    inline: true
                },
                {
                    name: '👥 Membres',
                    value: `**Total:** ${guild.memberCount}\n**Humains:** ${guild.members.cache.filter(m => !m.user.bot).size}\n**Bots:** ${guild.members.cache.filter(m => m.user.bot).size}`,
                    inline: true
                },
                {
                    name: '📺 Canaux',
                    value: `**Texte:** ${guild.channels.cache.filter(c => c.type === 0).size}\n**Vocal:** ${guild.channels.cache.filter(c => c.type === 2).size}\n**Catégories:** ${guild.channels.cache.filter(c => c.type === 4).size}`,
                    inline: true
                },
                {
                    name: '🏷️ Rôles',
                    value: `${guild.roles.cache.size} rôles`,
                    inline: true
                },
                {
                    name: '🚀 Boosts',
                    value: `**Niveau:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
                    inline: true
                },
                {
                    name: '🎮 Activité QuestBot',
                    value: `**Utilisateurs trackés:** ${usersWithData}\n**Messages totaux:** ${bot.formatNumber(totalMessages)}\n**Temps vocal total:** ${bot.formatDuration ? bot.formatDuration(totalVoiceTime) : totalVoiceTime + ' min'}`,
                    inline: true
                },
                {
                    name: '🔧 Fonctionnalités',
                    value: this.getGuildFeatures(guild),
                    inline: false
                }
            ])
            .setFooter({ text: `Vous avez rejoint ce serveur` })
            .setTimestamp(message.member.joinedTimestamp);

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await message.reply({ embeds: [embed] });
    },

    getGuildFeatures(guild) {
        const features = guild.features;
        const featureNames = {
            'ANIMATED_ICON': '🎭 Icône animée',
            'BANNER': '🖼️ Bannière',
            'COMMERCE': '🛍️ Commerce',
            'COMMUNITY': '🏘️ Communauté',
            'DISCOVERABLE': '🔍 Découvrable',
            'FEATURABLE': '⭐ Mise en avant',
            'INVITE_SPLASH': '🌊 Écran d\'accueil d\'invitation',
            'MEMBER_VERIFICATION_GATE_ENABLED': '✅ Vérification des membres',
            'NEWS': '📰 Salon d\'annonces',
            'PARTNERED': '🤝 Partenaire',
            'PREVIEW_ENABLED': '👀 Aperçu activé',
            'VANITY_URL': '🔗 URL personnalisée',
            'VERIFIED': '✅ Vérifié',
            'VIP_REGIONS': '🌟 Régions VIP'
        };

        if (features.length === 0) {
            return 'Aucune fonctionnalité spéciale';
        }

        return features
            .map(feature => featureNames[feature] || feature)
            .slice(0, 5)
            .join('\n') + (features.length > 5 ? `\n... et ${features.length - 5} autre(s)` : '');
    }
};