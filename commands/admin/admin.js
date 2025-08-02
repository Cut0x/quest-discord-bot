// commands/admin/admin.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'admin',
        description: 'Commandes d\'administration du bot',
        aliases: ['administration', 'manage'],
        usage: '[action] [paramètres]',
        category: 'admin',
        cooldown: 5000,
        permissions: ['admin']
    },

    async execute(message, args, bot) {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            return this.showAdminPanel(message, bot);
        }

        switch (action) {
            case 'stats':
                return this.showBotStats(message, bot);
            case 'reload':
                return this.reloadCommand(message, args[1], bot);
            case 'backup':
                return this.createBackup(message, bot);
            case 'reset':
                return this.resetUserData(message, args[1], bot);
            case 'clear':
                return this.clearDatabase(message, bot);
            case 'maintenance':
                return this.toggleMaintenance(message, bot);
            case 'eval':
                return this.evaluateCode(message, args.slice(1).join(' '), bot);
            default:
                return message.reply('❌ Action inconnue. Utilisez `!admin` pour voir le panel.');
        }
    },

    async showAdminPanel(message, bot) {
        const stats = bot.getStats();
        
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Panel d\'Administration - QuestBot Advanced')
            .setDescription('Gestion et contrôle du bot')
            .setColor('#FF6B6B')
            .addFields([
                {
                    name: '📊 Statistiques rapides',
                    value: `**Uptime:** ${stats.uptime}\n**Commandes exécutées:** ${bot.formatNumber(stats.commandsExecuted)}\n**Messages traités:** ${bot.formatNumber(stats.messagesProcessed)}\n**Exploits débloqués:** ${bot.formatNumber(stats.achievementsUnlocked)}`,
                    inline: true
                },
                {
                    name: '💾 Base de données',
                    value: `**Utilisateurs:** ${stats.database.users}\n**Données serveur:** ${stats.database.totalUserGuildData}\n**Dernière sauvegarde:** ${new Date(bot.database.lastModified || Date.now()).toLocaleTimeString('fr-FR')}`,
                    inline: true
                },
                {
                    name: '🔧 Actions disponibles',
                    value: '`!admin stats` - Statistiques détaillées\n`!admin reload [cmd]` - Recharger une commande\n`!admin backup` - Sauvegarde manuelle\n`!admin reset [user]` - Reset utilisateur',
                    inline: false
                }
            ])
            .setFooter({ text: `Connecté sur ${stats.guilds} serveur(s) • ${stats.users} utilisateurs` })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_stats')
                    .setLabel('📊 Stats détaillées')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_backup')
                    .setLabel('💾 Sauvegarde')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('admin_maintenance')
                    .setLabel('🔧 Maintenance')
                    .setStyle(ButtonStyle.Danger)
            );

        await message.reply({ embeds: [embed], components: [row] });
    },

    async showBotStats(message, bot) {
        const stats = bot.getStats();
        const process_stats = process.memoryUsage();
        const os = require('os');

        const embed = new EmbedBuilder()
            .setTitle('📊 Statistiques Détaillées du Bot')
            .setColor('#4ECDC4')
            .addFields([
                {
                    name: '🤖 Bot Discord',
                    value: `**Serveurs:** ${stats.guilds}\n**Utilisateurs:** ${stats.users}\n**Commandes:** ${stats.commands}\n**Uptime:** ${stats.uptime}`,
                    inline: true
                },
                {
                    name: '📈 Activité',
                    value: `**Messages:** ${bot.formatNumber(stats.messagesProcessed)}\n**Commandes:** ${bot.formatNumber(stats.commandsExecuted)}\n**Exploits:** ${bot.formatNumber(stats.achievementsUnlocked)}\n**Erreurs:** ${bot.errors || 0}`,
                    inline: true
                },
                {
                    name: '💾 Mémoire',
                    value: `**Heap utilisé:** ${(process_stats.heapUsed / 1024 / 1024).toFixed(2)} MB\n**Heap total:** ${(process_stats.heapTotal / 1024 / 1024).toFixed(2)} MB\n**RSS:** ${(process_stats.rss / 1024 / 1024).toFixed(2)} MB\n**RAM libre:** ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    inline: true
                },
                {
                    name: '🗄️ Base de données',
                    value: `**Utilisateurs trackés:** ${stats.database.users}\n**Données serveur:** ${stats.database.totalUserGuildData}\n**Taille cache:** ${bot.functions.cache.size}\n**Version:** ${bot.database.version}`,
                    inline: true
                },
                {
                    name: '⚙️ Système',
                    value: `**OS:** ${os.type()} ${os.arch()}\n**Node.js:** ${process.version}\n**Discord.js:** v${require('discord.js').version}\n**CPU:** ${os.cpus()[0].model.slice(0, 30)}...`,
                    inline: true
                },
                {
                    name: '🎮 Exploits configurés',
                    value: Object.entries(bot.achievements)
                        .map(([cat, achievements]) => `**${bot.categories[cat]?.name || cat}:** ${achievements.length}`)
                        .join('\n'),
                    inline: true
                }
            ])
            .setFooter({ text: 'QuestBot Advanced • Panel Admin' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async reloadCommand(message, commandName, bot) {
        if (!commandName) {
            return message.reply('❌ Veuillez spécifier une commande à recharger. Ex: `!admin reload stats`');
        }

        try {
            const success = await bot.reloadCommand(commandName);
            if (success) {
                const embed = bot.functions.createSuccessEmbed(
                    'Commande rechargée',
                    `La commande \`${commandName}\` a été rechargée avec succès.`
                );
                await message.reply({ embeds: [embed] });
            } else {
                const embed = bot.functions.createErrorEmbed(
                    'Erreur de rechargement',
                    `Impossible de recharger la commande \`${commandName}\`.`
                );
                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur de rechargement',
                `Erreur lors du rechargement: ${error.message}`
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async createBackup(message, bot) {
        try {
            const backupResult = bot.saveDatabase();
            if (backupResult) {
                const embed = bot.functions.createSuccessEmbed(
                    'Sauvegarde créée',
                    `Base de données sauvegardée avec succès.\n**Timestamp:** ${new Date().toLocaleString('fr-FR')}`
                );
                await message.reply({ embeds: [embed] });
            } else {
                const embed = bot.functions.createErrorEmbed(
                    'Erreur de sauvegarde',
                    'Impossible de créer la sauvegarde.'
                );
                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur de sauvegarde',
                `Erreur lors de la sauvegarde: ${error.message}`
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async resetUserData(message, userId, bot) {
        if (!userId) {
            return message.reply('❌ Veuillez spécifier un utilisateur. Ex: `!admin reset @user` ou `!admin reset 123456789`');
        }

        // Nettoyer l'ID utilisateur
        const cleanUserId = userId.replace(/[<@!>]/g, '');
        
        try {
            const user = await bot.client.users.fetch(cleanUserId);
            
            if (bot.database.users[cleanUserId] && bot.database.users[cleanUserId][message.guild.id]) {
                delete bot.database.users[cleanUserId][message.guild.id];
                bot.saveDatabase();
                
                const embed = bot.functions.createSuccessEmbed(
                    'Données réinitialisées',
                    `Les données de ${user.displayName} ont été réinitialisées avec succès.`
                );
                await message.reply({ embeds: [embed] });
            } else {
                const embed = bot.functions.createErrorEmbed(
                    'Aucune donnée',
                    `Aucune donnée trouvée pour ${user.displayName} sur ce serveur.`
                );
                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Utilisateur non trouvé',
                'Impossible de trouver cet utilisateur.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async clearDatabase(message, bot) {
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Confirmation requise')
            .setDescription('**ATTENTION:** Cette action va supprimer TOUTES les données de TOUS les utilisateurs sur ce serveur.\n\nCette action est **IRRÉVERSIBLE**.\n\nTapez `CONFIRM DELETE` pour confirmer ou ignorez ce message pour annuler.')
            .setColor('#FF0000')
            .setFooter({ text: 'Vous avez 30 secondes pour confirmer' });

        const confirmMessage = await message.reply({ embeds: [embed] });

        try {
            const filter = (m) => m.author.id === message.author.id && m.content === 'CONFIRM DELETE';
            const collected = await message.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 30000, 
                errors: ['time'] 
            });

            if (collected.size > 0) {
                // Supprimer toutes les données du serveur
                for (const userId in bot.database.users) {
                    if (bot.database.users[userId][message.guild.id]) {
                        delete bot.database.users[userId][message.guild.id];
                    }
                }
                
                bot.saveDatabase();
                
                const successEmbed = bot.functions.createSuccessEmbed(
                    'Base de données nettoyée',
                    'Toutes les données utilisateur de ce serveur ont été supprimées.'
                );
                await message.reply({ embeds: [successEmbed] });
            }
        } catch (error) {
            const cancelEmbed = bot.functions.createInfoEmbed(
                'Action annulée',
                'Le nettoyage de la base de données a été annulé.'
            );
            await message.reply({ embeds: [cancelEmbed] });
        }
    },

    async toggleMaintenance(message, bot) {
        bot.maintenanceMode = !bot.maintenanceMode;
        
        const embed = new EmbedBuilder()
            .setTitle(`🔧 Mode maintenance ${bot.maintenanceMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`)
            .setDescription(bot.maintenanceMode ? 
                'Le bot est maintenant en mode maintenance. Seuls les administrateurs peuvent utiliser les commandes.' :
                'Le bot est de nouveau accessible à tous les utilisateurs.'
            )
            .setColor(bot.maintenanceMode ? '#FFA500' : '#00FF7F')
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async evaluateCode(message, code, bot) {
        if (!code) {
            return message.reply('❌ Veuillez fournir du code à exécuter.');
        }

        try {
            let result = eval(code);
            
            if (typeof result !== 'string') {
                result = require('util').inspect(result, { depth: 0, maxArrayLength: 5 });
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Code exécuté')
                .addFields([
                    {
                        name: '📝 Input',
                        value: `\`\`\`js\n${code.slice(0, 1000)}\`\`\``,
                        inline: false
                    },
                    {
                        name: '📤 Output',
                        value: `\`\`\`js\n${result.toString().slice(0, 1000)}\`\`\``,
                        inline: false
                    }
                ])
                .setColor('#00FF7F')
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            const embed = bot.functions.createErrorEmbed(
                'Erreur d\'exécution',
                `\`\`\`js\n${error.message}\`\`\``
            );
            await message.reply({ embeds: [embed] });
        }
    }
};