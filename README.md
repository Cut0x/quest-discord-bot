# 🎮 QuestBot Advanced

**Bot Discord avancé pour le suivi d'exploits et statistiques communautaires avec interface graphique Canvas.**

[![Discord.js](https://img.shields.io/badge/Discord.js-v14.14.1-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Canvas](https://img.shields.io/badge/Canvas-2.11.2-orange.svg)](https://www.npmjs.com/package/canvas)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Fonctionnalités

### 🏆 Système d'exploits complet
- **Plus de 40 exploits** répartis en 8 catégories
- **Progression en temps réel** avec notifications automatiques
- **Raretés multiples** : Commun, Peu commun, Rare, Épique, Légendaire
- **Système de niveaux** basé sur l'expérience (XP)

### 📊 Tracking automatique
- **Messages** - Comptage automatique des messages envoyés
- **Vocal** - Suivi du temps passé en salon vocal
- **Caméra & Stream** - Temps avec caméra/partage d'écran activé
- **Réactions** - Réactions données et reçues
- **Boosts serveur** - Récompenses pour les boosters
- **Félicitations** - Détection automatique des encouragements

### 🎨 Interface graphique
- **Images générées** avec Canvas pour les profils et exploits
- **Cartes personnalisées** pour chaque exploit débloqué
- **Leaderboards visuels** avec classements interactifs
- **Profils utilisateur** avec statistiques détaillées

### 🔧 Administration avancée
- **Panel d'administration** complet pour les modérateurs
- **Gestion des données** utilisateur avec export/import
- **Analytics serveur** avec statistiques détaillées
- **Sauvegarde automatique** avec historique

## 📋 Prérequis

### 🖥️ Environnement système
- **Node.js** v18.0.0 ou supérieur
- **NPM** ou **Yarn** pour la gestion des packages
- **Git** pour cloner le repository

### 🎨 Dépendances Canvas (obligatoire)
Canvas nécessite des outils de compilation selon votre OS :

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### CentOS/RHEL/Fedora
```bash
sudo yum groupinstall "Development Tools"
sudo yum install cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

#### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Windows
```bash
npm install --global windows-build-tools
```

### 🤖 Bot Discord
1. Créez une application sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez un bot et récupérez le **token**
3. Activez les **Intents** suivants :
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
   - `PRESENCE INTENT`

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/Cut0x/quest-discord-bot.git
cd quest-discord-bot
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
```bash
# Copier le fichier de configuration
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

### 4. Configuration du fichier .env

**Variables obligatoires :**
```env
DISCORD_TOKEN=your_bot_token_here
```

**Variables recommandées :**
```env
PREFIX=!
NODE_ENV=production
NOTIFICATION_CHANNEL_ID=123456789012345678
ADMIN_IDS=123456789012345678,987654321098765432
```

**Variables optionnelles :**
```env
LEVELUP_CHANNEL_ID=123456789012345678
WELCOME_CHANNEL_ID=123456789012345678
ADMIN_LOG_CHANNEL_ID=123456789012345678
STAFF_IDS=123456789012345678
ADMIN_ROLE_ID=123456789012345678
DEBUG_MODE=false
```

### 5. Obtenir les IDs Discord

1. **Activez le Mode Développeur** dans Discord :
   - Paramètres utilisateur → Avancé → Mode développeur ✅

2. **Récupérez les IDs** :
   - **Clic droit** sur un canal → **Copier l'ID**
   - **Clic droit** sur un utilisateur → **Copier l'ID**
   - **Clic droit** sur un rôle → **Copier l'ID**

### 6. Démarrer le bot
```bash
# Mode production
npm start

# Mode développement (avec rechargement auto)
npm run dev
```

## 📁 Structure du projet

```
quest-discord-bot/
├── 📄 index.js                 # Fichier principal du bot
├── 📄 config.js               # Configuration des exploits et paramètres
├── 📄 package.json            # Dépendances et scripts
├── 📄 .env.example            # Template de configuration
├── 📄 README.md               # Documentation (ce fichier)
│
├── 📁 utils/
│   └── 📄 functions.js        # Fonctions utilitaires centralisées
│
├── 📁 commands/
│   ├── 📁 user/               # Commandes utilisateur
│   │   ├── 📄 stats.js        # Statistiques utilisateur
│   │   ├── 📄 profile.js      # Profil complet
│   │   ├── 📄 achievements.js # Exploits et progression
│   │   ├── 📄 leaderboard.js  # Classements
│   │   └── 📄 help.js         # Aide et navigation
│   │
│   ├── 📁 admin/              # Commandes administrateur
│   │   ├── 📄 admin.js        # Panel d'administration
│   │   ├── 📄 achievements-manage.js # Gestion des exploits
│   │   └── 📄 data-manage.js  # Gestion des données
│   │
│   └── 📁 utility/            # Commandes utilitaires
│       ├── 📄 ping.js         # Test de latence
│       ├── 📄 info.js         # Informations bot
│       ├── 📄 server.js       # Informations serveur
│       ├── 📄 user.js         # Informations utilisateur
│       └── 📄 prefix.js       # Affichage du préfixe
│
├── 📁 events/                 # Événements Discord
│   ├── 📄 ready.js           # Bot prêt
│   ├── 📄 messageCreate.js   # Nouveau message
│   ├── 📄 messageReactionAdd.js # Réaction ajoutée
│   ├── 📄 voiceStateUpdate.js # Changement vocal
│   ├── 📄 guildMemberUpdate.js # Mise à jour membre
│   └── 📄 interactionCreate.js # Interactions (boutons, menus)
│
├── 📁 assets/                 # Ressources
│   ├── 📁 fonts/             # Polices personnalisées (.ttf, .otf)
│   └── 📁 images/            # Images statiques
│
├── 📁 backups/               # Sauvegardes automatiques
└── 📁 temp/                  # Fichiers temporaires
```

## 🎯 Commandes disponibles

### 👤 Commandes utilisateur

| Commande | Description | Aliases | Usage |
|----------|-------------|---------|--------|
| `!stats` | Affiche vos statistiques | `statistiques`, `stat` | `!stats [@user]` |
| `!profile` | Profil complet avec image | `profil`, `me`, `p` | `!profile [@user]` |
| `!achievements` | Liste des exploits | `exploits`, `ach` | `!achievements [catégorie]` |
| `!leaderboard` | Classements serveur | `top`, `lb`, `ranking` | `!leaderboard [catégorie] [limite]` |
| `!help` | Aide interactive | `aide`, `commands` | `!help [commande]` |

### 🛡️ Commandes administrateur

| Commande | Description | Usage |
|----------|-------------|--------|
| `!admin` | Panel d'administration | `!admin [action]` |
| `!admin stats` | Statistiques du bot | `!admin stats` |
| `!admin reload` | Recharger une commande | `!admin reload [commande]` |
| `!admin backup` | Sauvegarde manuelle | `!admin backup` |
| `!admin reset` | Reset utilisateur | `!admin reset @user` |
| `!achievements-manage` | Gestion des exploits | `!achievements-manage [give/remove] @user [exploit]` |
| `!data-manage` | Gestion des données | `!data-manage [view/edit/export] @user` |

### 🔧 Commandes utilitaires

| Commande | Description | Aliases | Usage |
|----------|-------------|---------|--------|
| `!ping` | Test de latence | `latency` | `!ping` |
| `!info` | Informations bot | `botinfo`, `about` | `!info` |
| `!server` | Informations serveur | `serveur`, `guild` | `!server` |
| `!user` | Informations utilisateur | `userinfo`, `membre` | `!user [@user]` |
| `!prefix` | Affiche le préfixe | `préfixe` | `!prefix` |

## 🏆 Système d'exploits

### 📊 Catégories disponibles

#### 💬 Messages
- **PREMIERS PAS** - Envoyez votre premier message (1 message)
- **BAVARD-E** - Participez aux conversations (5 messages)
- **ÉLOQUENT-E** - Communiquez activement (100 messages)
- **COMMUNICATEUR-RICE** - Pilier de la communication (500 messages)
- **ORATEUR-RICE SUPRÊME** - Maître de la communication (1000 messages)

#### ❤️ Réactions
- **PREMIER LIKE** - Donnez votre première réaction
- **AIMABLE** - Recevez de l'amour (10 réactions reçues)
- **RÉACTIF-VE** - Exprimez vos émotions (100 réactions données)
- **STAR DES RÉACTIONS** - Célébrité des réactions (500 réactions reçues)

#### 🎙️ Vocal
- **PREMIER MOT** - Rejoignez un salon vocal (1 minute)
- **LOCUTEUR-RICE** - Temps de qualité en vocal (60 minutes)
- **ORATEUR-RICE CONFIRMÉ-E** - Maîtrise vocale (300 minutes)
- **MAÎTRE-ESSE DU MICRO** - Légende vocale (1200 minutes)

#### 📹 Caméra & Stream
- **PREMIERS PAS VIDÉO** - Activez votre caméra
- **CAMERAMAN-WOMAN** - Sessions caméra régulières
- **STAR DU LIVE** - Vedette des vidéos
- **PREMIER STREAM** - Premier partage d'écran
- **MAÎTRE DU STREAM** - Légende du streaming

#### 🎉 Événements & Social
- **CURIEUX-SE** - Premier événement
- **HABITUÉ-E DES EVENTS** - Participation régulière
- **ENCOURAGEUR-SE** - Félicitez les autres
- **APPRÉCIÉ-E** - Recevez des félicitations

#### 🚀 Boosts
- **BIENFAITEUR-RICE** - Boostez le serveur
- **MÉCÈNE** - Grand supporteur

### 🎨 Raretés des exploits

| Rareté | Couleur | Emoji | Description |
|--------|---------|-------|-------------|
| **Commun** | Blanc | ⚪ | Exploits de base accessibles à tous |
| **Peu commun** | Vert | 🟢 | Activité régulière requise |
| **Rare** | Bleu | 🔵 | Engagement important nécessaire |
| **Épique** | Violet | 🟣 | Accomplissements remarquables |
| **Légendaire** | Orange | 🟠 | Statut de légende communautaire |

## 🎨 Personnalisation

### 🎨 Modifier les couleurs
Dans `config.js`, section `colors` :
```javascript
colors: {
    primary: '#FFD700',      // Or principal
    secondary: '#FFA500',    // Orange secondaire
    success: '#00FF7F',      // Vert succès
    error: '#FF4444',        // Rouge erreur
    // ...
}
```

### 🏆 Ajouter des exploits
Dans `config.js`, section `achievements` :
```javascript
messages: [
    {
        id: 'nouveau_exploit',
        name: 'NOUVEAU EXPLOIT',
        description: 'Description de l\'exploit',
        requirement: 100,
        xp: 500,
        emoji: '🆕',
        rarity: 'rare'
    }
]
```

### 🔤 Polices personnalisées
1. Ajoutez vos fichiers `.ttf` ou `.otf` dans `assets/fonts/`
2. Redémarrez le bot
3. Les polices seront chargées automatiquement

### 🎯 Mots-clés de félicitations
Dans `config.js`, section `congratulationKeywords` :
```javascript
congratulationKeywords: [
    'bravo', 'félicitations', 'gg', 'bien joué',
    'respect', 'génial', 'parfait', 'excellent'
    // Ajoutez vos propres mots-clés
]
```

## 🔧 Scripts NPM

```bash
# Démarrer le bot
npm start

# Mode développement (nodemon)
npm run dev

# Vérification du code
npm run lint

# Formatage du code
npm run format

# Tests (si configurés)
npm test
```

## 📊 Monitoring et Analytics

### 🔍 Logs automatiques
- Connexion/déconnexion du bot
- Exploits débloqués en temps réel
- Erreurs de commandes avec stack trace
- Statistiques d'utilisation

### 💾 Sauvegardes automatiques
- **Fréquence** : Toutes les 10 minutes
- **Rétention** : 10 sauvegardes maximum
- **Format** : JSON avec horodatage
- **Localisation** : Dossier `backups/`

### 📈 Analytics serveur
- Statistiques globales des utilisateurs
- Tendances d'activité
- Top performers par catégorie
- Taux de complétion des exploits

## 🐛 Dépannage

### ❌ Erreurs communes

**Canvas ne fonctionne pas**
```bash
# Réinstaller Canvas
npm uninstall canvas
npm install canvas

# Vérifier les dépendances système
# Voir section "Prérequis" ci-dessus
```

**Token invalide**
```
❌ An invalid token was provided
```
- Vérifiez votre `DISCORD_TOKEN` dans le fichier `.env`
- Régénérez le token sur Discord Developer Portal

**Permissions insuffisantes**
```
❌ Missing Permissions
```
- Vérifiez les permissions du bot sur votre serveur
- Assurez-vous que les IDs dans `.env` sont corrects

**Base de données corrompue**
```bash
# Restaurer depuis une sauvegarde
cp backups/database_[timestamp].json database.json
```

### 🔍 Mode Debug
Activez le debug dans `.env` :
```env
DEBUG_MODE=true
```

Logs détaillés et stack traces complets seront affichés.

### 📝 Support et logs
- **Logs console** : Tous les événements importants
- **Canal admin** : Erreurs automatiquement loggées (si configuré)
- **Fichiers de sauvegarde** : Historique complet des données

## 🚀 Déploiement

### 🐳 Docker (optionnel)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

### ☁️ Hébergement recommandé
- **VPS** : 1GB RAM minimum, 2GB recommandé
- **Heroku** : Dyno Standard avec Canvas buildpack
- **Railway** : Déploiement automatique via Git
- **DigitalOcean** : Droplet Ubuntu 22.04

### 🔒 Variables d'environnement production
```env
NODE_ENV=production
DEBUG_MODE=false
# Autres variables selon votre configuration
```

## 🤝 Contribution

1. **Fork** le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### 📏 Standards de code
- **ESLint** pour la cohérence du code
- **Prettier** pour le formatage
- **JSDoc** pour la documentation des fonctions
- **Conventional Commits** pour les messages de commit

## 📜 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [**Discord.js**](https://discord.js.org/) - Bibliothèque Discord robuste
- [**Canvas**](https://www.npmjs.com/package/canvas) - Génération d'images dynamiques
- [**Node.js**](https://nodejs.org/) - Environnement d'exécution
- **Communauté Discord** - Tests et retours utilisateurs

## 📞 Support

- **Issues GitHub** : [Signaler un bug](https://github.com/Cut0x/quest-discord-bot/issues)
- **Discussions** : [Forum communautaire](https://github.com/Cut0x/quest-discord-bot/discussions)
- **Discord Support** : [Serveur de support](https://discord.gg/aTX6FP37pK)
- **Documentation** : [Wiki complet](https://github.com/Cut0x/quest-discord-bot/wiki)

## 🔮 Roadmap

### 🎯 Prochaines fonctionnalités
- [ ] **Slash Commands** - Migration vers les commandes modernes
- [ ] **Dashboard Web** - Interface web pour la configuration
- [ ] **API REST** - Endpoints pour intégrations tierces
- [ ] **Système de quêtes** - Défis temporaires et événements
- [ ] **Récompenses personnalisées** - Rôles automatiques et privilèges
- [ ] **Multi-serveurs** - Synchronisation inter-serveurs
- [ ] **Intelligence artificielle** - Détection automatique d'activités

### 🔧 Améliorations techniques
- [ ] **Base de données** - Migration vers PostgreSQL/MongoDB
- [ ] **Cache Redis** - Performance améliorée
- [ ] **Monitoring** - Prometheus + Grafana
- [ ] **Tests automatisés** - Jest + Coverage
- [ ] **CI/CD** - GitHub Actions
- [ ] **Docker Compose** - Déploiement simplifié

---

**QuestBot Advanced v2.0** - Transformez votre serveur Discord en une aventure interactive ! 🎮

*Développé avec ❤️ par la communauté Discord*