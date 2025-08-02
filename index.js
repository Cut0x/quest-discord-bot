// index.js - QuestBot Advanced (Version corrigée)
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config.js');
const BotFunctions = require('./utils/functions.js');

class QuestBot {
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
        this.functions = new BotFunctions(config);
        
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
            // Vérifier les variables d'environnement requises
            this.checkRequiredEnvVars();
            
            // Créer les dossiers nécessaires
            this.createDirectories();
            
            // Charger les commandes et événements
            await this.loadCommands();
            await this.loadEvents();
            
            // Planifier le nettoyage du cache
            setInterval(() => {
                this.functions.cleanCache();
            }, 300000); // 5 minutes
            
            // Planifier les sauvegardes automatiques
            setInterval(() => {
                this.saveDatabase();
            }, 600000); // 10 minutes
            
            // Démarrer le bot
            await this.client.login(process.env.DISCORD_TOKEN);
            
            console.log('🚀 QuestBot Advanced démarré avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors du démarrage:', error);
            process.exit(1);
        }
    }

    checkRequiredEnvVars() {
        const required = ['DISCORD_TOKEN'];
        const missing = required.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            console.error('❌ Variables d\'environnement manquantes:', missing.join(', '));
            throw new Error('Configuration incomplète');
        }
        
        // Avertissements pour les variables optionnelles mais recommandées
        const recommended = [
            'NOTIFICATION_CHANNEL_ID',
            'ADMIN_IDS',
            'PREFIX'
        ];
        
        const missingRecommended = recommended.filter(env => !process.env[env]);
        if (missingRecommended.length > 0) {
            console.warn('⚠️ Variables d\'environnement recommandées manquantes:', missingRecommended.join(', '));
        }
    }

    createDirectories() {
        const dirs = ['commands', 'events', 'assets', 'backups', 'temp', 'utils'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Dossier créé: ${dir}/`);
            }
        });
    }

    loadDatabase() {
        try {
            if (fs.existsSync('./database.json')) {
                const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
                console.log('📊 Base de données chargée');
                
                // Valider et corriger la structure si nécessaire
                if (!data.version) data.version = '2.0.0';
                if (!data.users) data.users = {};
                if (!data.guilds) data.guilds = {};
                if (!data.settings) data.settings = {};
                
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
        return this.functions.saveDatabase(this.database);
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFolders = ['user', 'admin', 'utility'];
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`📁 Dossier de commandes créé: ${folder}/`);
                continue;
            }
            
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    // Supprimer le cache pour permettre le rechargement à chaud
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    
                    if ('data' in command && 'execute' in command) {
                        this.commands.set(command.data.name, command);
                        console.log(`✅ Commande chargée: ${command.data.name}`);
                    } else {
                        console.log(`⚠️ Commande ignorée ${file}: structure invalide (manque 'data' ou 'execute')`);
                    }
                } catch (error) {
                    console.error(`❌ Erreur lors du chargement de ${file}:`, error.message);
                }
            }
        }
        
        console.log(`📚 ${this.commands.size} commande(s) chargée(s) au total`);
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        if (!fs.existsSync(eventsPath)) {
            fs.mkdirSync(eventsPath, { recursive: true });
            console.log('📁 Dossier events créé');
            return;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                // Supprimer le cache pour permettre le rechargement à chaud
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);
                
                if (!event.name || !event.execute) {
                    console.log(`⚠️ Événement ignoré ${file}: structure invalide`);
                    continue;
                }
                
                if (event.once) {
                    this.client.once(event.name, (...args) => {
                        try {
                            event.execute(...args, this);
                        } catch (error) {
                            this.functions.logError(`Event ${event.name}`, error);
                        }
                    });
                } else {
                    this.client.on(event.name, (...args) => {
                        try {
                            event.execute(...args, this);
                        } catch (error) {
                            this.functions.logError(`Event ${event.name}`, error);
                        }
                    });
                }
                console.log(`🎯 Événement chargé: ${event.name}`);
            } catch (error) {
                console.error(`❌ Erreur lors du chargement de l'événement ${file}:`, error.message);
            }
        }
    }

    // =================== MÉTHODES PRINCIPALES ===================

    getUserData(userId, guildId) {
        const userData = this.functions.getUserData(this.database, userId, guildId);
        return this.functions.validateUserData(userData);
    }

    async checkAchievements(userId, guildId, guild, options = {}) {
        const achievements = await this.functions.checkAchievements(
            this.database, 
            userId, 
            guildId, 
            guild, 
            options
        );
        
        if (achievements.length > 0) {
            this.stats.achievementsUnlocked += achievements.length;
            this.saveDatabase();
        }
        
        return achievements;
    }

    async sendAchievementNotification(userId, guildId, achievements, guild) {
        return this.functions.sendAchievementNotification(userId, guildId, achievements, guild);
    }

    // =================== MÉTHODES CANVAS ===================

    async createAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        return this.functions.createAchievementCard(user, achievement, category, leveledUp, newLevel);
    }

    async createProgressCard(userId, guildId, user) {
        const userData = this.getUserData(userId, guildId);
        return this.functions.createProgressCard(userId, guildId, user, userData);
    }

    async createLeaderboard(guildId, category = 'messages', limit = 10) {
        return this.functions.createLeaderboard(guildId, category, limit, this.database, this.client);
    }

    // =================== GESTION DES COOLDOWNS ===================

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

    // =================== UTILITAIRES ===================

    formatNumber(num) {
        return this.functions.formatNumber(num);
    }

    formatDuration(minutes) {
        return this.functions.formatDuration(minutes);
    }

    getProgressPercentage(current, target) {
        return this.functions.getProgressPercentage(current, target);
    }

    // =================== MÉTHODES DE DÉBOGAGE ET MAINTENANCE ===================

    async reloadCommand(commandName) {
        try {
            // Chercher le fichier de commande
            const commandFolders = ['user', 'admin', 'utility'];
            let foundPath = null;
            
            for (const folder of commandFolders) {
                const folderPath = path.join(__dirname, 'commands', folder);
                const filePath = path.join(folderPath, `${commandName}.js`);
                
                if (fs.existsSync(filePath)) {
                    foundPath = filePath;
                    break;
                }
            }
            
            if (!foundPath) {
                throw new Error(`Commande ${commandName} non trouvée`);
            }
            
            // Supprimer le cache et recharger
            delete require.cache[require.resolve(foundPath)];
            const command = require(foundPath);
            
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                console.log(`🔄 Commande rechargée: ${command.data.name}`);
                return true;
            } else {
                throw new Error('Structure de commande invalide');
            }
        } catch (error) {
            this.functions.logError('Reload Command', error, { command: commandName });
            return false;
        }
    }

    getStats() {
        const uptime = Date.now() - this.stats.uptime;
        return {
            ...this.stats,
            uptime: this.functions.formatDuration(Math.floor(uptime / 1000 / 60)),
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size,
            commands: this.commands.size,
            database: {
                users: Object.keys(this.database.users).length,
                totalUserGuildData: Object.values(this.database.users)
                    .reduce((acc, user) => acc + Object.keys(user).length, 0)
            }
        };
    }

    // =================== NETTOYAGE ET FERMETURE ===================

    async shutdown() {
        console.log('🔄 Arrêt du bot en cours...');
        
        // Sauvegarder la base de données
        this.saveDatabase();
        
        // Nettoyer les ressources
        this.functions.cleanCache();
        
        // Fermer la connexion Discord
        await this.client.destroy();
        
        console.log('✅ Bot arrêté proprement');
        process.exit(0);
    }
}

// =================== GESTION DES ERREURS GLOBALES ===================

process.on('unhandledRejection', (error, promise) => {
    console.error('❌ Unhandled promise rejection:', error);
    console.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('\n🔄 Signal SIGINT reçu, arrêt du bot...');
    if (global.bot) {
        await global.bot.shutdown();
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Signal SIGTERM reçu, arrêt du bot...');
    if (global.bot) {
        await global.bot.shutdown();
    } else {
        process.exit(0);
    }
});

// =================== LANCEMENT DU BOT ===================

const bot = new QuestBot();
global.bot = bot;

module.exports = QuestBot;