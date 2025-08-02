

// events/guildMemberUpdate.js
const config = require('../config.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, bot) {
        // =================== GESTION DES BOOSTS ===================
        
        const oldBoostingSince = oldMember.premiumSince;
        const newBoostingSince = newMember.premiumSince;
        
        // L'utilisateur a commencé à booster
        if (!oldBoostingSince && newBoostingSince) {
            const userData = bot.getUserData(newMember.id, newMember.guild.id);
            userData.boosts++;
            
            const boostXP = config.experience?.rewards?.boost || 500;
            userData.experience += boostXP;
            
            console.log(`🚀 ${newMember.displayName} a commencé à booster le serveur !`);
            
            // Message de remerciement pour le boost
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle('🚀 Nouveau boost !')
                .setDescription(`Merci ${newMember} pour avoir boosté **${newMember.guild.name}** !\n\n🎁 **+${boostXP} XP** bonus ajoutés à votre profil !`)
                .setColor(config.colors.primary)
                .setThumbnail(newMember.displayAvatarURL())
                .setTimestamp();
            
            const notificationChannelId = process.env.NOTIFICATION_CHANNEL_ID;
            if (notificationChannelId) {
                const channel = newMember.guild.channels.cache.get(notificationChannelId);
                if (channel) {
                    channel.send({ embeds: [embed] }).catch(console.error);
                }
            }
            
            bot.checkAchievements(newMember.id, newMember.guild.id, newMember.guild);
            bot.saveDatabase();
        }
        
        // L'utilisateur a arrêté de booster
        else if (oldBoostingSince && !newBoostingSince) {
            console.log(`💔 ${newMember.displayName} a arrêté de booster le serveur`);
        }

        // =================== GESTION DES RÔLES ===================
        
        // Détecter les changements de rôles importants
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        
        if (addedRoles.size > 0) {
            console.log(`🏷️ Rôles ajoutés à ${newMember.displayName}: ${addedRoles.map(r => r.name).join(', ')}`);
        }
        
        if (removedRoles.size > 0) {
            console.log(`🏷️ Rôles retirés à ${newMember.displayName}: ${removedRoles.map(r => r.name).join(', ')}`);
        }

        // =================== GESTION DES PSEUDOS ===================
        
        if (oldMember.nickname !== newMember.nickname) {
            console.log(`📝 ${newMember.user.tag} a changé son pseudo: "${oldMember.nickname || oldMember.user.username}" → "${newMember.nickname || newMember.user.username}"`);
        }
    }
};