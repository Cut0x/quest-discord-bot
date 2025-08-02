// events/voiceStateUpdate.js - Version corrigée
const config = require('../config.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, bot) {
        const userId = newState.id || oldState.id;
        const guildId = newState.guild?.id || oldState.guild?.id;
        
        if (!userId || !guildId) return;

        try {
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
                    const timeSpent = bot.functions.calculateVoiceTime(userData.lastVoiceJoin);
                    
                    if (timeSpent > 0) { // Minimum 1 minute pour compter
                        userData.voiceTime += timeSpent;
                        
                        const voiceXP = (config.experience?.rewards?.voice_minute || 1) * timeSpent;
                        userData.experience += voiceXP;
                        
                        console.log(`🎤 ${oldState.member?.displayName} a quitté ${oldState.channel.name} (${bot.functions.formatDuration(timeSpent)})`);
                        
                        // Vérifier les exploits de manière asynchrone
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, oldState.guild, { silent: false });
                        });
                    }
                    
                    userData.lastVoiceJoin = null;
                    bot.voiceTracking.delete(userId);
                }
            }
            
            // Utilisateur change de canal
            else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                if (userData.lastVoiceJoin) {
                    const timeSpent = bot.functions.calculateVoiceTime(userData.lastVoiceJoin);
                    
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
                    const sessionTime = bot.functions.calculateVoiceTime(userData.cameraSessionStart);
                    
                    if (sessionTime > 0) {
                        userData.cameraTime += sessionTime;
                        
                        // Vérifier les exploits de caméra
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, newState.guild, { silent: false });
                        });
                        
                        console.log(`📹 ${newState.member?.displayName} a désactivé sa caméra (${bot.functions.formatDuration(sessionTime)})`);
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
                    const sessionTime = bot.functions.calculateVoiceTime(userData.streamSessionStart);
                    
                    if (sessionTime > 0) {
                        userData.streamTime += sessionTime;
                        
                        // Vérifier les exploits de stream
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, newState.guild, { silent: false });
                        });
                        
                        console.log(`📺 ${newState.member?.displayName} a arrêté le partage d'écran (${bot.functions.formatDuration(sessionTime)})`);
                    }
                    
                    delete userData.streamSessionStart;
                }
            }
            
            // Nettoyer les sessions si l'utilisateur quitte complètement le vocal
            if (oldState.channel && !newState.channel) {
                this.cleanupUserSessions(userData, bot);
            }

            // Sauvegarder les modifications (de manière asynchrone)
            setImmediate(() => {
                bot.saveDatabase();
            });

        } catch (error) {
            bot.functions.logError('VoiceStateUpdate', error, {
                userId,
                guildId,
                oldChannel: oldState.channel?.name,
                newChannel: newState.channel?.name
            });
        }
    },

    /**
     * Nettoie les sessions en cours quand l'utilisateur quitte le vocal
     */
    cleanupUserSessions(userData, bot) {
        let totalTime = 0;
        
        // Session caméra
        if (userData.cameraSessionStart) {
            const sessionTime = bot.functions.calculateVoiceTime(userData.cameraSessionStart);
            if (sessionTime > 0) {
                userData.cameraTime += sessionTime;
                totalTime += sessionTime;
                console.log(`📹 Session caméra fermée: ${bot.functions.formatDuration(sessionTime)}`);
            }
            delete userData.cameraSessionStart;
        }
        
        // Session stream
        if (userData.streamSessionStart) {
            const sessionTime = bot.functions.calculateVoiceTime(userData.streamSessionStart);
            if (sessionTime > 0) {
                userData.streamTime += sessionTime;
                totalTime += sessionTime;
                console.log(`📺 Session stream fermée: ${bot.functions.formatDuration(sessionTime)}`);
            }
            delete userData.streamSessionStart;
        }
        
        return totalTime;
    }
};