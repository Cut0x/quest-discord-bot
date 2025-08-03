// config.js - Configuration robuste QuestBot v1.1
module.exports = {
    // =================== INFORMATIONS GÉNÉRALES ===================
    serverName: process.env.SERVER_NAME || 'Quest Discord Bot',
    version: '3.0.0',
    
    // =================== COULEURS MODERNES ===================
    colors: {
        primary: '#667eea',
        secondary: '#764ba2', 
        accent: '#f093fb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        experience: '#8b5cf6',
        level: '#f59e0b'
    },

    // =================== SYSTÈME D'EXPÉRIENCE ===================
    experience: {
        rewards: {
            message: parseInt(process.env.XP_MESSAGE) || 5,
            voice_minute: parseInt(process.env.XP_VOICE_MINUTE) || 2,
            reaction_given: parseInt(process.env.XP_REACTION_GIVEN) || 2,
            reaction_received: parseInt(process.env.XP_REACTION_RECEIVED) || 3,
            congratulation_sent: parseInt(process.env.XP_CONGRATULATION_SENT) || 10,
            congratulation_received: parseInt(process.env.XP_CONGRATULATION_RECEIVED) || 15,
            boost: parseInt(process.env.XP_BOOST) || 500,
            camera_minute: parseInt(process.env.XP_CAMERA_MINUTE) || 3,
            stream_minute: parseInt(process.env.XP_STREAM_MINUTE) || 4,
            event_participation: parseInt(process.env.XP_EVENT) || 50
        },
        levelFormula: {
            base: 1000,
            multiplier: 1.0
        }
    },

    // =================== MOTS-CLÉS FÉLICITATIONS ===================
    congratulationKeywords: [
        'félicitations', 'félicitation', 'bravo', 'gg', 'good game',
        'well done', 'congratulations', 'congrats', 'nice', 'excellent',
        'parfait', 'super', 'génial', 'amazing', 'awesome', 'great job',
        'chapeau', 'respect', 'props', 'wp', 'well played', 'gg wp',
        'good job', 'nice one', 'well played', 'great', 'fantastic'
    ],

    // =================== SYSTÈME D'EXPLOITS ROBUSTE ===================
    achievements: {
        // =================== EXPLOITS DE MESSAGES ===================
        messages: [
            {
                id: 'first_message',
                name: 'First Steps',
                description: 'Send your first message on the server',
                requirement: 1,
                xp: 50,
                rarity: 'common'
            },
            {
                id: 'chatty',
                name: 'Chatty Member', 
                description: 'Send 50 messages',
                requirement: 50,
                xp: 150,
                rarity: 'common'
            },
            {
                id: 'active_member',
                name: 'Active Member',
                description: 'Send 250 messages',
                requirement: 250,
                xp: 300,
                rarity: 'uncommon'
            },
            {
                id: 'conversation_master',
                name: 'Conversation Master',
                description: 'Send 1000 messages',
                requirement: 1000,
                xp: 600,
                rarity: 'rare'
            },
            {
                id: 'message_legend',
                name: 'Message Legend',
                description: 'Send 5000 messages',
                requirement: 5000,
                xp: 1200,
                rarity: 'epic'
            },
            {
                id: 'chat_dominator',
                name: 'Chat Dominator',
                description: 'Send 10000 messages',
                requirement: 10000,
                xp: 2500,
                rarity: 'legendary'
            }
        ],

        // =================== EXPLOITS VOCAUX ===================
        voice: [
            {
                id: 'first_voice',
                name: 'Voice Debut',
                description: 'Spend your first minute in voice chat',
                requirement: 1,
                xp: 50,
                rarity: 'common'
            },
            {
                id: 'voice_regular',
                name: 'Voice Regular',
                description: 'Spend 30 minutes in voice channels',
                requirement: 30,
                xp: 150,
                rarity: 'common'
            },
            {
                id: 'voice_enthusiast',
                name: 'Voice Enthusiast',
                description: 'Spend 180 minutes in voice channels',
                requirement: 180,
                xp: 300,
                rarity: 'uncommon'
            },
            {
                id: 'voice_addict',
                name: 'Voice Addict',
                description: 'Spend 600 minutes in voice channels',
                requirement: 600,
                xp: 600,
                rarity: 'rare'
            },
            {
                id: 'voice_master',
                name: 'Voice Master',
                description: 'Spend 1800 minutes in voice channels',
                requirement: 1800,
                xp: 1200,
                rarity: 'epic'
            },
            {
                id: 'voice_legend',
                name: 'Voice Legend',
                description: 'Spend 6000 minutes in voice channels',
                requirement: 6000,
                xp: 2500,
                rarity: 'legendary'
            }
        ],

        // =================== EXPLOITS DE RÉACTIONS ===================
        reactions: [
            {
                id: 'first_reaction_given',
                name: 'First Reaction',
                description: 'Give your first reaction',
                requirement: 1,
                type: 'given',
                xp: 25,
                rarity: 'common'
            },
            {
                id: 'reaction_giver',
                name: 'Reaction Giver',
                description: 'Give 50 reactions',
                requirement: 50,
                type: 'given',
                xp: 150,
                rarity: 'common'
            },
            {
                id: 'reaction_spreader',
                name: 'Reaction Spreader',
                description: 'Give 250 reactions',
                requirement: 250,
                type: 'given',
                xp: 300,
                rarity: 'uncommon'
            },
            {
                id: 'reaction_master',
                name: 'Reaction Master',
                description: 'Give 1000 reactions',
                requirement: 1000,
                type: 'given',
                xp: 600,
                rarity: 'rare'
            },
            {
                id: 'first_reaction_received',
                name: 'First Love',
                description: 'Receive your first reaction',
                requirement: 1,
                type: 'received',
                xp: 25,
                rarity: 'common'
            },
            {
                id: 'popular_member',
                name: 'Popular Member',
                description: 'Receive 100 reactions',
                requirement: 100,
                type: 'received',
                xp: 300,
                rarity: 'uncommon'
            },
            {
                id: 'community_favorite',
                name: 'Community Favorite',
                description: 'Receive 500 reactions',
                requirement: 500,
                type: 'received',
                xp: 750,
                rarity: 'rare'
            }
        ],

        // =================== EXPLOITS DE CAMÉRA ===================
        camera: [
            {
                id: 'camera_debut',
                name: 'Camera Debut',
                description: 'Use camera for the first time',
                requirement: 1,
                xp: 100,
                rarity: 'common'
            },
            {
                id: 'camera_user',
                name: 'Camera User',
                description: 'Use camera for 30 minutes total',
                requirement: 30,
                xp: 200,
                rarity: 'uncommon'
            },
            {
                id: 'camera_enthusiast',
                name: 'Camera Enthusiast',
                description: 'Use camera for 120 minutes total',
                requirement: 120,
                xp: 500,
                rarity: 'rare'
            }
        ],

        // =================== EXPLOITS DE STREAM ===================
        stream: [
            {
                id: 'first_stream',
                name: 'First Stream',
                description: 'Share your screen for the first time',
                requirement: 1,
                xp: 100,
                rarity: 'common'
            },
            {
                id: 'stream_regular',
                name: 'Stream Regular',
                description: 'Stream for 60 minutes total',
                requirement: 60,
                xp: 350,
                rarity: 'uncommon'
            },
            {
                id: 'content_creator',
                name: 'Content Creator',
                description: 'Stream for 300 minutes total',
                requirement: 300,
                xp: 750,
                rarity: 'rare'
            }
        ],

        // =================== EXPLOITS DE BOOST ===================
        boosts: [
            {
                id: 'first_boost',
                name: 'Server Supporter',
                description: 'Boost the server for the first time',
                requirement: 1,
                xp: 1000,
                rarity: 'epic'
            }
        ],

        // =================== EXPLOITS DE FÉLICITATIONS ===================
        congratulations: [
            {
                id: 'first_congrats_sent',
                name: 'Supportive Member',
                description: 'Congratulate someone for the first time',
                requirement: 1,
                type: 'sent',
                xp: 50,
                rarity: 'common'
            },
            {
                id: 'congratulator',
                name: 'Congratulator',
                description: 'Send 25 congratulations',
                requirement: 25,
                type: 'sent',
                xp: 250,
                rarity: 'uncommon'
            },
            {
                id: 'community_cheerleader',
                name: 'Community Cheerleader',
                description: 'Send 100 congratulations',
                requirement: 100,
                type: 'sent',
                xp: 600,
                rarity: 'rare'
            },
            {
                id: 'first_congrats_received',
                name: 'First Recognition',
                description: 'Receive your first congratulation',
                requirement: 1,
                type: 'received',
                xp: 75,
                rarity: 'common'
            },
            {
                id: 'recognized_member',
                name: 'Recognized Member',
                description: 'Receive 25 congratulations',
                requirement: 25,
                type: 'received',
                xp: 350,
                rarity: 'uncommon'
            },
            {
                id: 'achievement_magnet',
                name: 'Achievement Magnet',
                description: 'Receive 100 congratulations',
                requirement: 100,
                type: 'received',
                xp: 850,
                rarity: 'epic'
            }
        ]
    },

    // =================== RARETÉS D'EXPLOITS ===================
    rarities: {
        common: {
            name: 'Common',
            color: '#9ca3af',
            emoji: '⚪'
        },
        uncommon: {
            name: 'Uncommon',
            color: '#10b981',
            emoji: '🟢'
        },
        rare: {
            name: 'Rare',
            color: '#3b82f6',
            emoji: '🔵'
        },
        epic: {
            name: 'Epic',
            color: '#8b5cf6',
            emoji: '🟣'
        },
        legendary: {
            name: 'Legendary',
            color: '#f59e0b',
            emoji: '🟡'
        },
        mythic: {
            name: 'Mythic',
            color: '#ef4444',
            emoji: '🔴'
        }
    },

    // =================== CATÉGORIES D'AFFICHAGE ===================
    categories: {
        messages: {
            name: 'Messages',
            emoji: '💬',
            description: 'Message sending achievements'
        },
        voice: {
            name: 'Voice Activity',
            emoji: '🎙️',
            description: 'Voice channel participation'
        },
        reactions: {
            name: 'Reactions',
            emoji: '❤️',
            description: 'Reaction interactions'
        },
        camera: {
            name: 'Camera Usage',
            emoji: '📹',
            description: 'Video camera achievements'
        },
        stream: {
            name: 'Screen Sharing',
            emoji: '📺',
            description: 'Screen sharing achievements'
        },
        boosts: {
            name: 'Server Boosts',
            emoji: '🚀',
            description: 'Server boosting achievements'
        },
        congratulations: {
            name: 'Congratulations',
            emoji: '🎉',
            description: 'Community support achievements'
        }
    },

    // =================== NOTIFICATIONS ===================
    notifications: {
        sendPrivate: process.env.SEND_PRIVATE_NOTIFICATIONS === 'true',
        sendPublic: process.env.SEND_PUBLIC_NOTIFICATIONS !== 'false', // true par défaut
        achievementDelay: parseInt(process.env.ACHIEVEMENT_DELAY) || 2000,
        levelUpDelay: parseInt(process.env.LEVELUP_DELAY) || 1000
    },

    // =================== BACKUP CONFIGURATION ===================
    backup: {
        enabled: process.env.BACKUP_ENABLED !== 'false', // true par défaut
        interval: parseInt(process.env.BACKUP_INTERVAL) || 3600000, // 1 heure
        keepCount: parseInt(process.env.BACKUP_KEEP_COUNT) || 10,
        location: process.env.BACKUP_LOCATION || './backups/'
    },

    // =================== LIMITES ET COOLDOWNS ===================
    limits: {
        messageXPCooldown: parseInt(process.env.MESSAGE_XP_COOLDOWN) || 10000, // 10 secondes
        voiceXPInterval: parseInt(process.env.VOICE_XP_INTERVAL) || 60000, // 1 minute
        maxDailyXP: parseInt(process.env.MAX_DAILY_XP) || 5000,
        maxWeeklyXP: parseInt(process.env.MAX_WEEKLY_XP) || 25000
    },

    // =================== FONCTIONNALITÉS AVANCÉES ===================
    features: {
        modernCanvas: process.env.MODERN_CANVAS !== 'false', // true par défaut
        glassmorphism: process.env.GLASSMORPHISM !== 'false', // true par défaut
        advancedStats: process.env.ADVANCED_STATS !== 'false', // true par défaut
        realTimeUpdates: process.env.REALTIME_UPDATES !== 'false', // true par défaut
        achievementPreviews: process.env.ACHIEVEMENT_PREVIEWS !== 'false', // true par défaut
        progressTracking: process.env.PROGRESS_TRACKING !== 'false', // true par défaut
        socialFeatures: process.env.SOCIAL_FEATURES !== 'false', // true par défaut
        adminDashboard: process.env.ADMIN_DASHBOARD !== 'false' // true par défaut
    },

    // =================== MESSAGES PERSONNALISÉS ===================
    messages: {
        welcomeNewUser: process.env.WELCOME_MESSAGE || 'Welcome to the server! Start chatting to begin your journey.',
        firstAchievement: process.env.FIRST_ACHIEVEMENT_MESSAGE || 'Congratulations on your first achievement! Many more await.',
        levelUp: process.env.LEVELUP_MESSAGE || 'Level up! You\'ve reached level {level}!',
        boostThanks: process.env.BOOST_THANKS_MESSAGE || 'Thank you for boosting our server!',
        milestoneReached: process.env.MILESTONE_MESSAGE || 'Milestone reached: {achievement}!'
    },

    // =================== VALIDATION ET SÉCURITÉ ===================
    validation: {
        maxUsernameLength: 50,
        maxMessageLength: 2000,
        maxAchievementNameLength: 100,
        allowedImageFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        maxImageSize: 8 * 1024 * 1024 // 8MB
    },

    // =================== MÉTHODES UTILITAIRES ===================
    
    /**
     * Valide la configuration au démarrage
     */
    validate() {
        const required = ['DISCORD_TOKEN'];
        const missing = required.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validation des achievements
        this.validateAchievements();

        console.log('✅ Configuration validated successfully');
        return true;
    },

    /**
     * Valide la structure des achievements
     */
    validateAchievements() {
        let totalAchievements = 0;
        
        for (const [category, achievements] of Object.entries(this.achievements)) {
            if (!Array.isArray(achievements)) {
                console.warn(`⚠️ Achievement category '${category}' is not an array`);
                continue;
            }

            for (const achievement of achievements) {
                if (!achievement.id || !achievement.name || !achievement.requirement) {
                    console.warn(`⚠️ Invalid achievement in category '${category}':`, achievement);
                }
                totalAchievements++;
            }
        }

        console.log(`📊 Loaded ${totalAchievements} achievements across ${Object.keys(this.achievements).length} categories`);
        return totalAchievements;
    },

    /**
     * Obtient la configuration d'un achievement
     */
    getAchievement(category, id) {
        return this.achievements[category]?.find(achievement => achievement.id === id);
    },

    /**
     * Obtient la rareté d'un achievement
     */
    getRarity(rarityName) {
        return this.rarities[rarityName] || this.rarities.common;
    },

    /**
     * Obtient les informations d'une catégorie
     */
    getCategory(categoryName) {
        return this.categories[categoryName] || {
            name: categoryName,
            emoji: '🏆',
            description: 'Custom category'
        };
    }
};