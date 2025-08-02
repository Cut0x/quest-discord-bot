# .gitignore - Fichiers à ignorer par Git
# ====================================
# FICHIERS SENSIBLES
# ====================================
.env
.env.local
.env.production
.env.development
config-private.js
secrets/

# ====================================
# BASE DE DONNÉES ET SAUVEGARDES
# ====================================
database.json
backups/
*.db
*.sqlite
*.sql

# ====================================
# LOGS ET TEMPORAIRES
# ====================================
logs/
*.log
temp/
cache/
.cache/
*.tmp
*.temp

# ====================================
# DÉPENDANCES NODE.JS
# ====================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# ====================================
# ENVIRONNEMENTS DE DÉVELOPPEMENT
# ====================================
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
.DS_Store?
._*
Thumbs.db
ehthumbs.db

# ====================================
# BUILD ET DISTRIBUTION
# ====================================
build/
dist/
coverage/
.nyc_output/

# ====================================
# SYSTÈME
# ====================================
*.pid
*.seed
*.pid.lock
.npm
.eslintcache
.node_repl_history
.npm-debug.log

# ====================================
# TESTS
# ====================================
.coverage/
coverage.lcov
test-results/

# ====================================
# DOCUMENTATION GÉNÉRÉE
# ====================================
docs/generated/
api-docs/

# ====================================
# FICHIERS SPÉCIFIQUES AU PROJET
# ====================================
assets/temp/
uploads/
downloads/
exports/

---

# LICENSE - Licence MIT
MIT License

Copyright (c) 2024 QuestBot Advanced Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# CHANGELOG.md - Journal des modifications
# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v1.0.0.html).

## [1.0.0] - 2024-12-XX

### 🎉 Ajouté
- **Système Canvas avancé** pour la génération d'images
- **50+ exploits configurables** avec système de rareté
- **Système d'expérience et de niveaux** complet
- **Panel d'administration** avec interface interactive
- **Sauvegarde automatique** avec rotation des backups
- **Scripts d'installation et maintenance** automatisés
- **Support des fichiers .env** pour la sécurité
- **Tracking vocal avancé** (caméra, stream, temps)
- **Système de félicitations** avec détection intelligente
- **Classements visuels** avec images générées
- **Configuration modulaire** et entièrement personnalisable

### 🔧 Amélioré
- **Performance** - Optimisation des requêtes de base de données
- **Sécurité** - Séparation des données sensibles et publiques
- **Interface** - Boutons interactifs et menus de sélection
- **Documentation** - Guide complet d'installation et configuration
- **Logs** - Système de logging avancé avec niveaux configurables

### 🎨 Design
- **Images de profil** avec effets visuels avancés
- **Cartes d'exploits** avec thèmes de rareté
- **Barres de progression** animées et interactives
- **Effets visuels** (glow, particules, gradients)

### 🛠️ Technique
- **Architecture modulaire** avec séparation des responsabilités
- **Gestion d'erreurs** robuste avec fallbacks
- **Cache intelligent** pour optimiser les performances
- **Scripts utilitaires** pour la maintenance

## [1.0.0] - Version initiale
- Système de base avec tracking simple
- Commandes essentielles
- Base de données JSON basique

---

# CONTRIBUTING.md - Guide de contribution
# Guide de Contribution

Merci de votre intérêt pour contribuer à QuestBot Advanced ! 🎉

