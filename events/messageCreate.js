// events/messageCreate.js - Version corrigée
const config = require('../config.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, bot) {
        // Ignorer les bots et les messages non-serveur
        if (message.author.bot || !message.guild) return;

        bot.stats.messagesProcessed++;

        // Traitement des DM pour redirection
        if (message.channel.type === 1) { // DM
            if (message.content.startsWith(process.env.PREFIX || '!')) {
                const embed = bot.functions.createErrorEmbed(
                    'Commandes interdites en MP',
                    'Les commandes doivent être utilisées sur le serveur Discord, pas en message privé.'
                );
                return message.reply({ embeds: [embed] });
            }
            return;
        }

        try {
            // Obtenir les données utilisateur avec validation
            const userData = bot.getUserData(message.author.id, message.guild.id);
            
            // Incrémenter le compteur de messages
            userData.messagesCount++;
            
            // Ajouter XP pour le message (avec limitation anti-spam)
            const now = Date.now();
            const canGainXP = !userData.lastMessageTime || (now - userData.lastMessageTime) > 10000; // 10 secondes
            
            if (canGainXP) {
                const messageXP = config.experience?.rewards?.message || 5;
                userData.experience += messageXP;
                userData.lastMessageTime = now;
                
                // Vérifier les exploits avec un délai pour éviter le spam
                bot.checkAchievements(message.author.id, message.guild.id, message.guild, { silent: false });
            }

            // Système de détection des félicitations amélioré
            const content = message.content.toLowerCase();
            const hasCongratulation = bot.functions.detectCongratulations(content);

            if (hasCongratulation && message.mentions.users.size > 0) {
                // L'utilisateur félicite quelqu'un
                userData.congratulationsSent++;
                const congratXP = config.experience?.rewards?.congratulation_sent || 10;
                userData.experience += congratXP;
                
                // Incrémenter pour les utilisateurs mentionnés
                for (const mentionedUser of message.mentions.users.values()) {
                    if (!mentionedUser.bot && mentionedUser.id !== message.author.id) {
                        const mentionedUserData = bot.getUserData(mentionedUser.id, message.guild.id);
                        mentionedUserData.congratulationsReceived++;
                        
                        const receivedXP = config.experience?.rewards?.congratulation_received || 15;
                        mentionedUserData.experience += receivedXP;
                        
                        // Vérifier les achievements pour l'utilisateur mentionné
                        bot.checkAchievements(mentionedUser.id, message.guild.id, message.guild, { silent: true });
                    }
                }
            }

            // Traitement des commandes
            const prefix = process.env.PREFIX || '!';
            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = bot.commands.get(commandName) || 
                           bot.commands.find(cmd => cmd.data.aliases?.includes(commandName));
            
            if (!command) return;

            // Vérifier les cooldowns
            const cooldownAmount = command.data.cooldown || 0;
            if (cooldownAmount > 0) {
                const lastUsed = bot.getCooldown(message.author.id, command.data.name);
                const now = Date.now();
                const cooldownEnd = lastUsed + cooldownAmount;
                
                if (now < cooldownEnd) {
                    const remainingTime = Math.ceil((cooldownEnd - now) / 1000);
                    const embed = bot.functions.createErrorEmbed(
                        'Cooldown actif',
                        `Vous devez attendre **${remainingTime}s** avant de réutiliser \`${command.data.name}\`.`
                    ).setColor(config.colors.warning);
                    
                    return message.reply({ embeds: [embed] });
                }
                
                bot.setCooldown(message.author.id, command.data.name, cooldownAmount);
            }

            // Vérifier les permissions
            if (command.data.permissions) {
                const hasPermission = bot.functions.checkPermissions(message, command.data.permissions);
                if (!hasPermission) {
                    const embed = bot.functions.createErrorEmbed(
                        'Permission refusée',
                        'Vous n\'avez pas la permission d\'utiliser cette commande.'
                    );
                    return message.reply({ embeds: [embed] });
                }
            }

            // Exécuter la commande
            await command.execute(message, args, bot);
            bot.stats.commandsExecuted++;
            
            console.log(`📝 Commande exécutée: ${command.data.name} par ${message.author.tag} sur ${message.guild.name}`);
            
        } catch (error) {
            bot.functions.logError('MessageCreate Command', error, {
                userId: message.author.id,
                guildId: message.guild.id,
                command: commandName
            });
            
            const embed = bot.functions.createErrorEmbed(
                'Erreur de commande',
                'Une erreur est survenue lors de l\'exécution de cette commande.'
            );
            
            if (process.env.DEBUG_MODE === 'true') {
                embed.addFields({
                    name: '🐛 Détails de l\'erreur',
                    value: `\`\`\`${error.message.slice(0, 1000)}\`\`\``,
                    inline: false
                });
            }
            
            try {
                await message.reply({ embeds: [embed] });
            } catch (replyError) {
                console.error('❌ Impossible de répondre au message:', replyError);
            }
            
            // Log l'erreur dans le canal admin si configuré
            await this.logErrorToAdminChannel(bot, error, message, commandName);
        }
    },

    async logErrorToAdminChannel(bot, error, message, commandName) {
        try {
            const errorChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
            if (!errorChannelId) return;

            const errorChannel = bot.client.channels.cache.get(errorChannelId);
            if (!errorChannel) return;

            const errorEmbed = bot.functions.createErrorEmbed(
                'Erreur de commande',
                `**Commande:** ${commandName}\n**Utilisateur:** ${message.author.tag}\n**Serveur:** ${message.guild.name}\n**Canal:** ${message.channel.name}`
            );

            errorEmbed.addFields({
                name: 'Erreur',
                value: `\`\`\`${error.stack?.slice(0, 1000) || error.message}\`\`\``,
                inline: false
            });

            await errorChannel.send({ embeds: [errorEmbed] });
        } catch (logError) {
            console.error('❌ Impossible de logger l\'erreur dans le canal admin:', logError);
        }
    }
};