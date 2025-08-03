// commands/utility/ping.js - Commande ping améliorée
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping',
        description: 'Display bot latency and connection quality',
        aliases: ['latence', 'latency', 'ms'],
        usage: '',
        category: 'utility',
        cooldown: 5000
    },

    async execute(message, args, bot) {
        const startTime = Date.now();
        
        // Message initial
        const sent = await message.reply('🏓 Measuring latency...');
        
        const endTime = Date.now();
        const botLatency = endTime - startTime;
        const apiLatency = Math.round(bot.client.ws.ping);
        
        // Déterminer la qualité de la connexion
        let connectionStatus = this.getConnectionStatus(apiLatency);
        let performanceEmoji = this.getPerformanceEmoji(apiLatency);
        
        // Calculs supplémentaires
        const messageLatency = sent.createdTimestamp - message.createdTimestamp;
        const uptime = Date.now() - bot.stats.uptime;
        const uptimeFormatted = bot.formatDuration ? bot.formatDuration(Math.floor(uptime / 1000 / 60)) : `${Math.floor(uptime / 1000)}s`;

        const embed = new EmbedBuilder()
            .setTitle(`${performanceEmoji} Pong! Connection Status`)
            .setDescription(`Bot performance and connection quality metrics`)
            .setColor(connectionStatus.color)
            .addFields([
                {
                    name: '🤖 Bot Response Time',
                    value: `${botLatency}ms`,
                    inline: true
                },
                {
                    name: '📡 Discord API Latency',
                    value: `${apiLatency}ms`,
                    inline: true
                },
                {
                    name: '📨 Message Latency',
                    value: `${messageLatency}ms`,
                    inline: true
                },
                {
                    name: '📊 Connection Quality',
                    value: `${connectionStatus.emoji} ${connectionStatus.status}`,
                    inline: true
                },
                {
                    name: '⏱️ Bot Uptime',
                    value: uptimeFormatted,
                    inline: true
                },
                {
                    name: '🏠 Server',
                    value: message.guild.name,
                    inline: true
                }
            ])
            .setFooter({ 
                text: `Requested by ${message.author.displayName} • ${this.getTimestamp()}` 
            })
            .setTimestamp();

        // Ajouter des détails sur les performances si disponible
        if (bot.stats) {
            const performanceField = this.getPerformanceInfo(bot.stats, apiLatency);
            embed.addFields(performanceField);
        }

        // Ajouter une recommandation si la latence est élevée
        if (apiLatency > 300) {
            embed.addFields({
                name: '💡 Recommendation',
                value: 'High latency detected. This may affect bot responsiveness.',
                inline: false
            });
        }

        await sent.edit({ 
            content: '', 
            embeds: [embed] 
        });

        // Ajouter une réaction basée sur la performance
        try {
            const reactionEmoji = this.getReactionEmoji(apiLatency);
            await sent.react(reactionEmoji);
        } catch (error) {
            // Ignorer les erreurs de réaction
        }
    },

    getConnectionStatus(latency) {
        if (latency < 100) {
            return {
                status: 'Excellent',
                emoji: '🟢',
                color: '#10b981'
            };
        } else if (latency < 200) {
            return {
                status: 'Good',
                emoji: '🟡',
                color: '#f59e0b'
            };
        } else if (latency < 300) {
            return {
                status: 'Fair',
                emoji: '🟠',
                color: '#f97316'
            };
        } else if (latency < 500) {
            return {
                status: 'Poor',
                emoji: '🔴',
                color: '#ef4444'
            };
        } else {
            return {
                status: 'Very Poor',
                emoji: '⚫',
                color: '#6b7280'
            };
        }
    },

    getPerformanceEmoji(latency) {
        if (latency < 100) return '⚡';
        if (latency < 200) return '🏃';
        if (latency < 300) return '🚶';
        if (latency < 500) return '🐌';
        return '🦥';
    },

    getReactionEmoji(latency) {
        if (latency < 100) return '⚡';
        if (latency < 200) return '👍';
        if (latency < 300) return '👌';
        if (latency < 500) return '😅';
        return '😴';
    },

    getPerformanceInfo(stats, latency) {
        const performance = latency < 100 ? 'Optimal' : 
                          latency < 200 ? 'Good' : 
                          latency < 300 ? 'Acceptable' : 'Degraded';

        return {
            name: '📈 Performance Stats',
            value: `**Status:** ${performance}\n**Commands Executed:** ${stats.commandsExecuted || 0}\n**Messages Processed:** ${stats.messagesProcessed || 0}${stats.canvasImagesGenerated ? `\n**Images Generated:** ${stats.canvasImagesGenerated}` : ''}`,
            inline: false
        };
    },

    getTimestamp() {
        return new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
};