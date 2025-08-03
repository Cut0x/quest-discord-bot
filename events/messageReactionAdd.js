// events/messageReactionAdd.js - Suivi moderne des réactions
const config = require('../config.js');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user, bot) {
        if (user.bot) return;
        if (!reaction.message.guild) return;

        // Handle partial reactions
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        try {
            // User gave a reaction
            const userData = bot.getUserData(user.id, reaction.message.guild.id);
            userData.reactionsGiven++;
            
            const givenXP = config.experience?.rewards?.reaction_given || 2;
            userData.experience += givenXP;

            // Message author receives a reaction
            if (!reaction.message.author.bot && reaction.message.author.id !== user.id) {
                const authorData = bot.getUserData(reaction.message.author.id, reaction.message.guild.id);
                authorData.reactionsReceived++;
                
                const receivedXP = config.experience?.rewards?.reaction_received || 3;
                authorData.experience += receivedXP;
                
                // Check achievements for message author
                bot.checkAchievements(reaction.message.author.id, reaction.message.guild.id, reaction.message.guild, { silent: true });
            }

            // Check achievements for user who reacted
            bot.checkAchievements(user.id, reaction.message.guild.id, reaction.message.guild, { silent: true });

            // Save changes asynchronously
            setImmediate(() => {
                bot.saveDatabase();
            });

        } catch (error) {
            bot.functions.logError('MessageReactionAdd', error, {
                userId: user.id,
                guildId: reaction.message.guild.id,
                messageId: reaction.message.id
            });
        }
    }
};