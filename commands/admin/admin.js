

// events/interactionCreate.js
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, bot) {
        if (!interaction.guild) return;

        try {
            // =================== BOUTONS ===================
            if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction, bot);
            }
            
            // =================== MENUS DE SÉLECTION ===================
            else if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenuInteraction(interaction, bot);
            }
            
            // =================== SLASH COMMANDS (si implémentées) ===================
            else if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction, bot);
            }
            
        } catch (error) {
            console.error('Erreur lors du traitement de l\'interaction:', error);
            
            const errorMessage = {
                content: '❌ Une erreur est survenue lors du traitement de votre interaction.',
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },

    async handleButtonInteraction(interaction, bot) {
        const { customId } = interaction;
        
        // Navigation dans les achievements
        if (customId.startsWith('achievements_')) {
            const category = customId.replace('achievements_', '');
            
            if (category === 'overview') {
                // Afficher la vue d'ensemble des achievements
                return this.showAchievementsOverview(interaction, bot);
            }
            
            // Afficher une catégorie spécifique
            const achievementsCommand = bot.commands.get('achievements');
            if (achievementsCommand) {
                // Simuler l'exécution avec la catégorie
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    reply: async (content) => interaction.update(content)
                };
                
                await achievementsCommand.execute(fakeMessage, [category], bot);
            }
        }
        
        // Boutons du panel admin
        else if (customId.startsWith('admin_')) {
            const action = customId.replace('admin_', '');
            await this.handleAdminAction(interaction, action, bot);
        }
        
        // Actions rapides depuis l'aide
        else if (customId === 'quick_stats') {
            const statsCommand = bot.commands.get('stats');
            if (statsCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    mentions: { users: { first: () => null } },
                    reply: async (content) => interaction.reply({ ...content, ephemeral: true })
                };
                
                await statsCommand.execute(fakeMessage, [], bot);
            }
        }
        
        else if (customId === 'quick_achievements') {
            const achievementsCommand = bot.commands.get('achievements');
            if (achievementsCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    reply: async (content) => interaction.reply({ ...content, ephemeral: true })
                };
                
                await achievementsCommand.execute(fakeMessage, [], bot);
            }
        }
    },

    async handleSelectMenuInteraction(interaction, bot) {
        const { customId, values } = interaction;
        
        if (customId === 'leaderboard_category') {
            const category = values[0];
            const leaderboardCommand = bot.commands.get('leaderboard');
            
            if (leaderboardCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    reply: async (content) => interaction.update(content)
                };
                
                await leaderboardCommand.execute(fakeMessage, [category], bot);
            }
        }
        
        else if (customId === 'help_category') {
            const category = values[0];
            await this.showCommandsByCategory(interaction, category, bot);
        }
    },

    async handleSlashCommand(interaction, bot) {
        // À implémenter si vous voulez supporter les slash commands
        await interaction.reply({ 
            content: '⚠️ Les slash commands ne sont pas encore implémentées. Utilisez les commandes avec préfixe `!`', 
            ephemeral: true 
        });
    },

    async showCommandsByCategory(interaction, category, bot) {
        const { EmbedBuilder } = require('discord.js');
        
        const commands = bot.commands.filter(cmd => cmd.data.category === category);
        
        if (commands.size === 0) {
            return interaction.update({
                content: `❌ Aucune commande trouvée dans la catégorie \`${category}\`.`,
                ephemeral: true
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📚 Commandes - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
            .setColor('#4ECDC4')
            .setTimestamp();
        
        let description = '';
        commands.forEach(command => {
            description += `**${process.env.PREFIX || '!'}${command.data.name}** ${command.data.usage || ''}\n`;
            description += `${command.data.description || 'Aucune description'}\n\n`;
        });
        
        embed.setDescription(description);
        
        await interaction.update({ embeds: [embed] });
    },

    async handleAdminAction(interaction, action, bot) {
        // Vérifier les permissions admin
        const adminIds = process.env.ADMIN_IDS?.split(',') || [];
        if (!adminIds.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas la permission d\'utiliser cette fonction.',
                ephemeral: true
            });
        }
        
        const adminCommand = bot.commands.get('admin');
        if (adminCommand) {
            const fakeMessage = {
                author: interaction.user,
                guild: interaction.guild,
                member: interaction.member,
                reply: async (content) => interaction.update(content)
            };
            
            await adminCommand.execute(fakeMessage, [action], bot);
        }
    }
};