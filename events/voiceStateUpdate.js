

// events/voiceStateUpdate.js
const config = require('../config.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, bot) {
        const userId = newState.id || oldState.id;
        const guildId = newState.guild?.id || oldState.guild?.id;
        
        if (!userId || !guildId) return;
        
        const userData = bot.getUserData(userId, guildId);
        const now = Date.now();

        // =================== GESTION VOCAL ===================
        
        // Utilisateur rejoint un canal vocal
        if (!oldState.channel && newState.channel) {
            userData.lastVoiceJoin = now;
            bot.voiceTracking.set(userId, now);
            
            console.log(`🎤 ${newState.member?.displayName} a rejoint ${newState.channel.name}`);
        }
        
        // Utilisateur quitte un canal vocal
        else if (oldState.channel && !newState.channel) {
            if (userData.lastVoiceJoin) {
                const timeSpent = Math.floor((now - userData.lastVoiceJoin) / 1000 / 60); // en minutes
                
                if (timeSpent > 0) { // Minimum 1 minute pour compter
                    userData.voiceTime += timeSpent;
                    
                    const voiceXP = (config.experience?.rewards?.voice_minute || 1) * timeSpent;
                    userData.experience += voiceXP;
                    
                    console.log(`🎤 ${oldState.member?.displayName} a quitté ${oldState.channel.name} (${timeSpent}min)`);
                    
                    bot.checkAchievements(userId, guildId, oldState.guild);
                }
                
                userData.lastVoiceJoin = null;
                bot.voiceTracking.delete(userId);
            }
        }
        
        // Utilisateur change de canal (compter le temps dans l'ancien canal)
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            if (userData.lastVoiceJoin) {
                const timeSpent = Math.floor((now - userData.lastVoiceJoin) / 1000 / 60);
                
                if (timeSpent > 0) {
                    userData.voiceTime += timeSpent;
                    
                    const voiceXP = (config.experience?.rewards?.voice_minute || 1) * timeSpent;
                    userData.experience += voiceXP;
                }
                
                // Redémarrer le compteur pour le nouveau canal
                userData.lastVoiceJoin = now;
                bot.voiceTracking.set(userId, now);
                
                console.log(`🎤 ${newState.member?.displayName} a changé de ${oldState.channel.name} vers ${newState.channel.name}`);
            }
        }

        // =================== GESTION CAMÉRA ===================
        
        if (newState.channel) {
            // Caméra activée
            if (!oldState.selfVideo && newState.selfVideo) {
                userData.cameraSessionStart = now;
                console.log(`📹 ${newState.member?.displayName} a activé sa caméra`);
            }
            // Caméra désactivée
            else if (oldState.selfVideo && !newState.selfVideo && userData.cameraSessionStart) {
                const sessionTime = Math.floor((now - userData.cameraSessionStart) / 1000 / 60);
                
                if (sessionTime > 0) {
                    userData.cameraTime += sessionTime;
                    bot.checkAchievements(userId, guildId, newState.guild);
                    
                    console.log(`📹 ${newState.member?.displayName} a désactivé sa caméra (${sessionTime}min)`);
                }
                
                delete userData.cameraSessionStart;
            }

            // =================== GESTION STREAM ===================
            
            // Partage d'écran activé
            if (!oldState.streaming && newState.streaming) {
                userData.streamSessionStart = now;
                console.log(`📺 ${newState.member?.displayName} a commencé le partage d'écran`);
            }
            // Partage d'écran désactivé
            else if (oldState.streaming && !newState.streaming && userData.streamSessionStart) {
                const sessionTime = Math.floor((now - userData.streamSessionStart) / 1000 / 60);
                
                if (sessionTime > 0) {
                    userData.streamTime += sessionTime;
                    bot.checkAchievements(userId, guildId, newState.guild);
                    
                    console.log(`📺 ${newState.member?.displayName} a arrêté le partage d'écran (${sessionTime}min)`);
                }
                
                delete userData.streamSessionStart;
            }
        }
        
        // Nettoyer les sessions si l'utilisateur quitte complètement le vocal
        if (oldState.channel && !newState.channel) {
            if (userData.cameraSessionStart) {
                const sessionTime = Math.floor((now - userData.cameraSessionStart) / 1000 / 60);
                if (sessionTime > 0) {
                    userData.cameraTime += sessionTime;
                }
                delete userData.cameraSessionStart;
            }
            
            if (userData.streamSessionStart) {
                const sessionTime = Math.floor((now - userData.streamSessionStart) / 1000 / 60);
                if (sessionTime > 0) {
                    userData.streamTime += sessionTime;
                }
                delete userData.streamSessionStart;
            }
        }

        // Sauvegarder les modifications
        bot.saveDatabase();
    }
};