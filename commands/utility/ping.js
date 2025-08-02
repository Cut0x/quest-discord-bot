// commands/utility/ping.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping',
        description: 'Affiche la latence du bot',
        aliases: ['latence', 'latency'],
        usage: '',
        category: 'utility',
        cooldown: 5000
    },

    async execute(message, args, bot) {
        const sent = await message.reply('🏓 Calcul de la latence...');
        
        const botLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(bot.client.ws.ping);
        
        // Déterminer la qualité de la connexion
        let connectionQuality = '🟢 Excellente';
        let color = '#00FF00';
        
        if (apiLatency > 100) {
            connectionQuality = '🟡 Bonne';
            color = '#FFFF00';
        }
        if (apiLatency > 200) {
            connectionQuality = '🟠 Moyenne';
            color = '#FFA500';
        }
        if (apiLatency > 500) {
            connectionQuality = '🔴 Mauvaise';
            color = '#FF0000';
        }

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong !')
            .setDescription(`Latence du bot mesurée avec succès`)
            .addFields([
                {
                    name: '🤖 Latence du bot',
                    value: `${botLatency}ms`,
                    inline: true
                },
                {
                    name: '📡 Latence API Discord',
                    value: `${apiLatency}ms`,
                    inline: true
                },
                {
                    name: '📊 Qualité de connexion',
                    value: connectionQuality,
                    inline: true
                }
            ])
            .setColor(color)
            .setFooter({ 
                text: `Uptime: ${bot.formatUptime ? bot.formatUptime(Date.now() - bot.stats.uptime) : 'N/A'}` 
            })
            .setTimestamp();

        await sent.edit({ content: '', embeds: [embed] });
    }
};