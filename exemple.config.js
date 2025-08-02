// Copiez ce fichier en config.js et personnalisez-le selon vos besoins

module.exports = {
    // ========================
    // CONFIGURATION OBLIGATOIRE
    // ========================
    
    // Token de votre bot Discord (à obtenir sur https://discord.com/developers/applications)
    token: 'VOTRE_TOKEN_BOT_ICI',
    
    // Préfixe des commandes
    prefix: '!',
    
    // Nom de votre serveur (affiché dans les messages)
    serverName: 'Serveur de Skyros',
    
    // ID du canal où envoyer les notifications d'exploits
    notificationChannelId: 'ID_DU_CANAL_NOTIFICATIONS',
    
    // IDs des administrateurs (peuvent utiliser les commandes d'admin)
    adminIds: [
        'VOTRE_USER_ID',
        'ID_AUTRE_ADMIN'
    ],

    // ========================
    // CONFIGURATION OPTIONNELLE
    // ========================
    
    // Couleur des embeds (format hexadécimal)
    embedColor: '#FFD700',
    
    // Envoyer les notifications en privé aussi
    sendPrivateNotifications: true,
    
    // Nombre de catégories par page dans !achievements stats
    itemsPerPage: 3,
    
    githubUrl: 'https://github.com/Cut0x/quest-discord-bot',

    // ========================
    // CONFIGURATION DES CATÉGORIES
    // ========================
    
    categories: {
        messages: {
            name: 'Messages envoyés',
            emoji: '💬'
        },
        reactions: {
            name: 'Réactions aux messages',
            emoji: '❤️'
        },
        voice: {
            name: 'Minutes vocales',
            emoji: '🎙️'
        },
        events: {
            name: 'Participations aux événements',
            emoji: '🎭'
        },
        camera: {
            name: 'Sessions caméra / partage écran',
            emoji: '💀'
        },
        boosts: {
            name: 'Boosts serveur',
            emoji: '🚀'
        },
        congratulations: {
            name: 'Félicitations',
            emoji: '🎉'
        }
    },

    // ========================
    // CONFIGURATION DES EXPLOITS
    // ========================
    
    achievements: {
        // MESSAGES ENVOYÉS
        messages: [
            {
                id: 'bavard_1',
                name: 'BAVARD-E',
                requirement: 5,
                roleId: 'ID_ROLE_BAVARD', // Remplacez par l'ID réel du rôle
                emoji: '💬'
            },
            {
                id: 'eloquent_1',
                name: 'ÉLOQUENT-E',
                requirement: 500,
                roleId: 'ID_ROLE_ELOQUENT',
                emoji: '🗣️'
            },
            {
                id: 'orateur_supreme',
                name: 'ORATEUR-RICE SUPRÊME',
                requirement: 1000,
                roleId: 'ID_ROLE_ORATEUR_SUPREME',
                emoji: '👑'
            }
        ],

        // RÉACTIONS
        reactions: [
            {
                id: 'aimable_1',
                name: 'AIMABLE',
                requirement: 3,
                type: 'received', // 'given' (données) ou 'received' (reçues)
                roleId: 'ID_ROLE_AIMABLE',
                emoji: '❤️'
            },
            {
                id: 'reactif_1',
                name: 'RÉACTIF-VE',
                requirement: 200,
                type: 'given',
                roleId: 'ID_ROLE_REACTIF',
                emoji: '⚡'
            }
        ],

        // TEMPS VOCAL (en minutes)
        voice: [
            {
                id: 'locuteur_1',
                name: 'LOCUTEUR-RICE',
                requirement: 60,
                roleId: 'ID_ROLE_LOCUTEUR',
                emoji: '🎤'
            },
            {
                id: 'orateur_confirme',
                name: 'ORATEUR-RICE CONFIRMÉ-E',
                requirement: 300,
                roleId: 'ID_ROLE_ORATEUR_CONFIRME',
                emoji: '🎙️'
            },
            {
                id: 'maitre_micro',
                name: 'MAÎTRE-ESSE DU MICRO',
                requirement: 1200,
                roleId: 'ID_ROLE_MAITRE_MICRO',
                emoji: '👑'
            }
        ],

        // ÉVÉNEMENTS (ajoutés manuellement par les admins)
        events: [
            {
                id: 'curieux_1',
                name: 'CURIEUX-SE',
                requirement: 1,
                roleId: 'ID_ROLE_CURIEUX',
                emoji: '🔍'
            },
            {
                id: 'habitue_events',
                name: 'HABITUÉ-E DES EVENTS',
                requirement: 5,
                roleId: 'ID_ROLE_HABITUE_EVENTS',
                emoji: '🎭'
            }
        ],

        // CAMÉRA/STREAM (en sessions)
        camera: [
            {
                id: 'premiers_pas_video',
                name: 'PREMIERS PAS VIDÉO',
                requirement: 1,
                roleId: 'ID_ROLE_PREMIERS_PAS_VIDEO',
                emoji: '📹'
            },
            {
                id: 'star_live',
                name: 'STAR DU LIVE',
                requirement: 50,
                roleId: 'ID_ROLE_STAR_LIVE',
                emoji: '🌟'
            }
        ],

        // BOOSTS SERVEUR
        boosts: [
            {
                id: 'bienfaiteur_1',
                name: 'BIENFAITEUR-RICE',
                requirement: 1,
                roleId: 'ID_ROLE_BIENFAITEUR',
                emoji: '💎'
            }
        ],

        // FÉLICITATIONS
        congratulations: [
            {
                id: 'encourageur_1',
                name: 'ENCOURAGEUR-SE',
                requirement: 1,
                type: 'sent', // 'sent' (envoyées) ou 'received' (reçues)
                roleId: 'ID_ROLE_ENCOURAGEUR',
                emoji: '👏'
            },
            {
                id: 'apprecie_1',
                name: 'APPRÉCIÉ-E',
                requirement: 1,
                type: 'received',
                roleId: 'ID_ROLE_APPRECIE',
                emoji: '🥰'
            }
        ]
    },

    // ========================
    // MESSAGES PERSONNALISABLES
    // ========================
    
    messages: {
        achievementUnlocked: '🎉 Félicitations {{user}} ! ♥(✧∇✧)o\n\nTu as atteint **{{count}} {{type}}** sur {{server}} !\n\nTu débloques le rôle {{role}} et obtiens le titre **{{title}}**.\n\nBien joué à toi et à très bientôt! 👏',
        welcomePrivateMessage: '🗝️ Bienvenue dans ton espace privé, {{user}} ! 😊\n\nVoici les étapes pour ton intégration sur **{{server}}** :\n• Réclame à tout moment tes rôles en cliquant sur **Salons et rôles**.\n• Vérifie l\'ensemble de tes quêtes en cliquant sur **Mes quêtes**.\n\nAllez, viens dire coucou dans # général !',
        helpMessage: 'Complète chaque barre pour atteindre le seuil et débloquer de nouveaux rôles. 😊'
    },

    // ========================
    // DÉTECTION DES FÉLICITATIONS
    // ========================
    
    // Mots-clés/emojis qui déclenchent le comptage des félicitations
    congratulationKeywords: [
        'bravo', 'félicitations', 'gg', 'bien joué', 'chapeau', 'respect',
        'congrats', 'félicitation', 'good job', 'wp', 'well played',
        'nice', 'génial', 'parfait', 'excellent', 'superbe', 'magnifique',
        '👏', '🎉', '🎊', '👍', '💪', '🔥', '⭐', '🌟'
    ]
};

// ========================
// GUIDE RAPIDE
// ========================

/*
POUR COMMENCER :

1. Remplacez 'VOTRE_TOKEN_BOT_ICI' par le token de votre bot Discord
2. Remplacez 'ID_DU_CANAL_NOTIFICATIONS' par l'ID du canal de notifications
3. Remplacez 'VOTRE_USER_ID' par votre ID Discord
4. Remplacez tous les 'ID_ROLE_...' par les IDs réels de vos rôles Discord

COMMENT OBTENIR LES IDs :
- Activez le mode développeur dans Discord (Paramètres utilisateur > Avancé > Mode développeur)
- Clic droit sur un canal/rôle/utilisateur > "Copier l'ID"

COMMANDES DISPONIBLES APRÈS INSTALLATION :
- !achievements stats - Voir ses statistiques
- !help - Aide et lien GitHub
- !events add @user 5 - Ajouter 5 participations aux événements (admin)
- !achievements reset @user - Reset les stats d'un utilisateur (admin)

BON JEU ! 🎮
*/