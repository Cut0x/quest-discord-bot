

// events/messageCreate.js
const config = require('../config.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, bot) {
        if (message.author.bot) return;
        if (!message.guild) return;

        bot.stats.messagesProcessed++;

        // Traitement des DM pour les commandes de configuration
        if (message.channel.type === 1) { // DM
            if (message.content.startsWith(process.env.PREFIX || '!')) {
                // Rediriger vers le serveur principal
                return message.reply('❌ Les commandes doivent être utilisées sur le serveur Discord, pas en message privé.');
            }
            return;
        }

        // Obtenir les données utilisateur
        const userData = bot.getUserData(message.author.id, message.guild.id);
        
        // Incrémenter le compteur de messages
        userData.messagesCount++;
        
        // Ajouter XP pour le message
        const messageXP = config.experience?.rewards?.message || 5;
        userData.experience += messageXP;

        // Système de détection des félicitations amélioré
        const content = message.content.toLowerCase();
        const hasCongratulationKeyword = config.congratulationKeywords.some(keyword => 
            content.includes(keyword.toLowerCase())
        );

        if (hasCongratulationKeyword && message.mentions.users.size > 0) {
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
                    bot.checkAchievements(mentionedUser.id, message.guild.id, message.guild);
                }
            }
        }

        // Système de détection de spam (limiter les XP)
        const now = Date.now();
        if (!userData.lastMessageTime || now - userData.lastMessageTime > 10000) { // 10 secondes minimum
            userData.lastMessageTime = now;
            
            // Vérifier les achievements pour l'auteur
            bot.checkAchievements(message.author.id, message.guild.id, message.guild);
        }

        // Traitement des commandes
        if (!message.content.startsWith(process.env.PREFIX || '!')) return;

        const args = message.content.slice((process.env.PREFIX || '!').length).trim().split(/ +/);
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
                const { EmbedBuilder } = require('discord.js');
                
                const embed = new EmbedBuilder()
                    .setTitle('⏰ Cooldown actif')
                    .setDescription(`Vous devez attendre **${remainingTime}s** avant de réutiliser \`${command.data.name}\`.`)
                    .setColor(config.colors.warning)
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }
            
            bot.setCooldown(message.author.id, command.data.name, cooldownAmount);
        }

        // Vérifier les permissions
        if (command.data.permissions) {
            const hasPermission = this.checkPermissions(message, command.data.permissions);
            if (!hasPermission) {
                const { EmbedBuilder } = require('discord.js');
                
                const embed = new EmbedBuilder()
                    .setTitle('❌ Permission refusée')
                    .setDescription('Vous n\'avez pas la permission d\'utiliser cette commande.')
                    .setColor(config.colors.error)
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }
        }

        try {
            await command.execute(message, args, bot);
            bot.stats.commandsExecuted++;
            
            console.log(`📝 Commande exécutée: ${command.data.name} par ${message.author.tag} sur ${message.guild.name}`);
            
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de ${command.data.name}:`, error);
            
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle('❌ Erreur de commande')
                .setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
                .setColor(config.colors.error)
                .setTimestamp();
            
            if (process.env.DEBUG_MODE === 'true') {
                embed.addFields({
                    name: '🐛 Détails de l\'erreur',
                    value: `\`\`\`${error.message.slice(0, 1000)}\`\`\``,
                    inline: false
                });
            }
            
            message.reply({ embeds: [embed] }).catch(console.error);
            
            // Log l'erreur dans le canal admin si configuré
            const errorChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
            if (errorChannelId) {
                const errorChannel = bot.client.channels.cache.get(errorChannelId);
                if (errorChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('🚨 Erreur de commande')
                        .setDescription(`**Commande:** ${command.data.name}\n**Utilisateur:** ${message.author.tag}\n**Serveur:** ${message.guild.name}\n**Canal:** ${message.channel.name}`)
                        .addFields({
                            name: 'Erreur',
                            value: `\`\`\`${error.stack?.slice(0, 1000) || error.message}\`\`\``,
                            inline: false
                        })
                        .setColor('#FF0000')
                        .setTimestamp();
                    
                    errorChannel.send({ embeds: [errorEmbed] }).catch(console.error);
                }
            }
        }
    },

    checkPermissions(message, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        
        const adminIds = process.env.ADMIN_IDS?.split(',') || [];
        const staffIds = process.env.STAFF_IDS?.split(',') || [];
        
        for (const permission of requiredPermissions) {
            switch (permission) {
                case 'admin':
                    if (adminIds.includes(message.author.id)) return true;
                    if (process.env.ADMIN_ROLE_ID && message.member?.roles.cache.has(process.env.ADMIN_ROLE_ID)) return true;
                    if (process.env.OWNER_ROLE_ID && message.member?.roles.cache.has(process.env.OWNER_ROLE_ID)) return true;
                    break;
                case 'staff':
                    if (adminIds.includes(message.author.id) || staffIds.includes(message.author.id)) return true;
                    if (process.env.MODERATOR_ROLE_ID && message.member?.roles.cache.has(process.env.MODERATOR_ROLE_ID)) return true;
                    break;
                case 'owner':
                    if (message.guild.ownerId === message.author.id) return true;
                    if (process.env.OWNER_ROLE_ID && message.member?.roles.cache.has(process.env.OWNER_ROLE_ID)) return true;
                    break;
            }
        }
        
        return false;
    }
};