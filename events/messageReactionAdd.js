

// events/messageReactionAdd.js
const config = require('../config.js');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user, bot) {
        if (user.bot) return;
        if (!reaction.message.guild) return;

        // Gérer les réactions partielles
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Erreur lors de la récupération de la réaction:', error);
                return;
            }
        }

        // L'utilisateur a donné une réaction
        const userData = bot.getUserData(user.id, reaction.message.guild.id);
        userData.reactionsGiven++;
        
        const givenXP = config.experience?.rewards?.reaction_given || 2;
        userData.experience += givenXP;

        // L'auteur du message reçoit une réaction
        if (!reaction.message.author.bot && reaction.message.author.id !== user.id) {
            const authorData = bot.getUserData(reaction.message.author.id, reaction.message.guild.id);
            authorData.reactionsReceived++;
            
            const receivedXP = config.experience?.rewards?.reaction_received || 3;
            authorData.experience += receivedXP;
            
            // Vérifier les achievements pour l'auteur
            bot.checkAchievements(reaction.message.author.id, reaction.message.guild.id, reaction.message.guild);
        }

        // Vérifier les achievements pour celui qui réagit
        bot.checkAchievements(user.id, reaction.message.guild.id, reaction.message.guild);
    }
};