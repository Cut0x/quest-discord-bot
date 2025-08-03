# 🤖 QuestBot Advanced - Modern Canvas Edition

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![Canvas](https://img.shields.io/badge/canvas-2.11.2-orange.svg)](https://www.npmjs.com/package/canvas)
[![License](https://img.shields.io/badge/license-MIT-red.svg)](LICENSE)

Un bot Discord moderne avec des images Canvas professionnelles, des effets glassmorphism et un système de progression avancé.

## ✨ Fonctionnalités Modernes

### 🎨 **Design System Professionnel**
- **Canvas Moderne** : Images générées avec HTML5 Canvas
- **Glassmorphism** : Effets de transparence et de verre modernes
- **Gradients Avancés** : Dégradés sophistiqués et harmonieux
- **Typographie Propre** : Design épuré sans émojis dans les images
- **Animations Subtiles** : Effets visuels et barres de progression

### 📊 **Système de Tracking Avancé**
- Messages automatiquement trackés
- Temps en salon vocal avec précision
- Réactions données et reçues
- Activité caméra et stream
- Système de félicitations intelligent
- Boosts serveur avec récompenses

### 🏆 **Système d'Achievements Complet**
- 50+ exploits disponibles
- 6 catégories différentes
- Système de rareté (Common à Legendary)
- Cartes d'achievements visuelles
- Progression en temps réel

### 🖼️ **Images Canvas Générées**
1. **Cartes de Profil** : Statistiques visuelles avec grilles modernes
2. **Achievements Cards** : Notifications élégantes avec effets
3. **Leaderboards** : Classements visuels professionnels
4. **Progress Bars** : Barres animées avec effets de lueur

## 🚀 Installation Rapide

### Prérequis
- Node.js 16+ 
- NPM ou Yarn
- Canvas dependencies (voir ci-dessous)

### 1. Installation des dépendances Canvas

#### **Ubuntu/Debian**
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### **CentOS/RHEL/Amazon Linux**
```bash
sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

#### **macOS**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### **Windows**
Utilisez [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) :
```bash
npm install --global windows-build-tools
```

### 2. Installation du bot

```bash
# Clone le repository
git clone https://github.com/your-username/questbot-advanced-modern.git
cd questbot-advanced-modern

# Installation des dépendances
npm install

# Configuration
cp exemple.env .env
# Éditez .env avec vos informations

# Lancement
npm start
```

## ⚙️ Configuration

### Fichier `.env` requis

```env
# OBLIGATOIRE
DISCORD_TOKEN=your_bot_token_here

# CONFIGURATION DE BASE
PREFIX=!
NODE_ENV=production

# CANAUX IMPORTANTS
NOTIFICATION_CHANNEL_ID=your_notification_channel_id
LEVELUP_CHANNEL_ID=your_levelup_channel_id
ADMIN_LOG_CHANNEL_ID=your_admin_log_channel_id

# PERMISSIONS ET RÔLES
ADMIN_IDS=user_id_1,user_id_2
ADMIN_ROLE_ID=admin_role_id
MODERATOR_ROLE_ID=moderator_role_id

# NOTIFICATIONS
SEND_PRIVATE_NOTIFICATIONS=false
SEND_PUBLIC_NOTIFICATIONS=true

# DÉBOGAGE
DEBUG_MODE=false
```

### Structure des dossiers

```
questbot-advanced-modern/
├── assets/
│   └── fonts/          # Polices personnalisées (optionnel)
├── backups/            # Sauvegardes automatiques
├── commands/
│   ├── user/           # Commandes utilisateur
│   ├── admin/          # Commandes administrateur
│   └── utility/        # Utilitaires
├── events/             # Événements Discord
├── utils/
│   ├── canvas.js       # Système Canvas moderne
│   └── functions.js    # Fonctions utilitaires
├── config.js           # Configuration des achievements
├── index.js            # Bot principal
└── .env               # Variables d'environnement
```

## 🎮 Commandes Principales

### **Utilisateur**
- `!stats [user]` - Statistiques avec carte visuelle moderne
- `!profile [user]` - Profil complet avec design glassmorphism  
- `!leaderboard [category]` - Classements visuels interactifs
- `!achievements [category]` - Système d'exploits complet
- `!help` - Aide interactive avec menus modernes

### **Administrateur**
- `!admin stats` - Statistiques du serveur
- `!admin backup` - Sauvegarde manuelle
- `!admin reload [command]` - Rechargement de commandes

### **Utilitaires**
- `!ping` - Latence avec indicateurs visuels
- `!server` - Informations serveur détaillées
- `!user [user]` - Informations utilisateur

## 🎨 Système Canvas Moderne

### Caractéristiques du Design
- **Palette de couleurs** : `#667eea`, `#764ba2`, `#f093fb`
- **Effets glassmorphism** : Transparence et flou d'arrière-plan
- **Gradients radial et linéaire** : Effets de profondeur
- **Typographie moderne** : Inter, Roboto, Arial
- **Ombres et lueurs** : Effets de profondeur subtils

### Exemples d'images générées

#### Carte de Profil Moderne
```javascript
// Exemple d'utilisation
const profileCard = await bot.createModernProfileCard(
    userId, 
    guildId, 
    user, 
    member
);
```

#### Achievement Card avec Glassmorphism
```javascript
const achievementCard = await bot.createModernAchievementCard(
    user, 
    achievement, 
    category, 
    leveledUp, 
    newLevel
);
```

## 🏆 Système d'Achievements

### Catégories disponibles
- **Messages** (6 exploits) - Du débutant au légendaire
- **Voice** (6 exploits) - Activité vocale
- **Reactions** (6 exploits) - Interactions sociales
- **Camera** (3 exploits) - Utilisation caméra
- **Stream** (3 exploits) - Partage d'écran
- **Boosts** (1 exploit) - Support serveur
- **Congratulations** (6 exploits) - Esprit communautaire

### Système de rareté
- 🔵 **Common** - Exploits de base
- 🟢 **Uncommon** - Activité régulière
- 🔵 **Rare** - Engagement significatif
- 🟣 **Epic** - Accomplissements majeurs
- 🟡 **Legendary** - Maîtrise absolue
- 🔴 **Mythic** - Exploits uniques

## 🔧 Développement

### Architecture moderne
```javascript
// Structure modulaire
class ModernQuestBot {
    constructor() {
        this.functions = new ModernBotFunctions(config);
        this.canvas = new ModernCanvasUtils(config);
    }
}
```

### Ajout d'exploits personnalisés
```javascript
// Dans config.js
achievements: {
    custom_category: [
        {
            id: 'my_achievement',
            name: 'Mon Exploit',
            description: 'Description de l\'exploit',
            requirement: 100,
            xp: 500,
            rarity: 'epic'
        }
    ]
}
```

### API Canvas personnalisée
```javascript
// Utilisation du système Canvas
const canvas = new ModernCanvasUtils(config);
const image = await canvas.createModernProfileCard(user, userData, member);
```

## 📊 Monitoring & Analytics

### Statistiques trackées
- Messages traités en temps réel
- Images Canvas générées
- Exploits débloqués
- Commandes exécutées
- Temps de fonctionnement

### Logs structurés
```javascript
// Exemple de log
console.log(`📊 Stats Update - Uptime: 120m, Commands: 450, Canvas: 89`);
```

## 🛡️ Sécurité & Performance

### Fonctionnalités de sécurité
- Validation des données utilisateur
- Protection contre le spam (cooldowns)
- Gestion d'erreurs robuste
- Sauvegardes automatiques
- Nettoyage de cache intelligent

### Optimisations
- Cache en mémoire pour les données fréquentes
- Génération Canvas asynchrone
- Lazy loading des ressources
- Compression des images

## 📝 Changelog

### v3.0.0 - Modern Canvas Edition
- ✨ Nouveau système Canvas avec glassmorphism
- 🎨 Design moderne sans émojis dans les images
- 🚀 Optimisations de performance
- 🏆 Système d'achievements étendu
- 📊 Statistiques visuelles avancées
- 🔧 Architecture refactorisée

## 🤝 Contributing

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎯 Support

- **Documentation** : [Wiki GitHub](https://quest-discord-bot.vercel.app)
- **Issues** : [GitHub Issues](https://github.com/Cut0x/quest-discord-bot/issues)
- **Discord** : [Serveur de support](https://discord.gg/your-server)

---

<div align="center">

**QuestBot Advanced Modern** - Créé avec ❤️ pour la communauté Discord

[Website](https://quest-discord-bot.vercel.app) • [Documentation](https://quest-discord-bot.vercel.app/docs/) • [Discord](https://discord.gg/your-server)

</div>