// index.js - QuestBot Advanced Moderne (Version refactorisée)
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config.js');
const ModernBotFunctions = require('./utils/functions.js');

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
        this.functions = new ModernBotFunctions(config);
        
        this.stats = {
            messagesProcessed: 0,
            achievementsUnlocked: 0,
            commandsExecuted: 0,
            uptime: Date.now(),
            canvasImagesGenerated: 0
        };

        this.init();
    }

    async init() {
        try {
            this.validateEnvironment();
            this.createDirectories();
            
            await this.loadCommands();
            await this.loadEvents();
            
            this.setupIntervals();
            
            await this.client.login(process.env.DISCORD_TOKEN);
            
            console.log('🚀 QuestBot Advanced Modern started successfully!');
        } catch (error) {
            console.error('❌ Startup error:', error);
            process.exit(1);
        }
    }

    validateEnvironment() {
        const required = ['DISCORD_TOKEN'];
        const missing = required.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            console.error('❌ Missing environment variables:', missing.join(', '));
            throw new Error('Incomplete configuration');
        }
        
        const recommended = [
            'NOTIFICATION_CHANNEL_ID',
            'ADMIN_IDS',
            'PREFIX'
        ];
        
        const missingRecommended = recommended.filter(env => !process.env[env]);
        if (missingRecommended.length > 0) {
            console.warn('⚠️ Missing recommended environment variables:', missingRecommended.join(', '));
        }
    }

    createDirectories() {
        const dirs = ['commands', 'events', 'assets', 'backups', 'temp', 'utils', 'assets/fonts'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Directory created: ${dir}/`);
            }
        });
    }

    loadDatabase() {
        try {
            if (fs.existsSync('./database.json')) {
                const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
                console.log('📊 Database loaded');
                
                if (!data.version) data.version = '3.0.0';
                if (!data.users) data.users = {};
                if (!data.guilds) data.guilds = {};
                if (!data.settings) data.settings = {};
                
                return data;
            }
        } catch (error) {
            console.error('❌ Database loading error:', error);
        }
        
        console.log('📊 Creating new database');
        return {
            users: {},
            guilds: {},
            settings: {},
            version: '3.0.0',
            createdAt: new Date().toISOString(),
            lastBackup: null
        };
    }

    setupIntervals() {
        // Cache cleanup every 5 minutes
        setInterval(() => {
            this.functions.cleanCache();
        }, 300000);
        
        // Auto-save every 10 minutes
        setInterval(() => {
            this.saveDatabase();
        }, 600000);
        
        // Stats update every hour
        setInterval(() => {
            this.updateStats();
        }, 3600000);
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
                console.log(`📁 Command folder created: ${folder}/`);
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
                        console.log(`✅ Command loaded: ${command.data.name}`);
                    } else {
                        console.log(`⚠️ Command ignored ${file}: invalid structure`);
                    }
                } catch (error) {
                    console.error(`❌ Error loading ${file}:`, error.message);
                }
            }
        }
        
        console.log(`📚 ${this.commands.size} command(s) loaded`);
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        if (!fs.existsSync(eventsPath)) {
            fs.mkdirSync(eventsPath, { recursive: true });
            console.log('📁 Events folder created');
            return;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);
                
                if (!event.name || !event.execute) {
                    console.log(`⚠️ Event ignored ${file}: invalid structure`);
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
                console.log(`🎯 Event loaded: ${event.name}`);
            } catch (error) {
                console.error(`❌ Error loading event ${file}:`, error.message);
            }
        }
    }

    // =================== CORE METHODS ===================

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
        return this.functions.sendModernAchievementNotification(userId, guildId, achievements, guild);
    }

    // =================== MODERN CANVAS METHODS ===================

    async createModernProfileCard(userId, guildId, user, member = null) {
        const userData = this.getUserData(userId, guildId);
        this.stats.canvasImagesGenerated++;
        return this.functions.createModernProfileCard(userId, guildId, user, userData, member);
    }

    async createModernAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        this.stats.canvasImagesGenerated++;
        return this.functions.createModernAchievementCard(user, achievement, category, leveledUp, newLevel);
    }

    async createModernLeaderboard(guildId, category = 'messages', limit = 10) {
        this.stats.canvasImagesGenerated++;
        return this.functions.createModernLeaderboard(guildId, category, limit, this.database, this.client);
    }

    // =================== COOLDOWN MANAGEMENT ===================

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

    // =================== UTILITIES ===================

    formatNumber(num) {
        return this.functions.formatNumber(num);
    }

    formatDuration(minutes) {
        return this.functions.formatDuration(minutes);
    }

    getProgressPercentage(current, target) {
        return this.functions.getProgressPercentage(current, target);
    }

    updateStats() {
        const uptime = Date.now() - this.stats.uptime;
        console.log(`📊 Stats Update - Uptime: ${Math.floor(uptime / 1000 / 60)}m, Commands: ${this.stats.commandsExecuted}, Canvas: ${this.stats.canvasImagesGenerated}`);
    }

    // =================== DEBUGGING & MAINTENANCE ===================

    async reloadCommand(commandName) {
        try {
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
                throw new Error(`Command ${commandName} not found`);
            }
            
            delete require.cache[require.resolve(foundPath)];
            const command = require(foundPath);
            
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                console.log(`🔄 Command reloaded: ${command.data.name}`);
                return true;
            } else {
                throw new Error('Invalid command structure');
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

    // =================== CLEANUP & SHUTDOWN ===================

    async shutdown() {
        console.log('🔄 Bot shutdown in progress...');
        
        this.saveDatabase();
        this.functions.cleanCache();
        
        await this.client.destroy();
        
        console.log('✅ Bot shutdown complete');
        process.exit(0);
    }
}

// =================== GLOBAL ERROR HANDLING ===================

process.on('unhandledRejection', (error, promise) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('\n🔄 SIGINT signal received, shutting down...');
    if (global.bot) {
        await global.bot.shutdown();
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 SIGTERM signal received, shutting down...');
    if (global.bot) {
        await global.bot.shutdown();
    } else {
        process.exit(0);
    }
});

// =================== BOT STARTUP ===================

const bot = new QuestBot();
global.bot = bot;

module.exports = QuestBot;