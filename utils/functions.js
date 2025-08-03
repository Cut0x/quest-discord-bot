// utils/functions.js - Fonctions refactorisées avec Canvas amélioré
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const ImprovedCanvasUtils = require('./canvas');
const fs = require('fs');
const path = require('path');

class ModernBotFunctions {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.canvas = new ImprovedCanvasUtils(config);
    }

    // =================== GESTION DES DONNÉES UTILISATEUR ===================
    
    getUserData(database, userId, guildId) {
        if (!database.users[userId]) {
            database.users[userId] = {};
        }
        if (!database.users[userId][guildId]) {
            database.users[userId][guildId] = {
                // Core stats
                messagesCount: 0,
                reactionsGiven: 0,
                reactionsReceived: 0,
                voiceTime: 0,
                eventsParticipated: 0,
                cameraTime: 0,
                streamTime: 0,
                boosts: 0,
                congratulationsSent: 0,
                congratulationsReceived: 0,
                
                // Progression
                achievements: [],
                level: 1,
                experience: 0,
                
                // Timestamps
                joinedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                lastVoiceJoin: null,
                lastMessageTime: null,
                
                // Sessions
                cameraSessionStart: null,
                streamSessionStart: null
            };
        }
        
        database.users[userId][guildId].lastActivity = new Date().toISOString();
        return database.users[userId][guildId];
    }

    // =================== SYSTÈME D'EXPLOITS MODERNE ===================
    
    async checkAchievements(database, userId, guildId, guild, options = {}) {
        const userData = this.getUserData(database, userId, guildId);
        const newAchievements = [];
        const silent = options.silent || false;

        // Vérifier si la config des achievements existe
        if (!this.config.achievements) {
            console.warn('⚠️ No achievements configuration found');
            return newAchievements;
        }

        for (const category in this.config.achievements) {
            const categoryAchievements = this.config.achievements[category];
            if (!Array.isArray(categoryAchievements)) continue;

            for (const achievement of categoryAchievements) {
                const achievementId = `${category}_${achievement.id}`;
                
                if (!userData.achievements.includes(achievementId)) {
                    let achieved = false;
                    let currentProgress = 0;
                    
                    switch (category) {
                        case 'messages':
                            currentProgress = userData.messagesCount;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'reactions':
                            currentProgress = achievement.type === 'given' ? userData.reactionsGiven : userData.reactionsReceived;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'voice':
                            currentProgress = userData.voiceTime;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'events':
                            currentProgress = userData.eventsParticipated;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'camera':
                            currentProgress = userData.cameraTime;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'stream':
                            currentProgress = userData.streamTime;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'boosts':
                            currentProgress = userData.boosts;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                        case 'congratulations':
                            currentProgress = achievement.type === 'sent' ? userData.congratulationsSent : userData.congratulationsReceived;
                            achieved = currentProgress >= achievement.requirement;
                            break;
                    }

                    if (achieved) {
                        userData.achievements.push(achievementId);
                        userData.experience += achievement.xp || 100;
                        
                        const newLevel = Math.floor(userData.experience / 1000) + 1;
                        const leveledUp = newLevel > userData.level;
                        userData.level = newLevel;
                        
                        newAchievements.push({ 
                            achievement, 
                            category, 
                            leveledUp,
                            newLevel: userData.level
                        });
                        
                        // Role assignment
                        if (achievement.roleId) {
                            try {
                                const member = await guild.members.fetch(userId);
                                const role = guild.roles.cache.get(achievement.roleId);
                                if (member && role && !member.roles.cache.has(role.id)) {
                                    await member.roles.add(role);
                                    console.log(`✅ Role ${role.name} assigned to ${member.displayName}`);
                                }
                            } catch (error) {
                                console.error('❌ Error assigning role:', error);
                            }
                        }
                    }
                }
            }
        }

        if (newAchievements.length > 0 && !silent) {
            await this.sendModernAchievementNotification(userId, guildId, newAchievements, guild);
        }

        return newAchievements;
    }

    // =================== NOTIFICATIONS MODERNES ===================
    
    async sendModernAchievementNotification(userId, guildId, achievements, guild) {
        try {
            const user = await guild.client.users.fetch(userId);
            const notificationChannel = guild.channels.cache.get(process.env.NOTIFICATION_CHANNEL_ID);
            
            for (const { achievement, category, leveledUp, newLevel } of achievements) {
                // Créer une image d'achievement avec le système amélioré
                let achievementCard = null;
                try {
                    achievementCard = await this.canvas.createModernAchievementCard(user, achievement, category, leveledUp, newLevel);
                } catch (canvasError) {
                    console.warn('⚠️ Canvas error for achievement notification:', canvasError.message);
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Achievement Unlocked!')
                    .setDescription(`**${user.displayName}** unlocked the **${achievement.name}** achievement!\n\n${achievement.description || 'Congratulations on this accomplishment!'}\n\n${leveledUp ? `🆙 **Level Up!** Now Level ${newLevel}!` : ''}`)
                    .setColor('#667eea')
                    .setTimestamp()
                    .setFooter({ text: `${guild.name} • QuestBot Advanced` });

                const messageOptions = { embeds: [embed] };

                if (achievementCard) {
                    const attachment = new AttachmentBuilder(achievementCard, { name: 'achievement.png' });
                    embed.setImage('attachment://achievement.png');
                    messageOptions.files = [attachment];
                }

                if (notificationChannel) {
                    await notificationChannel.send(messageOptions);
                }

                // Envoyer en privé si configuré
                if (process.env.SEND_PRIVATE_NOTIFICATIONS === 'true') {
                    try {
                        await user.send(messageOptions);
                    } catch (error) {
                        console.log(`⚠️ Cannot send private message to ${user.tag}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error sending achievement notification:', error);
        }
    }

    // =================== MÉTHODES CANVAS PRINCIPALES ===================
    
    async createModernProfileCard(userId, guildId, user, userData, member = null) {
        try {
            return await this.canvas.createModernProfileCard(user, userData, member);
        } catch (error) {
            console.error('❌ Error creating profile card:', error);
            throw error;
        }
    }

    async createModernAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        try {
            return await this.canvas.createModernAchievementCard(user, achievement, category, leveledUp, newLevel);
        } catch (error) {
            console.error('❌ Error creating achievement card:', error);
            throw error;
        }
    }

    async createModernLeaderboard(guildId, category = 'messages', limit = 10, database, client) {
        try {
            const users = this.getLeaderboardData(database.users, guildId, category);
            const topUsers = users.slice(0, limit);
            return await this.canvas.createModernLeaderboard(topUsers, category, limit, client);
        } catch (error) {
            console.error('❌ Error creating leaderboard:', error);
            throw error;
        }
    }

    // =================== UTILITAIRES ===================
    
    getLeaderboardData(usersDb, guildId, category) {
        const users = [];
        
        for (const userId in usersDb) {
            if (usersDb[userId][guildId]) {
                const userData = usersDb[userId][guildId];
                let value = 0;
                
                switch (category) {
                    case 'messages':
                        value = userData.messagesCount || 0;
                        break;
                    case 'voice':
                        value = userData.voiceTime || 0;
                        break;
                    case 'level':
                        value = userData.level || 1;
                        break;
                    case 'experience':
                        value = userData.experience || 0;
                        break;
                    case 'reactions_given':
                        value = userData.reactionsGiven || 0;
                        break;
                    case 'reactions_received':
                        value = userData.reactionsReceived || 0;
                        break;
                    case 'achievements':
                        value = userData.achievements?.length || 0;
                        break;
                    case 'camera':
                        value = userData.cameraTime || 0;
                        break;
                    case 'stream':
                        value = userData.streamTime || 0;
                        break;
                }
                
                if (value > 0) {
                    users.push({ userId, value });
                }
            }
        }
        
        return users.sort((a, b) => b.value - a.value);
    }

    detectCongratulations(content) {
        if (!this.config.congratulationKeywords) {
            return false;
        }
        
        const lowerContent = content.toLowerCase();
        return this.config.congratulationKeywords.some(keyword => 
            lowerContent.includes(keyword.toLowerCase())
        );
    }

    calculateVoiceTime(startTime) {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000 / 60);
    }

    formatNumber(num) {
        if (typeof num !== 'number') num = parseInt(num) || 0;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatDuration(minutes) {
        if (typeof minutes !== 'number') minutes = parseInt(minutes) || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }

    getProgressPercentage(current, target) {
        if (target === 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    }

    getNextMilestone(current) {
        const milestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        return milestones.find(m => m > current) || current + 1000;
    }

    // =================== PERMISSIONS ===================
    
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

    // =================== CACHE MANAGEMENT ===================
    
    setCache(key, value, ttl = 300000) {
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    cleanCache() {
        const now = Date.now();
        const deleted = [];
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
                deleted.push(key);
            }
        }
        
        if (deleted.length > 0) {
            console.log(`🧹 Cache cleaned: ${deleted.length} items removed`);
        }
    }

    // =================== DATABASE MANAGEMENT ===================
    
    saveDatabase(database) {
        try {
            // Créer une sauvegarde avant l'écriture
            if (fs.existsSync('./database.json')) {
                const backupsDir = './backups';
                if (!fs.existsSync(backupsDir)) {
                    fs.mkdirSync(backupsDir, { recursive: true });
                }
                
                // Créer une sauvegarde avec timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backup = `${backupsDir}/database_${timestamp}.json`;
                fs.copyFileSync('./database.json', backup);
                
                // Nettoyer les anciennes sauvegardes
                this.cleanOldBackups(backupsDir, 10);
            }
            
            // Ajouter des métadonnées
            database.lastModified = new Date().toISOString();
            database.lastBackup = new Date().toISOString();
            
            // Écrire la base de données
            fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Database save error:', error);
            return false;
        }
    }

    cleanOldBackups(backupsDir, keepCount) {
        try {
            const files = fs.readdirSync(backupsDir)
                .filter(file => file.startsWith('database_') && file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(backupsDir, file),
                    time: fs.statSync(path.join(backupsDir, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);

            if (files.length > keepCount) {
                const filesToDelete = files.slice(keepCount);
                filesToDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Old backup deleted: ${file.name}`);
                });
            }
        } catch (error) {
            console.error('❌ Error cleaning backups:', error);
        }
    }

    validateUserData(userData) {
        const requiredFields = [
            'messagesCount', 'reactionsGiven', 'reactionsReceived', 'voiceTime',
            'eventsParticipated', 'cameraTime', 'streamTime', 'boosts',
            'congratulationsSent', 'congratulationsReceived', 'achievements',
            'level', 'experience'
        ];

        let hasChanges = false;

        for (const field of requiredFields) {
            if (userData[field] === undefined || userData[field] === null) {
                console.warn(`⚠️ Missing field detected: ${field}, initializing...`);
                hasChanges = true;
                
                if (field === 'achievements') {
                    userData[field] = [];
                } else if (field === 'level') {
                    userData[field] = 1;
                } else if (typeof userData[field] === 'number') {
                    userData[field] = 0;
                } else {
                    userData[field] = 0;
                }
            }
        }

        // Valider les types
        if (typeof userData.level !== 'number' || userData.level < 1) {
            userData.level = 1;
            hasChanges = true;
        }

        if (typeof userData.experience !== 'number' || userData.experience < 0) {
            userData.experience = 0;
            hasChanges = true;
        }

        if (!Array.isArray(userData.achievements)) {
            userData.achievements = [];
            hasChanges = true;
        }

        if (hasChanges) {
            console.log(`🔧 User data validated and corrected`);
        }

        return userData;
    }

    // =================== EMBED UTILITIES ===================
    
    createErrorEmbed(title, description, color = '#ef4444') {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    createSuccessEmbed(title, description, color = '#10b981') {
        return new EmbedBuilder()
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    createInfoEmbed(title, description, color = '#667eea') {
        return new EmbedBuilder()
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    createWarningEmbed(title, description, color = '#f59e0b') {
        return new EmbedBuilder()
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    logError(context, error, additionalInfo = {}) {
        console.error(`❌ [${context}]`, error.message || error);
        
        if (additionalInfo.userId) console.error(`   👤 User: ${additionalInfo.userId}`);
        if (additionalInfo.guildId) console.error(`   🏠 Guild: ${additionalInfo.guildId}`);
        if (additionalInfo.command) console.error(`   ⚡ Command: ${additionalInfo.command}`);
        
        // Log stack trace en mode debug
        if (process.env.DEBUG_MODE === 'true' && error.stack) {
            console.error(`   📋 Stack: ${error.stack}`);
        }
    }

    logInfo(context, message, additionalInfo = {}) {
        console.log(`ℹ️ [${context}] ${message}`);
        
        if (additionalInfo.userId) console.log(`   👤 User: ${additionalInfo.userId}`);
        if (additionalInfo.guildId) console.log(`   🏠 Guild: ${additionalInfo.guildId}`);
    }
}

module.exports = ModernBotFunctions;