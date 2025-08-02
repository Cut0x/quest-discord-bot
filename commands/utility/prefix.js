

// commands/utility/prefix.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'prefix',
        description: 'Affiche le préfixe actuel du bot',
        aliases: ['préfixe'],
        usage: '',
        category: 'utility',
        cooldown: 10000
    },

    async execute(message, args, bot) {
        const currentPrefix = process.env.PREFIX || '!';
        
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Préfixe du bot')
            .setDescription(`Le préfixe actuel est : \`${currentPrefix}\`\n\nUtilisez \`${currentPrefix}help\` pour voir toutes les commandes disponibles.`)
            .setColor('#4ECDC4')
            .addFields([
                {
                    name: '📝 Exemples d\'utilisation',
                    value: `\`${currentPrefix}stats\` - Vos statistiques\n\`${currentPrefix}profile\` - Votre profil\n\`${currentPrefix}achievements\` - Liste des exploits\n\`${currentPrefix}leaderboard\` - Classements`,
                    inline: false
                },
                {
                    name: '🔧 Configuration',
                    value: `Le préfixe est configuré dans le fichier \`.env\`\nSeuls les administrateurs peuvent le modifier.`,
                    inline: false
                }
            ])
            .setFooter({ text: 'QuestBot Advanced' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};