## 📋 Table des matières
- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de développement](#configuration-de-développement)
- [Standards de code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Signaler des bugs](#signaler-des-bugs)
- [Demander des fonctionnalités](#demander-des-fonctionnalités)

## 📜 Code de conduite

Ce projet adhère au code de conduite des contributeurs. En participant, vous acceptez de respecter ce code.

## 🤝 Comment contribuer

### Types de contributions acceptées
- 🐛 **Corrections de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Améliorations de documentation**
- 🎨 **Améliorations d'interface**
- ⚡ **Optimisations de performance**
- 🧪 **Tests**

### Avant de commencer
1. Vérifiez les issues existantes pour éviter les doublons
2. Ouvrez une issue pour discuter des changements majeurs
3. Forkez le projet et créez une branche pour votre contribution

## 🔧 Configuration de développement

### Prérequis
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git
```

### Installation
```bash
# 1. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/questbot-advanced.git
cd questbot-advanced

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp example.env .env
# Éditer .env avec vos valeurs de test

# 4. Lancer en mode développement
npm run dev
```

### Structure du projet
```
questbot-advanced/
├── commands/           # Commandes organisées par catégorie
├── events/            # Gestionnaires d'événements Discord
├── utils/             # Utilitaires (Canvas, etc.)
├── scripts/           # Scripts de maintenance
├── assets/            # Ressources (polices, images)
├── config.js          # Configuration du système
└── index.js           # Point d'entrée principal
```

## 📝 Standards de code

### Style de code
- **Indentation**: 4 espaces
- **Guillemets**: Simples pour les chaînes
- **Semicolons**: Toujours
- **Nommage**: camelCase pour les variables/fonctions, PascalCase pour les classes

### Exemples
```javascript
// ✅ Bon
const userName = 'John';
const userData = getUserData(userId, guildId);

function calculateExperience(level) {
    return (level - 1) * 1000;
}

// ❌ Mauvais
const user_name = "John"
const userData=getUserData(userId,guildId)

function calculate_experience(level){
return(level-1)*1000
}
```

### Commentaires
```javascript
// =================== SECTION PRINCIPALE ===================

/**
 * Calcule l'expérience nécessaire pour un niveau donné
 * @param {number} level - Le niveau cible
 * @returns {number} L'expérience requise
 */
function calculateRequiredXP(level) {
    // Formule: (niveau - 1) × 1000
    return (level - 1) * 1000;
}

// TODO: Optimiser cette fonction pour les niveaux élevés
// FIXME: Gérer le cas où level < 1
```

### Gestion d'erreurs
```javascript
// ✅ Toujours gérer les erreurs
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    console.error('Erreur dans riskyOperation:', error);
    // Fallback approprié
    return defaultValue;
}

// ✅ Validation des paramètres
function processUser(userId, guildId) {
    if (!userId || !guildId) {
        throw new Error('userId et guildId sont requis');
    }
    // ... traitement
}
```

## 🔄 Processus de Pull Request

### 1. Préparation
```bash
# Créer une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# Ou pour un bugfix
git checkout -b fix/description-du-bug
```

### 2. Développement
- Écrivez du code propre et documenté
- Ajoutez des tests si applicable
- Mettez à jour la documentation si nécessaire

### 3. Tests
```bash
# Vérifier que le bot démarre
npm start

# Tester les nouvelles fonctionnalités
# Tester les commandes existantes
```

### 4. Commit
```bash
# Messages de commit clairs et descriptifs
git commit -m "feat: ajouter commande de profil avancé

- Génération d'images Canvas pour les profils
- Affichage des statistiques visuelles
- Support des effets de rareté
- Tests ajoutés pour les nouvelles fonctions"
```

### 5. Push et PR
```bash
git push origin feature/nom-de-la-fonctionnalite
```

Puis créez une Pull Request avec:
- **Titre clair** décrivant le changement
- **Description détaillée** des modifications
- **Captures d'écran** si changements visuels
- **Tests effectués** et résultats

### Template de PR
```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Amélioration de performance
- [ ] Documentation

## Tests
- [ ] Tests manuels effectués
- [ ] Bot démarre sans erreur
- [ ] Commandes existantes fonctionnent
- [ ] Nouvelles fonctionnalités testées

## Screenshots
(Si applicable)

## Checklist
- [ ] Code suit les standards du projet
- [ ] Auto-review effectuée
- [ ] Documentation mise à jour
- [ ] Aucun fichier sensible commité
```

## 🐛 Signaler des bugs

### Informations à inclure
1. **Description claire** du problème
2. **Étapes pour reproduire** le bug
3. **Comportement attendu** vs observé
4. **Environnement**:
   - Version Node.js
   - Version du bot
   - OS
5. **Logs d'erreur** complets
6. **Captures d'écran** si pertinentes

### Template d'issue de bug
```markdown
**Description du bug**
Description claire du problème.

**Reproduction**
1. Exécuter la commande '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer.

**Environnement**
- OS: [ex: Windows 10]
- Node.js: [ex: 18.19.0]
- Version bot: [ex: 2.0.0]

**Logs**
```
Coller les logs d'erreur ici
```

**Screenshots**
(Si applicable)
```

## ✨ Demander des fonctionnalités

### Informations à inclure
1. **Problème résolu** par la fonctionnalité
2. **Solution proposée** (si vous en avez une)
3. **Alternatives considérées**
4. **Contexte supplémentaire**

### Template de demande de fonctionnalité
```markdown
**Problème à résoudre**
Description claire du problème que cette fonctionnalité résoudrait.

**Solution proposée**
Description de la solution souhaitée.

**Alternatives**
Autres solutions considérées.

**Contexte**
Informations supplémentaires utiles.
```

## 🎯 Bonnes pratiques

### Performance
- Évitez les opérations synchrones bloquantes
- Utilisez le cache quand approprié
- Optimisez les requêtes de base de données

### Sécurité
- Ne jamais commiter de tokens ou clés
- Validez toujours les entrées utilisateur
- Utilisez les permissions Discord appropriées

### UX
- Messages d'erreur clairs et utiles
- Feedbacks visuels pour les actions longues
- Interface intuitive et cohérente

## 🏷️ Labels

Nous utilisons ces labels pour organiser les issues:
- `bug` - Problème confirmé
- `enhancement` - Nouvelle fonctionnalité
- `documentation` - Amélioration docs
- `good first issue` - Bon pour débutants
- `help wanted` - Aide externe bienvenue
- `priority: high` - Priorité élevée
- `status: in progress` - En cours de développement

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible !

Pour toute question, n'hésitez pas à:
- Ouvrir une issue
- Rejoindre notre Discord
- Contacter les mainteneurs

---

# SECURITY.md - Politique de sécurité
# Politique de Sécurité

## 🛡️ Versions supportées

| Version | Support de sécurité |
| ------- | ------------------ |
| 2.0.x   | ✅ Supportée       |
| 1.x.x   | ❌ Non supportée   |

## 🚨 Signaler une vulnérabilité

### Processus de signalement
1. **Ne pas** créer d'issue publique pour les vulnérabilités
2. Envoyer un email à: `security@votre-domaine.com`
3. Inclure une description détaillée du problème
4. Fournir des étapes pour reproduire si possible

### Informations à inclure
- Type de vulnérabilité
- Impact potentiel
- Versions affectées
- Preuve de concept (si applicable)
- Suggestions de correction

### Réponse attendue
- **Accusé de réception**: 48 heures
- **Évaluation initiale**: 7 jours
- **Résolution**: 30 jours pour les vulnérabilités critiques

## 🔒 Bonnes pratiques de sécurité

### Pour les utilisateurs
- Gardez votre token bot secret
- Utilisez des permissions minimales
- Mettez à jour régulièrement
- Surveillez les logs d'accès

### Pour les développeurs
- Ne jamais commiter de secrets
- Validez toutes les entrées
- Utilisez HTTPS pour les APIs
- Implémentez la limitation de taux

## 📋 Checklist de sécurité

- [ ] Token bot stocké en sécurité (.env)
- [ ] Permissions Discord minimales
- [ ] Validation des entrées utilisateur
- [ ] Gestion appropriée des erreurs
- [ ] Logs de sécurité activés
- [ ] Accès administrateur restreint
- [ ] Sauvegardes chiffrées
