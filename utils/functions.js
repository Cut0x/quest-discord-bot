// utils/functions.js - Fonctions utilitaires centralisées pour QuestBot Advanced
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

class BotFunctions {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.loadFonts();
    }

    // =================== GESTION DES POLICES ===================
    loadFonts() {
        try {
            const fontsPath = path.join(__dirname, '..', 'assets', 'fonts');
            if (fs.existsSync(fontsPath)) {
                const fontFiles = fs.readdirSync(fontsPath).filter(file => 
                    file.endsWith('.ttf') || file.endsWith('.otf')
                );
                
                fontFiles.forEach(font => {
                    const fontPath = path.join(fontsPath, font);
                    const fontName = font.split('.')[0];
                    registerFont(fontPath, { family: fontName });
                    console.log(`🔤 Police chargée: ${fontName}`);
                });
            }
        } catch (error) {
            console.log('⚠️ Aucune police personnalisée trouvée, utilisation des polices par défaut');
        }
    }

    // =================== GESTION DES DONNÉES UTILISATEUR ===================
    
    /**
     * Obtient ou crée les données d'un utilisateur
     */
    getUserData(database, userId, guildId) {
        if (!database.users[userId]) {
            database.users[userId] = {};
        }
        if (!database.users[userId][guildId]) {
            database.users[userId][guildId] = {
                // Statistiques de base
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
                
                // Métadonnées
                achievements: [],
                joinedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                level: 1,
                experience: 0,
                
                // Suivi temporel
                dailyStats: {},
                weeklyStats: {},
                monthlyStats: {},
                
                // Sessions en cours
                lastVoiceJoin: null,
                cameraSessionStart: null,
                streamSessionStart: null,
                lastMessageTime: null
            };
        }
        
        // Mettre à jour la dernière activité
        database.users[userId][guildId].lastActivity = new Date().toISOString();
        return database.users[userId][guildId];
    }

    // =================== SYSTÈME D'EXPLOITS ===================
    
    /**
     * Vérifie et débloque les nouveaux exploits
     */
    async checkAchievements(database, userId, guildId, guild, options = {}) {
        const userData = this.getUserData(database, userId, guildId);
        const newAchievements = [];
        const silent = options.silent || false;

        for (const category in this.config.achievements) {
            for (const achievement of this.config.achievements[category]) {
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
                        
                        // Calculer le nouveau niveau
                        const newLevel = Math.floor(userData.experience / 1000) + 1;
                        const leveledUp = newLevel > userData.level;
                        userData.level = newLevel;
                        
                        newAchievements.push({ 
                            achievement, 
                            category, 
                            leveledUp,
                            newLevel: userData.level
                        });
                        
                        // Attribuer le rôle si configuré
                        if (achievement.roleId) {
                            try {
                                const member = await guild.members.fetch(userId);
                                const role = guild.roles.cache.get(achievement.roleId);
                                if (member && role && !member.roles.cache.has(role.id)) {
                                    await member.roles.add(role);
                                    console.log(`🏆 Rôle ${role.name} attribué à ${member.displayName}`);
                                }
                            } catch (error) {
                                console.error('❌ Erreur lors de l\'attribution du rôle:', error);
                            }
                        }
                    }
                }
            }
        }

        if (newAchievements.length > 0 && !silent) {
            await this.sendAchievementNotification(userId, guildId, newAchievements, guild);
        }

        return newAchievements;
    }

    /**
     * Envoie une notification d'exploit
     */
    async sendAchievementNotification(userId, guildId, achievements, guild) {
        try {
            const user = await guild.client.users.fetch(userId);
            const notificationChannel = guild.channels.cache.get(process.env.NOTIFICATION_CHANNEL_ID);
            
            for (const { achievement, category, leveledUp, newLevel } of achievements) {
                // Créer une image d'achievement avec Canvas
                const achievementCard = await this.createAchievementCard(user, achievement, category, leveledUp, newLevel);
                
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Nouvel exploit débloqué !')
                    .setDescription(`**${user.displayName}** vient de débloquer l'exploit **${achievement.name}** ${achievement.emoji || '🏆'} !\n\n${achievement.description || 'Félicitations pour cet accomplissement !'}\n\n${leveledUp ? `🆙 **Niveau supérieur atteint:** ${newLevel} !` : ''}`)
                    .setColor(this.config.colors.success)
                    .setImage('attachment://achievement.png')
                    .setTimestamp()
                    .setFooter({ text: `${this.config.serverName} • QuestBot Advanced` });

                const attachment = new AttachmentBuilder(achievementCard, { name: 'achievement.png' });

                if (notificationChannel) {
                    await notificationChannel.send({ 
                        embeds: [embed], 
                        files: [attachment] 
                    });
                }

                // Envoyer en privé si configuré
                if (this.config.notifications.sendPrivate) {
                    try {
                        await user.send({ 
                            embeds: [embed], 
                            files: [attachment] 
                        });
                    } catch (error) {
                        console.log(`⚠️ Impossible d'envoyer le message privé à ${user.tag}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de notification:', error);
        }
    }

    // =================== CRÉATION D'IMAGES CANVAS ===================
    
    /**
     * Crée une carte d'exploit
     */
    async createAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Arrière-plan avec gradient
        const gradient = ctx.createLinearGradient(0, 0, 800, 400);
        gradient.addColorStop(0, this.config.colors.primary + '40');
        gradient.addColorStop(1, this.config.colors.secondary + '40');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 400);

        // Bordure
        ctx.strokeStyle = this.config.colors.primary;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 780, 380);

        // Avatar utilisateur
        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(120, 120, 60, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 60, 60, 120, 120);
            ctx.restore();
        } catch (error) {
            // Avatar par défaut en cas d'erreur
            ctx.fillStyle = this.config.colors.secondary;
            ctx.beginPath();
            ctx.arc(120, 120, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cercle autour de l'avatar
        ctx.strokeStyle = this.config.colors.primary;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(120, 120, 66, 0, Math.PI * 2);
        ctx.stroke();

        // Nom de l'utilisateur
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(user.displayName, 220, 80);

        // Nom de l'achievement
        ctx.fillStyle = this.config.colors.primary;
        ctx.font = 'bold 48px Arial';
        ctx.fillText(achievement.name, 220, 140);

        // Emoji de l'achievement
        ctx.font = '64px Arial';
        ctx.fillText(achievement.emoji || '🏆', 220, 220);

        // Description
        if (achievement.description) {
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '24px Arial';
            const words = achievement.description.split(' ');
            let line = '';
            let y = 260;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > 500 && n > 0) {
                    ctx.fillText(line, 220, y);
                    line = words[n] + ' ';
                    y += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 220, y);
        }

        // Niveau si level up
        if (leveledUp) {
            ctx.fillStyle = this.config.colors.experience;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`NIVEAU ${newLevel}`, 770, 350);
        }

        // Date
        ctx.fillStyle = '#888888';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toLocaleDateString('fr-FR'), 770, 380);

        return canvas.toBuffer();
    }

    /**
     * Crée une carte de profil utilisateur
     */
    async createProgressCard(userId, guildId, user, userData) {
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext('2d');

        // Arrière-plan
        const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 600);

        // En-tête
        ctx.fillStyle = this.config.colors.primary;
        ctx.fillRect(0, 0, 1000, 100);

        // Avatar
        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(80, 50, 35, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 45, 15, 70, 70);
            ctx.restore();
        } catch (error) {
            // Avatar par défaut
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(80, 50, 35, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nom et niveau
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(user.displayName, 140, 45);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Niveau ${userData.level} • ${userData.experience} XP`, 140, 75);

        // Statistiques
        let y = 150;
        const stats = [
            { label: 'Messages', value: userData.messagesCount, emoji: '💬' },
            { label: 'Réactions données', value: userData.reactionsGiven, emoji: '👍' },
            { label: 'Réactions reçues', value: userData.reactionsReceived, emoji: '❤️' },
            { label: 'Temps vocal', value: `${userData.voiceTime}min`, emoji: '🎙️' },
            { label: 'Événements', value: userData.eventsParticipated, emoji: '🎭' },
            { label: 'Félicitations envoyées', value: userData.congratulationsSent, emoji: '👏' }
        ];

        stats.forEach((stat, index) => {
            const x = (index % 2) * 500 + 50;
            const currentY = y + Math.floor(index / 2) * 80;

            // Fond de la stat
            ctx.fillStyle = '#2c2c54';
            ctx.fillRect(x, currentY, 400, 60);

            // Emoji et label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${stat.emoji} ${stat.label}`, x + 20, currentY + 25);

            // Valeur
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(stat.value.toString(), x + 380, currentY + 40);
        });

        return canvas.toBuffer();
    }

    /**
     * Crée un leaderboard visuel
     */
    async createLeaderboard(guildId, category = 'messages', limit = 10, database, client) {
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Arrière-plan
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // Titre
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🏆 TOP ${limit.toString().toUpperCase()} - ${this.config.categories[category]?.name.toUpperCase() || category.toUpperCase()}`, 400, 60);

        // Récupérer les données des utilisateurs
        const users = [];
        for (const userId in database.users) {
            if (database.users[userId][guildId]) {
                const userData = database.users[userId][guildId];
                let value = 0;
                
                switch (category) {
                    case 'messages':
                        value = userData.messagesCount;
                        break;
                    case 'reactions_given':
                        value = userData.reactionsGiven;
                        break;
                    case 'reactions_received':
                        value = userData.reactionsReceived;
                        break;
                    case 'voice':
                        value = userData.voiceTime;
                        break;
                    case 'level':
                        value = userData.level;
                        break;
                    case 'experience':
                        value = userData.experience;
                        break;
                }
                
                if (value > 0) {
                    users.push({ userId, value });
                }
            }
        }

        // Trier et limiter
        users.sort((a, b) => b.value - a.value);
        const topUsers = users.slice(0, limit);

        // Afficher le classement
        let y = 120;
        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const position = i + 1;
            
            // Fond de la ligne
            ctx.fillStyle = position <= 3 ? '#FFD700' + '40' : '#FFFFFF' + '20';
            ctx.fillRect(50, y, 700, 40);

            // Position
            ctx.fillStyle = position <= 3 ? '#FFD700' : '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`#${position}`, 70, y + 28);

            // Nom d'utilisateur
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            try {
                const discordUser = await client.users.fetch(user.userId);
                ctx.fillText(discordUser.displayName || discordUser.username, 140, y + 28);
            } catch {
                ctx.fillText(`Utilisateur ${user.userId.slice(0, 8)}...`, 140, y + 28);
            }

            // Valeur
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'right';
            const suffix = category === 'voice' ? ' min' : '';
            ctx.fillText(user.value + suffix, 720, y + 28);

            y += 50;
        }

        return canvas.toBuffer();
    }

    // =================== GESTION DES FÉLICITATIONS ===================
    
    /**
     * Détecte si un message contient des félicitations
     */
    detectCongratulations(content) {
        const lowerContent = content.toLowerCase();
        return this.config.congratulationKeywords.some(keyword => 
            lowerContent.includes(keyword.toLowerCase())
        );
    }

    // =================== GESTION DU TEMPS VOCAL ===================
    
    /**
     * Calcule le temps passé en vocal
     */
    calculateVoiceTime(startTime) {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000 / 60); // en minutes
    }

    // =================== UTILITAIRES DE FORMATAGE ===================
    
    /**
     * Formate un nombre avec des espaces
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Formate une durée en minutes
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }

    /**
     * Calcule le pourcentage de progression
     */
    getProgressPercentage(current, target) {
        return Math.min(Math.round((current / target) * 100), 100);
    }

    /**
     * Obtient la prochaine étape importante
     */
    getNextMilestone(current) {
        const milestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        return milestones.find(m => m > current) || current + 1000;
    }

    // =================== GESTION DES PERMISSIONS ===================
    
    /**
     * Vérifie les permissions d'un utilisateur
     */
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

    // =================== GESTION DU CACHE ===================
    
    /**
     * Ajoute un élément au cache
     */
    setCache(key, value, ttl = 300000) { // 5 minutes par défaut
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }

    /**
     * Récupère un élément du cache
     */
    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * Nettoie le cache expiré
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    }

    // =================== SAUVEGARDE ET RESTAURATION ===================
    
    /**
     * Sauvegarde la base de données
     */
    saveDatabase(database) {
        try {
            // Créer une sauvegarde avant l'écriture
            if (fs.existsSync('./database.json')) {
                const backupsDir = './backups';
                if (!fs.existsSync(backupsDir)) {
                    fs.mkdirSync(backupsDir, { recursive: true });
                }
                const backup = `${backupsDir}/database_${Date.now()}.json`;
                fs.copyFileSync('./database.json', backup);
                
                // Nettoyer les anciennes sauvegardes (garder les 10 dernières)
                this.cleanOldBackups(backupsDir, 10);
            }
            
            database.lastModified = new Date().toISOString();
            fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    /**
     * Nettoie les anciennes sauvegardes
     */
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
                    console.log(`🗑️ Ancienne sauvegarde supprimée: ${file.name}`);
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des sauvegardes:', error);
        }
    }

    // =================== VALIDATION DES DONNÉES ===================
    
    /**
     * Valide les données utilisateur
     */
    validateUserData(userData) {
        const requiredFields = [
            'messagesCount', 'reactionsGiven', 'reactionsReceived', 'voiceTime',
            'eventsParticipated', 'cameraTime', 'streamTime', 'boosts',
            'congratulationsSent', 'congratulationsReceived', 'achievements',
            'level', 'experience'
        ];

        for (const field of requiredFields) {
            if (userData[field] === undefined || userData[field] === null) {
                console.warn(`⚠️ Champ manquant détecté: ${field}, initialisation...`);
                if (field === 'achievements') {
                    userData[field] = [];
                } else if (typeof userData[field] === 'number' || field.includes('Count') || field.includes('Time')) {
                    userData[field] = 0;
                } else if (field === 'level') {
                    userData[field] = 1;
                }
            }
        }

        return userData;
    }

    // =================== GESTION DES ERREURS ===================
    
    /**
     * Crée un embed d'erreur
     */
    createErrorEmbed(title, description, color = null) {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setColor(color || this.config.colors.error)
            .setTimestamp();
    }

    /**
     * Crée un embed de succès
     */
    createSuccessEmbed(title, description, color = null) {
        return new EmbedBuilder()
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setColor(color || this.config.colors.success)
            .setTimestamp();
    }

    /**
     * Crée un embed d'information
     */
    createInfoEmbed(title, description, color = null) {
        return new EmbedBuilder()
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setColor(color || this.config.colors.info)
            .setTimestamp();
    }

    /**
     * Log une erreur de manière cohérente
     */
    logError(context, error, additionalInfo = {}) {
        console.error(`❌ [${context}]`, error);
        
        if (additionalInfo.userId) console.error(`   Utilisateur: ${additionalInfo.userId}`);
        if (additionalInfo.guildId) console.error(`   Serveur: ${additionalInfo.guildId}`);
        if (additionalInfo.command) console.error(`   Commande: ${additionalInfo.command}`);
    }
}

module.exports = BotFunctions;