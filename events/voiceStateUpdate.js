// events/voiceStateUpdate.js - Événement vocal moderne
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
            
            // User joins voice channel
            if (!oldState.channel && newState.channel) {
                userData.lastVoiceJoin = now;
                bot.voiceTracking.set(userId, now);
                
                console.log(`🎤 ${newState.member?.displayName} joined ${newState.channel.name}`);
            }
            
            // User leaves voice channel
            else if (oldState.channel && !newState.channel) {
                if (userData.lastVoiceJoin) {
                    const timeSpent = bot.functions.calculateVoiceTime(userData.lastVoiceJoin);
                    
                    if (timeSpent > 0) {
                        userData.voiceTime += timeSpent;
                        
                        const voiceXP = (config.experience?.rewards?.voice_minute || 1) * timeSpent;
                        userData.experience += voiceXP;
                        
                        console.log(`🎤 ${oldState.member?.displayName} left ${oldState.channel.name} (${bot.formatDuration(timeSpent)})`);
                        
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, oldState.guild, { silent: false });
                        });
                    }
                    
                    userData.lastVoiceJoin = null;
                    bot.voiceTracking.delete(userId);
                }
            }
            
            // User switches voice channels
            else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                if (userData.lastVoiceJoin) {
                    const timeSpent = bot.functions.calculateVoiceTime(userData.lastVoiceJoin);
                    
                    if (timeSpent > 0) {
                        userData.voiceTime += timeSpent;
                        
                        const voiceXP = (config.experience?.rewards?.voice_minute || 1) * timeSpent;
                        userData.experience += voiceXP;
                    }
                    
                    // Restart counter for new channel
                    userData.lastVoiceJoin = now;
                    bot.voiceTracking.set(userId, now);
                    
                    console.log(`🎤 ${newState.member?.displayName} moved from ${oldState.channel.name} to ${newState.channel.name}`);
                }
            }

            // =================== CAMERA MANAGEMENT ===================
            
            if (newState.channel) {
                // Camera activated
                if (!oldState.selfVideo && newState.selfVideo) {
                    userData.cameraSessionStart = now;
                    console.log(`📹 ${newState.member?.displayName} enabled camera`);
                }
                // Camera deactivated
                else if (oldState.selfVideo && !newState.selfVideo && userData.cameraSessionStart) {
                    const sessionTime = bot.functions.calculateVoiceTime(userData.cameraSessionStart);
                    
                    if (sessionTime > 0) {
                        userData.cameraTime += sessionTime;
                        
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, newState.guild, { silent: false });
                        });
                        
                        console.log(`📹 ${newState.member?.displayName} disabled camera (${bot.formatDuration(sessionTime)})`);
                    }
                    
                    delete userData.cameraSessionStart;
                }

                // =================== STREAM MANAGEMENT ===================
                
                // Screen share activated
                if (!oldState.streaming && newState.streaming) {
                    userData.streamSessionStart = now;
                    console.log(`📺 ${newState.member?.displayName} started screen sharing`);
                }
                // Screen share deactivated
                else if (oldState.streaming && !newState.streaming && userData.streamSessionStart) {
                    const sessionTime = bot.functions.calculateVoiceTime(userData.streamSessionStart);
                    
                    if (sessionTime > 0) {
                        userData.streamTime += sessionTime;
                        
                        setImmediate(() => {
                            bot.checkAchievements(userId, guildId, newState.guild, { silent: false });
                        });
                        
                        console.log(`📺 ${newState.member?.displayName} stopped screen sharing (${bot.formatDuration(sessionTime)})`);
                    }
                    
                    delete userData.streamSessionStart;
                }
            }
            
            // Clean up sessions if user completely leaves voice
            if (oldState.channel && !newState.channel) {
                this.cleanupUserSessions(userData, bot);
            }

            // Save changes asynchronously
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
     * Clean up ongoing sessions when user leaves voice
     */
    cleanupUserSessions(userData, bot) {
        let totalTime = 0;
        
        // Camera session
        if (userData.cameraSessionStart) {
            const sessionTime = bot.functions.calculateVoiceTime(userData.cameraSessionStart);
            if (sessionTime > 0) {
                userData.cameraTime += sessionTime;
                totalTime += sessionTime;
                console.log(`📹 Camera session closed: ${bot.formatDuration(sessionTime)}`);
            }
            delete userData.cameraSessionStart;
        }
        
        // Stream session
        if (userData.streamSessionStart) {
            const sessionTime = bot.functions.calculateVoiceTime(userData.streamSessionStart);
            if (sessionTime > 0) {
                userData.streamTime += sessionTime;
                totalTime += sessionTime;
                console.log(`📺 Stream session closed: ${bot.formatDuration(sessionTime)}`);
            }
            delete userData.streamSessionStart;
        }
        
        return totalTime;
    }
};