const { Client, GatewayIntentBits, Collection, EmbedBuilder, AttachmentBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
require('dotenv').config();

const config = require('./config.js');

class AdvancedQuestBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildPresences
            ]
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.database = this.loadDatabase();
        this.voiceTracking = new Map();
        this.achievements = config.achievements;
        this.categories = config.categories;
        
        // Statistiques du bot
        this.stats = {
            messagesProcessed: 0,
            achievementsUnlocked: 0,
            commandsExecuted: 0,
            uptime: Date.now()
        };

        this.init();
    }

    async init() {
        try {
            // Créer les dossiers nécessaires
            this.createDirectories();
            
            // Charger les polices personnalisées si disponibles
            this.loadFonts();
            
            // Charger les commandes et événements
            await this.loadCommands();
            await this.loadEvents();
            
            // Démarrer le bot
            await this.client.login(process.env.DISCORD_TOKEN);
            
            console.log('🚀 QuestBot Advanced démarré avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors du démarrage:', error);
            process.exit(1);
        }
    }

    createDirectories() {
        const dirs = ['commands', 'events', 'assets', 'backups', 'temp'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Dossier créé: ${dir}/`);
            }
        });
    }

    loadFonts() {
        try {
            const fontsPath = path.join(__dirname, 'assets', 'fonts');
            if (fs.existsSync(fontsPath)) {
                const fontFiles = fs.readdirSync(fontsPath).filter(file => file.endsWith('.ttf') || file.endsWith('.otf'));
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

    loadDatabase() {
        try {
            if (fs.existsSync('./database.json')) {
                const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
                console.log('📊 Base de données chargée');
                return data;
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la base de données:', error);
        }
        
        console.log('📊 Création d\'une nouvelle base de données');
        return {
            users: {},
            guilds: {},
            settings: {},
            version: '2.0.0',
            createdAt: new Date().toISOString(),
            lastBackup: null
        };
    }

    saveDatabase() {
        try {
            // Créer une sauvegarde avant l'écriture
            if (fs.existsSync('./database.json')) {
                const backup = `./backups/database_${Date.now()}.json`;
                fs.copyFileSync('./database.json', backup);
            }
            
            this.database.lastModified = new Date().toISOString();
            fs.writeFileSync('./database.json', JSON.stringify(this.database, null, 2));
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
        }
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFolders = ['user', 'admin', 'utility'];
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                continue;
            }
            
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    
                    if ('data' in command && 'execute' in command) {
                        this.commands.set(command.data.name, command);
                        console.log(`✅ Commande chargée: ${command.data.name}`);
                    } else {
                        console.log(`⚠️ Commande ignorée ${file}: structure invalide`);
                    }
                } catch (error) {
                    console.error(`❌ Erreur lors du chargement de ${file}:`, error);
                }
            }
        }
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        if (!fs.existsSync(eventsPath)) return;

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);
                
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args, this));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args, this));
                }
                console.log(`🎯 Événement chargé: ${event.name}`);
            } catch (error) {
                console.error(`❌ Erreur lors du chargement de l'événement ${file}:`, error);
            }
        }
    }

    getUserData(userId, guildId) {
        if (!this.database.users[userId]) {
            this.database.users[userId] = {};
        }
        if (!this.database.users[userId][guildId]) {
            this.database.users[userId][guildId] = {
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
                streamSessionStart: null
            };
        }
        
        // Mettre à jour la dernière activité
        this.database.users[userId][guildId].lastActivity = new Date().toISOString();
        return this.database.users[userId][guildId];
    }

    async checkAchievements(userId, guildId, guild, options = {}) {
        const userData = this.getUserData(userId, guildId);
        const newAchievements = [];
        const silent = options.silent || false;

        for (const category in this.achievements) {
            for (const achievement of this.achievements[category]) {
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
                        
                        this.stats.achievementsUnlocked++;
                        
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

        this.saveDatabase();
        return newAchievements;
    }

    async sendAchievementNotification(userId, guildId, achievements, guild) {
        try {
            const user = await this.client.users.fetch(userId);
            const notificationChannel = guild.channels.cache.get(process.env.NOTIFICATION_CHANNEL_ID);
            
            for (const { achievement, category, leveledUp, newLevel } of achievements) {
                // Créer une image d'achievement avec Canvas
                const achievementCard = await this.createAchievementCard(user, achievement, category, leveledUp, newLevel);
                
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Nouvel exploit débloqué !')
                    .setDescription(`**${user.displayName}** vient de débloquer l'exploit **${achievement.name}** ${achievement.emoji || '🏆'} !\n\n${achievement.description || 'Félicitations pour cet accomplissement !'}\n\n${leveledUp ? `🆙 **Niveau supérieur atteint:** ${newLevel} !` : ''}`)
                    .setColor(config.colors.success)
                    .setImage('attachment://achievement.png')
                    .setTimestamp()
                    .setFooter({ text: `${config.serverName} • QuestBot Advanced` });

                const attachment = new AttachmentBuilder(achievementCard, { name: 'achievement.png' });

                if (notificationChannel) {
                    await notificationChannel.send({ 
                        embeds: [embed], 
                        files: [attachment] 
                    });
                }

                // Envoyer en privé si configuré
                if (config.notifications.sendPrivate) {
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

    async createAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Arrière-plan avec gradient
        const gradient = ctx.createLinearGradient(0, 0, 800, 400);
        gradient.addColorStop(0, config.colors.primary + '40');
        gradient.addColorStop(1, config.colors.secondary + '40');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 400);

        // Bordure
        ctx.strokeStyle = config.colors.primary;
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
            ctx.fillStyle = config.colors.secondary;
            ctx.beginPath();
            ctx.arc(120, 120, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cercle autour de l'avatar
        ctx.strokeStyle = config.colors.primary;
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
        ctx.fillStyle = config.colors.primary;
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
            ctx.fillStyle = config.colors.experience;
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

    async createProgressCard(userId, guildId, user) {
        const userData = this.getUserData(userId, guildId);
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext('2d');

        // Arrière-plan
        const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 600);

        // En-tête
        ctx.fillStyle = config.colors.primary;
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

    async createLeaderboard(guildId, category = 'messages', limit = 10) {
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
        ctx.fillText(`🏆 TOP ${limit.toString().toUpperCase()} - ${this.categories[category]?.name.toUpperCase() || category.toUpperCase()}`, 400, 60);

        // Récupérer les données des utilisateurs
        const users = [];
        for (const userId in this.database.users) {
            if (this.database.users[userId][guildId]) {
                const userData = this.database.users[userId][guildId];
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

            // Nom d'utilisateur (simulé)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText(`Utilisateur ${user.userId.slice(0, 8)}...`, 140, y + 28);

            // Valeur
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'right';
            const suffix = category === 'voice' ? ' min' : '';
            ctx.fillText(user.value + suffix, 720, y + 28);

            y += 50;
        }

        return canvas.toBuffer();
    }

    // Gestion des cooldowns
    setCooldown(userId, commandName, duration) {
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Collection());
        }
        
        const now = Date.now();
        const timestamps = this.cooldowns.get(commandName);
        timestamps.set(userId, now);
        
        setTimeout(() => timestamps.delete(userId), duration);
    }

    getCooldown(userId, commandName) {
        if (!this.cooldowns.has(commandName)) return 0;
        
        const timestamps = this.cooldowns.get(commandName);
        if (!timestamps.has(userId)) return 0;
        
        return timestamps.get(userId);
    }

    // Utilitaires
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }

    getProgressPercentage(current, target) {
        return Math.min(Math.round((current / target) * 100), 100);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

// Lancement du bot
const bot = new AdvancedQuestBot();

module.exports = AdvancedQuestBot;