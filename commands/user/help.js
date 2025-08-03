// commands/user/help.js - Aide moderne
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'Display bot help',
        aliases: ['aide', 'commands', 'commandes', 'h'],
        usage: '[command]',
        category: 'user',
        cooldown: 10000
    },

    async execute(message, args, bot) {
        const commandName = args[0]?.toLowerCase();
        
        if (commandName) {
            return this.showCommandHelp(message, commandName, bot);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 QuestBot Advanced - Modern Help')
            .setDescription(`Welcome to **QuestBot Advanced** with modern design!\n\nThis bot tracks your progression and achievements on **${message.guild.name}** with beautiful visual statistics and modern Canvas-generated images.`)
            .setColor('#667eea')
            .setThumbnail(bot.client.user.displayAvatarURL())
            .addFields([
                {
                    name: '📊 Main Commands',
                    value: `\`${process.env.PREFIX || '!'}stats\` - Modern statistics with visual cards\n\`${process.env.PREFIX || '!'}leaderboard\` - Visual leaderboards\n\`${process.env.PREFIX || '!'}achievements\` - Achievement system\n\`${process.env.PREFIX || '!'}profile\` - Complete user profiles`,
                    inline: true
                },
                {
                    name: '🎨 New Features',
                    value: `• **Modern Canvas Images** - Professional designs\n• **Glassmorphism Effects** - Modern UI elements\n• **Advanced Statistics** - Detailed tracking\n• **Visual Progress** - Beautiful progress bars\n• **Achievement Cards** - Stunning notifications`,
                    inline: true
                },
                {
                    name: '✨ What\'s Tracked',
                    value: `• **Messages** - Auto-tracked\n• **Voice Activity** - Time in voice channels\n• **Reactions** - Given and received\n• **Camera/Stream** - Video activity\n• **Achievements** - Unlock system\n• **Levels** - XP-based progression`,
                    inline: false
                }
            ])
            .setFooter({ text: `${message.guild.name} • QuestBot Advanced v3.0 • Modern Canvas Edition` })
            .setTimestamp();
        
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_category')
                    .setPlaceholder('Choose a command category')
                    .addOptions([
                        {
                            label: 'User Commands',
                            description: 'Stats, profiles, achievements...',
                            value: 'user',
                            emoji: '👤'
                        },
                        {
                            label: 'Admin Commands',
                            description: 'Management, moderation...',
                            value: 'admin',
                            emoji: '🛡️'
                        },
                        {
                            label: 'Utilities',
                            description: 'Various tools',
                            value: 'utility',
                            emoji: '🔧'
                        }
                    ])
            );
        
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📊 My Stats')
                    .setCustomId('quick_stats')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('🏆 Leaderboard')
                    .setCustomId('quick_leaderboard')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('🎨 Canvas Demo')
                    .setCustomId('canvas_demo')
                    .setStyle(ButtonStyle.Success)
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
            return message.reply(`❌ Command \`${commandName}\` not found.`);
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📖 Help - ${command.data.name}`)
            .setDescription(command.data.description || 'No description available')
            .setColor('#667eea')
            .addFields([
                {
                    name: '📝 Usage',
                    value: `\`${process.env.PREFIX || '!'}${command.data.name} ${command.data.usage || ''}\``,
                    inline: true
                },
                {
                    name: '📂 Category',
                    value: command.data.category || 'Undefined',
                    inline: true
                },
                {
                    name: '⏰ Cooldown',
                    value: command.data.cooldown ? `${command.data.cooldown / 1000}s` : 'None',
                    inline: true
                }
            ]);
        
        if (command.data.aliases?.length) {
            embed.addFields({
                name: '🔀 Aliases',
                value: command.data.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: false
            });
        }
        
        await message.reply({ embeds: [embed] });
    }
};