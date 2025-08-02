# 🎮 QuestBot Advanced - Système d'Exploits Discord

<div align="center">

![QuestBot Advanced](https://img.shields.io/badge/QuestBot-Advanced-gold?style=for-the-badge&logo=discord)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**Bot Discord de gamification avancé avec tracking d'exploits, génération d'images Canvas et système de niveaux**

[📖 Documentation](#-installation) • [🚀 Fonctionnalités](#-fonctionnalités) • [⚙️ Configuration](#️-configuration) • [🤝 Support](#-support)

</div>

---

## ✨ Fonctionnalités

### 🏆 Système d'Exploits Complet
- **50+ exploits configurables** répartis en 8 catégories
- **Système de rareté** (Commun → Légendaire)
- **Attribution automatique de rôles** Discord
- **Notifications personnalisées** avec images générées

### 📊 Tracking Avancé
- **Messages envoyés** - Comptage en temps réel
- **Temps vocal** - Tracking précis des minutes en salon vocal
- **Réactions** - Données et reçues avec détection intelligente
- **Félicitations** - Reconnaissance automatique des encouragements
- **Événements** - Participation aux activités communautaires
- **Caméra/Stream** - Sessions vidéo et partage d'écran
- **Boosts serveur** - Détection automatique des soutiens

### 🎨 Images Générées avec Canvas
- **Profils visuels** avec statistiques avancées
- **Cartes d'exploits** avec effets de rareté
- **Classements visuels** avec podiums animés
- **Barres de progression** interactives
- **Effets visuels** (glow, particules, gradients)

### 📈 Système de Niveaux & XP
- **Expérience dynamique** basée sur l'activité
- **Niveaux illimités** avec seuils configurables
- **Multiplicateurs de bonus** pour les événements spéciaux
- **Récompenses automatiques** en XP pour chaque action

### 🔧 Configuration Avancée
- **Fichier .env** pour les données sensibles
- **config.js** pour personnaliser le système
- **Messages personnalisables** avec variables dynamiques
- **Rôles et canaux** entièrement configurables

---

## 🚀 Installation

### 📋 Prérequis

```bash
# Versions requises
Node.js >= 18.0.0
npm >= 8.0.0

# Dépendances système pour Canvas
# Ubuntu/Debian:
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# macOS:
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Windows:
# Suivez la documentation officielle de node-canvas
```

### 📥 Installation du Bot

```bash
# 1. Cloner le repository
git clone https://github.com/Cut0x/quest-discord-bot.git
cd questbot-advanced

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp example.env .env
# Éditer .env avec vos valeurs

# 4. Configurer le système
# Éditer config.js selon vos besoins

# 5. Lancer le bot
npm start
```

### 🤖 Configuration du Bot Discord

1. **Créer une application** sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. **Créer un bot** et copier le token
3. **Configurer les permissions** requises :
   - ✅ Voir les salons
   - ✅ Envoyer des messages
   - ✅ Intégrer des liens
   - ✅ Joindre des fichiers
   - ✅ Lire l'historique des messages
   - ✅ Ajouter des réactions
   - ✅ Utiliser des émojis externes
   - ✅ Gérer les rôles
   - ✅ Se connecter au vocal
   - ✅ Parler

---

## ⚙️ Configuration

### 🔐 Variables d'Environnement (.env)

```env
# Bot Discord
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here

# Canaux
NOTIFICATION_CHANNEL_ID=channel_id_for_achievements
LEVELUP_CHANNEL_ID=channel_id_for_level_ups
WELCOME_CHANNEL_ID=channel_id_for_welcome
ADMIN_LOG_CHANNEL_ID=channel_id_for_admin_logs

# Permissions
ADMIN_IDS=user_id_1,user_id_2
STAFF_IDS=staff_id_1,staff_id_2
ADMIN_ROLE_ID=role_id_for_admins
MODERATOR_ROLE_ID=role_id_for_mods

# GitHub & Support
GITHUB_REPO_URL=https://github.com/your_username/questbot-advanced
SUPPORT_URL=https://discord.gg/your_support_server

# Configuration avancée
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=info
```

### 🎯 Configuration des Exploits (config.js)

```javascript
// Exemple d'exploit personnalisé
achievements: {
  messages: [
    {
      id: 'bavard_custom',
      name: 'BAVARD-E CONFIRMÉ-E',
      description: 'Envoyez 100 messages sur le serveur',
      requirement: 100,
      xp: 500,
      emoji: '💬',
      rarity: 'uncommon',
      roleId: 'ROLE_ID_HERE' // Optionnel
    }
  ]
}
```

### 🎨 Personnalisation des Couleurs

```javascript
colors: {
  primary: '#FFD700',      // Or principal
  secondary: '#FFA500',    // Orange secondaire
  success: '#00FF7F',      // Vert succès
  error: '#FF4444',        // Rouge erreur
  experience: '#9932CC'    // Violet expérience
}
```

---

## 🎮 Commandes

### 👤 Commandes Utilisateur

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!stats [utilisateur]` | Affiche les statistiques détaillées | `!stats @user` |
| `!profile [utilisateur]` | Profil complet avec image Canvas | `!profile` |
| `!achievements [catégorie]` | Liste des exploits disponibles | `!achievements messages` |
| `!leaderboard [catégorie]` | Classement des membres | `!leaderboard level` |
| `!help [commande]` | Aide générale ou spécifique | `!help stats` |

### 🛡️ Commandes Administrateur

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!admin [action]` | Panel d'administration | `!admin stats` |
| `!events add @user [nombre]` | Ajouter des participations | `!events add @user 5` |
| `!events bulk [nombre]` | Ajout en masse via réactions | `!events bulk 3` |
| `!admin reset @user` | Reset complet d'un utilisateur | `!admin reset @user` |
| `!admin backup` | Créer une sauvegarde | `!admin backup` |

### 🔧 Commandes Utilitaires

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!ping` | Latence du bot | `!ping` |
| `!info` | Informations détaillées du bot | `!info` |
| `!server` | Statistiques du serveur | `!server` |
| `!user [utilisateur]` | Informations Discord d'un membre | `!user @someone` |
| `!invite` | Lien d'invitation du bot | `!invite` |

---

## 📊 Système de Progression

### 🏆 Catégories d'Exploits

#### 💬 Messages
- **BAVARD-E** (5 messages) → 100 XP
- **ÉLOQUENT-E** (100 messages) → 300 XP
- **COMMUNICATEUR-RICE** (500 messages) → 800 XP
- **ORATEUR-RICE SUPRÊME** (1000 messages) → 1500 XP

#### ❤️ Réactions
- **PREMIER LIKE** (1 réaction donnée) → 25 XP
- **AIMABLE** (10 réactions reçues) → 150 XP
- **RÉACTIF-VE** (100 réactions données) → 400 XP
- **STAR DES RÉACTIONS** (500 réactions reçues) → 1000 XP

#### 🎙️ Temps Vocal
- **PREMIER MOT** (1 minute) → 50 XP
- **LOCUTEUR-RICE** (60 minutes) → 200 XP
- **ORATEUR-RICE CONFIRMÉ-E** (300 minutes) → 600 XP
- **MAÎTRE-ESSE DU MICRO** (1200 minutes) → 1500 XP

#### 🎭 Événements
- **CURIEUX-SE** (1 participation) → 100 XP
- **HABITUÉ-E DES EVENTS** (5 participations) → 300 XP
- **ACCRO AUX EVENTS** (20 participations) → 800 XP
- **MAÎTRE DES ÉVÉNEMENTS** (50 participations) → 2000 XP

### 📈 Système d'Expérience

#### Gains d'XP par Action
- **Message envoyé** → 5 XP
- **Réaction donnée** → 2 XP  
- **Réaction reçue** → 3 XP
- **Minute vocale** → 1 XP
- **Félicitation envoyée** → 10 XP
- **Félicitation reçue** → 15 XP
- **Boost serveur** → 500 XP
- **Exploit débloqué** → 100 XP

#### Calcul des Niveaux
```
Niveau 1: 0 XP
Niveau 2: 1,000 XP
Niveau 3: 2,000 XP
...
Niveau N: (N-1) × 1,000 XP
```

---

## 🎨 Galerie d'Images

### 📊 Profil Utilisateur
- **Avatar avec effet glow** et bordure dorée
- **Barres de progression animées** pour chaque statistique  
- **Graphiques visuels** des performances
- **Derniers exploits** avec badges de rareté

### 🏆 Cartes d'Exploits
- **Arrière-plans thématiques** selon la rareté
- **Effets de particules** dynamiques
- **Texte 3D** avec ombres
- **Timestamps décoratifs**

### 🥇 Classements
- **Podium pour le top 3** avec médailles
- **Liste détaillée** des autres positions
- **Statistiques visuelles** par catégorie

---

## 🗂️ Structure du Projet

```
questbot-advanced/
├── 📁 assets/                 # Ressources visuelles
│   ├── 📁 fonts/             # Polices personnalisées
│   └── 📁 images/            # Images de fond, logos
├── 📁 backups/               # Sauvegardes automatiques
├── 📁 commands/              # Commandes organisées
│   ├── 📁 admin/             # Commandes administrateur
│   ├── 📁 user/              # Commandes utilisateur
│   └── 📁 utility/           # Commandes utilitaires
├── 📁 events/                # Gestionnaires d'événements
├── 📁 scripts/               # Scripts utilitaires
├── 📁 temp/                  # Fichiers temporaires
├── 📁 utils/                 # Utilitaires (Canvas, etc.)
├── 📄 config.js              # Configuration système
├── 📄 database.json          # Base de données JSON
├── 📄 example.env            # Template variables d'environnement
├── 📄 index.js               # Point d'entrée principal
├── 📄 package.json           # Dépendances et scripts
└── 📄 README.md              # Documentation
```

---

## 🔧 Administration

### 💾 Sauvegarde Automatique
- **Intervalles configurables** (par défaut : 1 heure)
- **Rotation automatique** des sauvegardes
- **Compression** pour économiser l'espace
- **Sauvegarde manuelle** via commande admin

### 📊 Monitoring
- **Statistiques en temps réel** du bot
- **Logs détaillés** avec niveaux configurables
- **Alertes d'erreur** vers canal admin
- **Performance tracking** (RAM, CPU, latence)

### 🔄 Maintenance
- **Rechargement à chaud** des commandes
- **Nettoyage automatique** des fichiers temporaires
- **Optimisation de la base de données**
- **Scripts de maintenance** inclus

---

## 🚨 Dépannage

### ❌ Problèmes Courants

#### Le bot ne répond pas aux commandes
```bash
# Vérifier les permissions
# Vérifier le préfixe dans .env
# Consulter les logs pour les erreurs
```

#### Canvas ne génère pas d'images
```bash
# Installer les dépendances système
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev

# Vérifier la version de Node.js
node --version  # Doit être >= 18.0.0
```

#### Les rôles ne sont pas attribués
```bash
# Vérifier que le bot a la permission "Gérer les rôles"
# S'assurer que le rôle du bot est plus haut que les rôles à attribuer
# Vérifier les IDs des rôles dans .env
```

### 📝 Logs & Debug

```bash
# Activer le mode debug
DEBUG_MODE=true

# Changer le niveau de logs
LOG_LEVEL=debug

# Voir les logs en temps réel
tail -f logs/questbot.log
```

---

## 🤝 Support

### 💬 Canaux d'Aide
- **GitHub Issues** : [Signaler un bug](https://github.com/VOTRE_USERNAME/questbot-advanced/issues)
- **Discord Support** : [Rejoindre le serveur](https://discord.gg/VOTRE_SERVEUR)
- **Documentation** : [Wiki complet](https://github.com/VOTRE_USERNAME/questbot-advanced/wiki)

### 🐛 Signaler un Bug
1. Vérifiez que le bug n'a pas déjà été signalé
2. Fournissez les logs d'erreur complets
3. Décrivez les étapes pour reproduire
4. Mentionnez votre version de Node.js et OS

### 💡 Demander une Fonctionnalité
1. Ouvrez une issue avec le tag `enhancement`
2. Décrivez clairement la fonctionnalité souhaitée
3. Expliquez pourquoi elle serait utile
4. Proposez une implémentation si possible

---

## 🤝 Contribution

### 🔧 Développement Local

```bash
# Fork le projet
git clone https://github.com/VOTRE_USERNAME/questbot-advanced.git
cd questbot-advanced

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Installer en mode développement
npm install
npm run dev

# Tester vos modifications
npm test

# Commit et push
git commit -m "Ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### 📋 Guidelines
- **Code propre** avec commentaires explicatifs
- **Tests unitaires** pour les nouvelles fonctionnalités
- **Documentation** mise à jour
- **Respect des conventions** de nommage

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 QuestBot Advanced

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Remerciements

- **Discord.js** - Bibliothèque Discord pour Node.js
- **node-canvas** - Génération d'images sur serveur
- **Communauté Discord** - Tests et retours
- **Contributeurs** - Améliorations et corrections

---

## 📈 Statistiques du Projet

![GitHub Stars](https://img.shields.io/github/stars/VOTRE_USERNAME/questbot-advanced?style=social)
![GitHub Forks](https://img.shields.io/github/forks/VOTRE_USERNAME/questbot-advanced?style=social)
![GitHub Issues](https://img.shields.io/github/issues/VOTRE_USERNAME/questbot-advanced)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/VOTRE_USERNAME/questbot-advanced)

---

<div align="center">

**⭐ N'oubliez pas de mettre une étoile si ce projet vous plaît ! ⭐**

[🔝 Retour en haut](#-questbot-advanced---système-dexploits-discord)

*Créé avec ❤️ pour la communauté Discord*

</div>