// commands/admin/data-manage.js
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'data-manage',
        description: 'Gestion des données utilisateur',
        aliases: ['manage-data', 'data'],
        usage: '[action] [utilisateur] [paramètres]',
        category: 'admin',
        cooldown: 5000,
        permissions: ['admin']
    },

    async execute(message, args, bot) {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            return this.showDataPanel(message, bot);
        }

        switch (action) {
            case 'view':
                return this.viewUserData(message, args[1], bot);
            case 'edit':
                return this.editUserData(message, args[1], args[2], args[3], bot);
            case 'export':
                return this.exportUserData(message, args[1], bot);
            case 'import':
                return this.importUserData(message, bot);
            case 'migrate':
                return this.migrateUserData(message, args[1], args[2], bot);
            case 'analytics':
                return this.showAnalytics(message, bot);
            default:
                return message.reply('❌ Action invalide. Utilisez: `view`, `edit`, `export`, `import`, `migrate`, `analytics`');
        }
    },

    async showDataPanel(message, bot) {
        const userCount = Object.keys(bot.database.users).length;
        const guildUserCount = Object.keys(bot.database.users).filter(userId => 
            bot.database.users[userId][message.guild.id]
        ).length;

        const embed = new EmbedBuilder()
            .setTitle('📊 Gestion des Données Utilisateur')
            .setDescription('Panel de gestion des données et analytics')
            .setColor('#FF6B6B')
            .addFields([
                {
                    name: '📈 Statistiques',
                    value: `**Utilisateurs globaux:** ${userCount}\n**Utilisateurs serveur:** ${guildUserCount}\n**Dernière sauvegarde:** ${new Date(bot.database.lastModified || Date.now()).toLocaleString('fr-FR')}`,
                    inline: true
                },
                {
                    name: '🔧 Actions disponibles',
                    value: '`view [user]` - Voir les données\n`edit [user] [field] [value]` - Modifier\n`export [user]` - Exporter\n`analytics` - Analytics serveur',
                    inline: true
                },
                {
                    name: '⚠️ Sécurité',
                    value: 'Toutes les actions sont loggées\nSauvegarde automatique avant modification\nRespect du RGPD',
                    inline: false
                }
            ])
            .setFooter({ text: 'Utilisez !data-manage [action] pour commencer' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async viewUserData(message, userId, bot) {
        if (!userId) {
            return message.reply('❌ Usage: `!data-manage view @user`');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            const userData = bot.getUserData(cleanUserId, message.guild.id);
            
            const embed = new EmbedBuilder()
                .setTitle(`📊 Données de ${user.displayName}`)
                .setThumbnail(user.displayAvatarURL())
                .setColor('#4ECDC4')
                .addFields([
                    {
                        name: '🎮 Progression',
                        value: `**Niveau:** ${userData.level}\n**XP:** ${bot.formatNumber(userData.experience)}\n**Exploits:** ${userData.achievements.length}`,
                        inline: true
                    },
                    {
                        name: '💬 Communication',
                        value: `**Messages:** ${bot.formatNumber(userData.messagesCount)}\n**Réactions données:** ${bot.formatNumber(userData.reactionsGiven)}\n**Réactions reçues:** ${bot.formatNumber(userData.reactionsReceived)}`,
                        inline: true
                    },
                    {
                        name: '🎙️ Vocal',
                        value: `**Temps vocal:** ${bot.formatDuration(userData.voiceTime)}\n**Temps caméra:** ${bot.formatDuration(userData.cameraTime)}\n**Temps stream:** ${bot.formatDuration(userData.streamTime)}`,
                        inline: true
                    },
                    {
                        name: '🎉 Social',
                        value: `**Félicitations envoyées:** ${userData.congratulationsSent}\n**Félicitations reçues:** ${userData.congratulationsReceived}\n**Événements:** ${userData.eventsParticipated}`,
                        inline: true
                    },
                    {
                        name: '📅 Métadonnées',
                        value: `**Rejoint:** ${new Date(userData.joinedAt).toLocaleDateString('fr-FR')}\n**Dernière activité:** ${new Date(userData.lastActivity).toLocaleDateString('fr-FR')}\n**Boosts:** ${userData.boosts}`,
                        inline: true
                    },
                    {
                        name: '🏆 Exploits récents',
                        value: userData.achievements.length > 0 ? 
                            userData.achievements.slice(-5).map(id => {
                                const [cat, achId] = id.split('_');
                                const ach = bot.achievements[cat]?.find(a => a.id === achId);
                                return ach ? `${ach.emoji || '🏆'} ${ach.name}` : id;
                            }).join('\n') : 'Aucun exploit',
                        inline: false
                    }
                ])
                .setFooter({ text: `ID: ${cleanUserId}` })
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

    async editUserData(message, userId, field, value, bot) {
        if (!userId || !field || value === undefined) {
            return message.reply('❌ Usage: `!data-manage edit @user [field] [value]`\nChamps modifiables: `level`, `experience`, `messagesCount`, `voiceTime`, etc.');
        }

        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            const userData = bot.getUserData(cleanUserId, message.guild.id);
            
            // Vérifier si le champ existe
            if (!(field in userData)) {
                return message.reply(`❌ Champ \`${field}\` non trouvé. Champs disponibles: ${Object.keys(userData).join(', ')}`);
            }

            // Sauvegarder l'ancienne valeur
            const oldValue = userData[field];
            
            // Convertir la valeur selon le type
            let newValue;
            if (typeof oldValue === 'number') {
                newValue = parseInt(value) || 0;
            } else if (typeof oldValue === 'boolean') {
                newValue = value.toLowerCase() === 'true';
            } else if (Array.isArray(oldValue)) {
                return message.reply('❌ Impossible de modifier directement un tableau. Utilisez les commandes spécialisées.');
            } else {
                newValue = value;
            }

            // Effectuer la modification
            userData[field] = newValue;
            bot.saveDatabase();

            const embed = bot.functions.createSuccessEmbed(
                'Données modifiées',
                `**Utilisateur:** ${user.displayName}\n**Champ:** \`${field}\`\n**Ancienne valeur:** \`${oldValue}\`\n**Nouvelle valeur:** \`${newValue}\``
            );

            await message.reply({ embeds: [embed] });

            // Log de l'action
            console.log(`🔧 Admin ${message.author.tag} a modifié ${field} de ${user.tag}: ${oldValue} → ${newValue}`);

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur',
                `Impossible de modifier les données: ${error.message}`
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async exportUserData(message, userId, bot) {
        const cleanUserId = userId ? userId.replace(/[<@!>]/g, '') : null;
        
        try {
            let exportData;
            let filename;
            
            if (cleanUserId) {
                // Export d'un utilisateur spécifique
                const user = await bot.client.users.fetch(cleanUserId);
                const userData = bot.getUserData(cleanUserId, message.guild.id);
                
                exportData = {
                    user: {
                        id: cleanUserId,
                        tag: user.tag,
                        displayName: user.displayName
                    },
                    data: userData,
                    exported: new Date().toISOString(),
                    server: {
                        id: message.guild.id,
                        name: message.guild.name
                    }
                };
                
                filename = `user_${cleanUserId}_${Date.now()}.json`;
            } else {
                // Export de tout le serveur
                const serverUsers = {};
                for (const userId in bot.database.users) {
                    if (bot.database.users[userId][message.guild.id]) {
                        serverUsers[userId] = bot.database.users[userId][message.guild.id];
                    }
                }
                
                exportData = {
                    server: {
                        id: message.guild.id,
                        name: message.guild.name
                    },
                    users: serverUsers,
                    exported: new Date().toISOString(),
                    totalUsers: Object.keys(serverUsers).length
                };
                
                filename = `server_${message.guild.id}_${Date.now()}.json`;
            }

            const attachment = new AttachmentBuilder(
                Buffer.from(JSON.stringify(exportData, null, 2)), 
                { name: filename }
            );

            const embed = bot.functions.createSuccessEmbed(
                'Export réussi',
                `${cleanUserId ? 'Données utilisateur' : 'Données serveur'} exportées avec succès.\n\n**Fichier:** ${filename}\n**Taille:** ${Buffer.byteLength(JSON.stringify(exportData))} bytes`
            );

            await message.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur d\'export',
                `Impossible d'exporter les données: ${error.message}`
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async showAnalytics(message, bot) {
        const serverUsers = {};
        for (const userId in bot.database.users) {
            if (bot.database.users[userId][message.guild.id]) {
                serverUsers[userId] = bot.database.users[userId][message.guild.id];
            }
        }

        const users = Object.values(serverUsers);
        if (users.length === 0) {
            return message.reply('❌ Aucune donnée à analyser.');
        }

        // Calculs analytiques
        const totalMessages = users.reduce((sum, user) => sum + user.messagesCount, 0);
        const totalVoiceTime = users.reduce((sum, user) => sum + user.voiceTime, 0);
        const totalXP = users.reduce((sum, user) => sum + user.experience, 0);
        const totalAchievements = users.reduce((sum, user) => sum + user.achievements.length, 0);

        const avgMessages = Math.round(totalMessages / users.length);
        const avgVoiceTime = Math.round(totalVoiceTime / users.length);
        const avgLevel = users.reduce((sum, user) => sum + user.level, 0) / users.length;

        // Top utilisateurs
        const topMessagers = users.sort((a, b) => b.messagesCount - a.messagesCount).slice(0, 5);
        const topVocal = users.sort((a, b) => b.voiceTime - a.voiceTime).slice(0, 5);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Analytics - ${message.guild.name}`)
            .setColor('#9932CC')
            .addFields([
                {
                    name: '📈 Statistiques globales',
                    value: `**Utilisateurs actifs:** ${users.length}\n**Messages totaux:** ${bot.formatNumber(totalMessages)}\n**Temps vocal total:** ${bot.formatDuration(totalVoiceTime)}\n**XP totale:** ${bot.formatNumber(totalXP)}`,
                    inline: true
                },
                {
                    name: '📊 Moyennes',
                    value: `**Messages/utilisateur:** ${bot.formatNumber(avgMessages)}\n**Temps vocal/utilisateur:** ${bot.formatDuration(avgVoiceTime)}\n**Niveau moyen:** ${avgLevel.toFixed(1)}\n**Exploits totaux:** ${totalAchievements}`,
                    inline: true
                },
                {
                    name: '🏆 Top Messages (Top 3)',
                    value: topMessagers.slice(0, 3).map((user, i) => `${i + 1}. ${bot.formatNumber(user.messagesCount)} messages`).join('\n') || 'Aucune donnée',
                    inline: true
                },
                {
                    name: '🎙️ Top Vocal (Top 3)',
                    value: topVocal.slice(0, 3).map((user, i) => `${i + 1}. ${bot.formatDuration(user.voiceTime)}`).join('\n') || 'Aucune donnée',
                    inline: true
                },
                {
                    name: '📅 Activité récente',
                    value: `**Dernière semaine:** ${users.filter(u => new Date(u.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} utilisateurs\n**Dernière 24h:** ${users.filter(u => new Date(u.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} utilisateurs`,
                    inline: true
                }
            ])
            .setFooter({ text: `Généré le ${new Date().toLocaleString('fr-FR')}` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};