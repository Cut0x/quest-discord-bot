// commands/user/help.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'Affiche l\'aide du bot',
        aliases: ['aide', 'commands', 'commandes'],
        usage: '[commande]',
        category: 'user',
        cooldown: 10000
    },

    async execute(message, args, bot) {
        const commandName = args[0]?.toLowerCase();
        
        if (commandName) {
            return this.showCommandHelp(message, commandName, bot);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 QuestBot Advanced - Aide')
            .setDescription(`Bienvenue dans **QuestBot Advanced** !\n\nCe bot suit votre progression et vos exploits sur **${message.guild.name}**. Utilisez les menus ci-dessous pour explorer les commandes ou consultez le code source sur GitHub.`)
            .setColor('#FFD700')
            .setThumbnail(bot.client.user.displayAvatarURL())
            .addFields([
                {
                    name: '📊 Commandes principales',
                    value: `\`${process.env.PREFIX || '!'}stats\` - Vos statistiques\n\`${process.env.PREFIX || '!'}profile\` - Votre profil complet\n\`${process.env.PREFIX || '!'}achievements\` - Tous les exploits\n\`${process.env.PREFIX || '!'}leaderboard\` - Classements`,
                    inline: true
                },
                {
                    name: '🎮 Système de progression',
                    value: `• **Messages** - Trackés automatiquement\n• **Vocal** - Temps en salon vocal\n• **Réactions** - Données et reçues\n• **Événements** - Participations\n• **Niveaux** - Basés sur l'XP`,
                    inline: true
                },
                {
                    name: '🔗 Liens utiles',
                    value: `[**Code source**](${process.env.GITHUB_REPO_URL || 'https://github.com'})\n[**Support**](${process.env.SUPPORT_URL || 'https://discord.gg'})\n[**Documentation**](${process.env.DOCS_URL || 'https://github.com'})`,
                    inline: false
                }
            ])
            .setFooter({ text: `${message.guild.name} • QuestBot Advanced v2.0` })
            .setTimestamp();
        
        // Menu de sélection des catégories de commandes
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_category')
                    .setPlaceholder('Choisir une catégorie de commandes')
                    .addOptions([
                        {
                            label: 'Commandes utilisateur',
                            description: 'Stats, profil, exploits...',
                            value: 'user',
                            emoji: '👤'
                        },
                        {
                            label: 'Commandes administrateur',
                            description: 'Gestion, modération...',
                            value: 'admin',
                            emoji: '🛡️'
                        },
                        {
                            label: 'Utilitaires',
                            description: 'Outils divers',
                            value: 'utility',
                            emoji: '🔧'
                        }
                    ])
            );
        
        // Boutons d'actions rapides
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📊 Mes Stats')
                    .setCustomId('quick_stats')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('🏆 Mes Exploits')
                    .setCustomId('quick_achievements')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('🔗 GitHub')
                    .setURL(process.env.GITHUB_REPO_URL || 'https://github.com')
                    .setStyle(ButtonStyle.Link)
            );
        
        await message.reply({ 
            embeds: [embed], 
            components: [selectMenu, buttonRow] 
        });
    },

    async showCommandHelp(message, commandName, bot) {
        const command = bot.commands.get(commandName) || 
                       bot.commands.find(cmd => cmd.data.aliases?.includes(commandName));
        
        if (!command) {
            return message.reply(`❌ Commande \`${commandName}\` non trouvée.`);
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📖 Aide - ${command.data.name}`)
            .setDescription(command.data.description || 'Aucune description disponible')
            .setColor('#FFD700')
            .addFields([
                {
                    name: '📝 Usage',
                    value: `\`${process.env.PREFIX || '!'}${command.data.name} ${command.data.usage || ''}\``,
                    inline: true
                },
                {
                    name: '📂 Catégorie',
                    value: command.data.category || 'Non définie',
                    inline: true
                },
                {
                    name: '⏰ Cooldown',
                    value: command.data.cooldown ? `${command.data.cooldown / 1000}s` : 'Aucun',
                    inline: true
                }
            ]);
        
        if (command.data.aliases?.length) {
            embed.addFields({
                name: '🔀 Alias',
                value: command.data.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: false
            });
        }
        
        await message.reply({ embeds: [embed] });
    }
};