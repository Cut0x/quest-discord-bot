// events/interactionCreate.js - Gestion moderne des interactions
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
            
            // =================== SLASH COMMANDS ===================
            else if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction, bot);
            }
            
        } catch (error) {
            console.error('Error processing interaction:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while processing your interaction.',
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
        
        // Quick stats button
        if (customId === 'quick_stats') {
            const statsCommand = bot.commands.get('stats');
            if (statsCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    member: interaction.member,
                    mentions: { users: { first: () => null } },
                    reply: async (content) => interaction.reply({ ...content, ephemeral: true })
                };
                
                await statsCommand.execute(fakeMessage, [], bot);
            }
        }
        
        // Quick leaderboard button
        else if (customId === 'quick_leaderboard') {
            const leaderboardCommand = bot.commands.get('leaderboard');
            if (leaderboardCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    member: interaction.member,
                    reply: async (content) => interaction.reply({ ...content, ephemeral: true })
                };
                
                await leaderboardCommand.execute(fakeMessage, [], bot);
            }
        }
        
        // Canvas demo button
        else if (customId === 'canvas_demo') {
            try {
                await interaction.deferReply({ ephemeral: true });
                
                // Generate a demo profile card
                const demoCard = await bot.createModernProfileCard(
                    interaction.user.id,
                    interaction.guild.id,
                    interaction.user,
                    interaction.member
                );
                
                const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
                const attachment = new AttachmentBuilder(demoCard, { name: 'demo.png' });
                
                const embed = new EmbedBuilder()
                    .setTitle('🎨 Canvas Demo - Modern Profile')
                    .setDescription('Here\'s a demonstration of our modern Canvas-generated profile cards with glassmorphism effects and professional design.')
                    .setImage('attachment://demo.png')
                    .setColor('#667eea')
                    .addFields([
                        {
                            name: '✨ Features',
                            value: '• Glassmorphism effects\n• Modern gradients\n• Professional typography\n• Visual statistics',
                            inline: true
                        },
                        {
                            name: '🎯 Technology',
                            value: '• HTML5 Canvas\n• Node.js Canvas\n• Custom design system\n• Optimized rendering',
                            inline: true
                        }
                    ])
                    .setTimestamp();
                
                await interaction.editReply({
                    embeds: [embed],
                    files: [attachment]
                });
                
            } catch (error) {
                console.error('Canvas demo error:', error);
                await interaction.editReply({
                    content: '❌ Error generating canvas demo. Canvas system might not be properly configured.',
                    ephemeral: true
                });
            }
        }
        
        // Achievement navigation buttons
        else if (customId.startsWith('achievements_')) {
            const category = customId.replace('achievements_', '');
            
            if (category === 'overview') {
                return this.showAchievementsOverview(interaction, bot);
            }
            
            const achievementsCommand = bot.commands.get('achievements');
            if (achievementsCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    member: interaction.member,
                    reply: async (content) => interaction.update(content)
                };
                
                await achievementsCommand.execute(fakeMessage, [category], bot);
            }
        }
        
        // Admin panel buttons
        else if (customId.startsWith('admin_')) {
            const action = customId.replace('admin_', '');
            await this.handleAdminAction(interaction, action, bot);
        }
    },

    async handleSelectMenuInteraction(interaction, bot) {
        const { customId, values } = interaction;
        
        // Leaderboard category selection
        if (customId === 'leaderboard_category') {
            const category = values[0];
            const leaderboardCommand = bot.commands.get('leaderboard');
            
            if (leaderboardCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    member: interaction.member,
                    reply: async (content) => interaction.update(content)
                };
                
                await leaderboardCommand.execute(fakeMessage, [category], bot);
            }
        }
        
        // Help category selection
        else if (customId === 'help_category') {
            const category = values[0];
            await this.showCommandsByCategory(interaction, category, bot);
        }
        
        // Achievement category selection
        else if (customId === 'achievement_category') {
            const category = values[0];
            const achievementsCommand = bot.commands.get('achievements');
            
            if (achievementsCommand) {
                const fakeMessage = {
                    author: interaction.user,
                    guild: interaction.guild,
                    member: interaction.member,
                    reply: async (content) => interaction.update(content)
                };
                
                await achievementsCommand.execute(fakeMessage, [category], bot);
            }
        }
    },

    async handleSlashCommand(interaction, bot) {
        // Future slash command support
        await interaction.reply({ 
            content: '⚠️ Slash commands are not yet implemented. Please use prefix commands with `!`', 
            ephemeral: true 
        });
    },

    async showCommandsByCategory(interaction, category, bot) {
        const { EmbedBuilder } = require('discord.js');
        
        const commands = bot.commands.filter(cmd => cmd.data.category === category);
        
        if (commands.size === 0) {
            return interaction.update({
                content: `❌ No commands found in category \`${category}\`.`,
                ephemeral: true
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📚 Commands - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
            .setColor('#667eea')
            .setTimestamp();
        
        let description = '';
        commands.forEach(command => {
            description += `**${process.env.PREFIX || '!'}${command.data.name}** ${command.data.usage || ''}\n`;
            description += `${command.data.description || 'No description'}\n\n`;
        });
        
        embed.setDescription(description);
        
        await interaction.update({ embeds: [embed] });
    },

    async handleAdminAction(interaction, action, bot) {
        // Check admin permissions
        const adminIds = process.env.ADMIN_IDS?.split(',') || [];
        if (!adminIds.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You don\'t have permission to use this function.',
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
    },

    async showAchievementsOverview(interaction, bot) {
        const { EmbedBuilder } = require('discord.js');
        
        const userData = bot.getUserData(interaction.user.id, interaction.guild.id);
        const totalAchievements = bot.config?.achievements ? 
            Object.values(bot.config.achievements).flat().length : 50;
        
        const completionRate = Math.round((userData.achievements.length / totalAchievements) * 100);
        
        const embed = new EmbedBuilder()
            .setTitle('🏆 Achievement Overview')
            .setDescription(`Your achievement progress on **${interaction.guild.name}**`)
            .setColor('#667eea')
            .addFields([
                {
                    name: '📊 Progress',
                    value: `**${userData.achievements.length}** / **${totalAchievements}** unlocked\n**${completionRate}%** completion rate`,
                    inline: true
                },
                {
                    name: '🎯 Recent Unlocks',
                    value: userData.achievements.length > 0 ? 
                        userData.achievements.slice(-3).map(id => {
                            const [category, achievementId] = id.split('_');
                            return `• ${category}: ${achievementId}`;
                        }).join('\n') : 
                        '*No achievements yet*',
                    inline: true
                }
            ])
            .setTimestamp();
        
        await interaction.update({ embeds: [embed] });
    }
};