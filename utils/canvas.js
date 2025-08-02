// utils/canvas.js - Utilitaires avancés pour Canvas
const { createCanvas, loadImage, registerFont } = require('canvas');
const config = require('../config.js');

class CanvasUtils {
    constructor() {
        this.defaultFont = 'Arial';
        this.loadCustomFonts();
    }

    loadCustomFonts() {
        try {
            const fs = require('fs');
            const path = require('path');
            const fontsPath = path.join(__dirname, '..', 'assets', 'fonts');
            
            if (fs.existsSync(fontsPath)) {
                const fontFiles = fs.readdirSync(fontsPath).filter(file => 
                    file.endsWith('.ttf') || file.endsWith('.otf')
                );
                
                fontFiles.forEach(font => {
                    const fontPath = path.join(fontsPath, font);
                    const fontName = font.split('.')[0];
                    registerFont(fontPath, { family: fontName });
                    console.log(`✅ Police chargée: ${fontName}`);
                });
            }
        } catch (error) {
            console.log('⚠️ Erreur lors du chargement des polices:', error.message);
        }
    }

    // =================== CRÉATION D'IMAGES AVANCÉES ===================

    async createAdvancedProfile(user, userData, member) {
        const canvas = createCanvas(1200, 800);
        const ctx = canvas.getContext('2d');

        // Arrière-plan avec gradient complexe
        await this.drawAdvancedBackground(ctx, 1200, 800);

        // Avatar avec effet glow
        await this.drawGlowingAvatar(ctx, user, 100, 100, 80);

        // Informations utilisateur
        this.drawUserInfo(ctx, user, userData, member, 220, 80);

        // Barres de progression animées
        this.drawProgressBars(ctx, userData, 50, 300);

        // Statistiques en graphique
        this.drawStatsGraph(ctx, userData, 600, 300);

        // Derniers exploits
        this.drawRecentAchievements(ctx, userData, 50, 600);

        // Bordure décorative
        this.drawDecorativeBorder(ctx, 1200, 800);

        return canvas.toBuffer();
    }

    async createAchievementBanner(user, achievement, category) {
        const canvas = createCanvas(1000, 400);
        const ctx = canvas.getContext('2d');

        // Arrière-plan thématique basé sur la rareté
        const rarity = config.rarities[achievement.rarity] || config.rarities.common;
        await this.drawRarityBackground(ctx, 1000, 400, rarity);

        // Effet de particules
        this.drawParticleEffect(ctx, 1000, 400, rarity.color);

        // Avatar utilisateur avec cadre doré
        await this.drawFramedAvatar(ctx, user, 100, 150, 100, rarity.color);

        // Texte principal avec effet 3D
        this.draw3DText(ctx, achievement.name, 250, 180, '48px bold Arial', '#FFFFFF', rarity.color);

        // Description avec style élégant
        this.drawStyledText(ctx, achievement.description, 250, 230, '24px Arial', '#E0E0E0', 700);

        // Emoji géant avec glow
        this.drawGlowingEmoji(ctx, achievement.emoji || '🏆', 850, 200, 120);

        // Badge de rareté
        this.drawRarityBadge(ctx, rarity, 20, 20);

        // Timestamp décoratif
        this.drawTimestamp(ctx, 980, 380);

        return canvas.toBuffer();
    }

    async createLeaderboardImage(leaderboardData, category, limit) {
        const canvas = createCanvas(900, 600 + (limit * 50));
        const ctx = canvas.getContext('2d');

        // Arrière-plan élégant
        await this.drawLeaderboardBackground(ctx, 900, 600 + (limit * 50));

        // En-tête avec style
        this.drawLeaderboardHeader(ctx, category, 450, 60);

        // Podium pour le top 3
        await this.drawPodium(ctx, leaderboardData.slice(0, 3), 150, 150);

        // Liste des autres positions
        await this.drawLeaderboardList(ctx, leaderboardData.slice(3, limit), 50, 400);

        return canvas.toBuffer();
    }

    // =================== MÉTHODES DE DESSIN SPÉCIALISÉES ===================

    async drawAdvancedBackground(ctx, width, height) {
        // Gradient principal
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#16213e');
        gradient.addColorStop(0.7, '#0f3460');
        gradient.addColorStop(1, '#533483');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Effet de vagues
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        this.drawWavePattern(ctx, width, height);
        ctx.restore();

        // Points lumineux
        this.drawLightPoints(ctx, width, height, 50);
    }

    async drawGlowingAvatar(ctx, user, x, y, radius) {
        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            
            // Effet glow
            ctx.save();
            ctx.shadowColor = config.colors.primary;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = config.colors.primary + '40';
            ctx.fill();
            ctx.restore();

            // Avatar circulaire
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, radius * 2, radius * 2);
            ctx.restore();

            // Bordure dorée
            ctx.strokeStyle = config.colors.primary;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius + 2, 0, Math.PI * 2);
            ctx.stroke();

        } catch (error) {
            // Avatar de fallback
            ctx.fillStyle = config.colors.secondary;
            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawUserInfo(ctx, user, userData, member, x, y) {
        // Nom avec effet de gradient
        const nameGradient = ctx.createLinearGradient(x, y - 20, x + 400, y + 20);
        nameGradient.addColorStop(0, '#FFD700');
        nameGradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = nameGradient;
        ctx.font = 'bold 42px Arial';
        ctx.fillText(user.displayName, x, y);

        // Niveau avec badge
        this.drawLevelBadge(ctx, userData.level, x, y + 40);

        // XP avec barre de progression
        this.drawXPBar(ctx, userData.experience, userData.level, x, y + 90);

        // Statut membre premium si applicable
        if (member?.premiumSince) {
            this.drawPremiumBadge(ctx, x + 400, y - 10);
        }
    }

    drawProgressBars(ctx, userData, x, y) {
        const stats = [
            { label: 'Messages', current: userData.messagesCount, max: this.getNextMilestone(userData.messagesCount), color: '#7289DA' },
            { label: 'Temps vocal', current: userData.voiceTime, max: this.getNextMilestone(userData.voiceTime), color: '#4ECDC4' },
            { label: 'Réactions', current: userData.reactionsGiven, max: this.getNextMilestone(userData.reactionsGiven), color: '#FF6B6B' },
            { label: 'Félicitations', current: userData.congratulationsSent, max: this.getNextMilestone(userData.congratulationsSent), color: '#54A0FF' }
        ];

        stats.forEach((stat, index) => {
            const barY = y + (index * 60);
            this.drawAnimatedProgressBar(ctx, stat, x, barY, 500);
        });
    }

    drawAnimatedProgressBar(ctx, stat, x, y, width) {
        const height = 30;
        const progress = Math.min(stat.current / stat.max, 1);

        // Fond de la barre
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(x, y, width, height);

        // Barre de progression avec gradient
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, stat.color);
        gradient.addColorStop(1, stat.color + 'AA');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width * progress, height);

        // Effet de brillance
        const glowGradient = ctx.createLinearGradient(x, y, x, y + height);
        glowGradient.addColorStop(0, '#FFFFFF40');
        glowGradient.addColorStop(0.5, '#FFFFFF20');
        glowGradient.addColorStop(1, '#FFFFFF00');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x, y, width * progress, height / 2);

        // Bordure
        ctx.strokeStyle = '#23272A';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${stat.label}: ${this.formatNumber(stat.current)}/${this.formatNumber(stat.max)}`, x, y - 5);

        // Pourcentage
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(progress * 100)}%`, x + width / 2, y + height / 2 + 5);
        ctx.textAlign = 'left';
    }

    drawLevelBadge(ctx, level, x, y) {
        const badgeWidth = 80;
        const badgeHeight = 30;

        // Fond du badge
        const gradient = ctx.createLinearGradient(x, y, x + badgeWidth, y + badgeHeight);
        gradient.addColorStop(0, '#9932CC');
        gradient.addColorStop(1, '#4B0082');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, badgeWidth, badgeHeight);

        // Bordure
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, badgeWidth, badgeHeight);

        // Texte
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`NIV ${level}`, x + badgeWidth / 2, y + badgeHeight / 2 + 5);
        ctx.textAlign = 'left';
    }

    drawXPBar(ctx, currentXP, level, x, y) {
        const currentLevelXP = (level - 1) * 1000;
        const nextLevelXP = level * 1000;
        const progressXP = currentXP - currentLevelXP;
        const neededXP = nextLevelXP - currentLevelXP;
        const progress = Math.min(progressXP / neededXP, 1);

        const barWidth = 400;
        const barHeight = 20;

        // Fond
        ctx.fillStyle = '#36393F';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Progression
        const xpGradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        xpGradient.addColorStop(0, '#9932CC');
        xpGradient.addColorStop(1, '#FF6B6B');
        
        ctx.fillStyle = xpGradient;
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        // Bordure
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Texte XP
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.formatNumber(progressXP)}/${this.formatNumber(neededXP)} XP`, x + 10, y + 15);
    }

    draw3DText(ctx, text, x, y, font, frontColor, backColor) {
        ctx.font = font;
        
        // Ombre
        ctx.fillStyle = '#00000080';
        ctx.fillText(text, x + 3, y + 3);

        // Profondeur 3D
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = backColor;
            ctx.fillText(text, x - i, y - i);
        }

        // Texte principal
        ctx.fillStyle = frontColor;
        ctx.fillText(text, x, y);
    }

    drawParticleEffect(ctx, width, height, color) {
        const particles = 30;
        
        for (let i = 0; i < particles; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.5 + 0.1;

            ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawWavePattern(ctx, width, height) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
            const y = height / 2 + Math.sin(x * 0.02) * 50;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = '#FFFFFF20';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawLightPoints(ctx, width, height, count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;

            ctx.fillStyle = '#FFFFFF' + Math.floor(Math.random() * 128 + 127).toString(16);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // =================== UTILITAIRES ===================

    getNextMilestone(current) {
        const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        return milestones.find(m => m > current) || current + 1000;
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    drawStyledText(ctx, text, x, y, font, color, maxWidth) {
        ctx.font = font;
        ctx.fillStyle = color;
        
        if (maxWidth) {
            const lines = this.wrapText(ctx, text, maxWidth);
            lines.forEach((line, index) => {
                ctx.fillText(line, x, y + (index * 30));
            });
        } else {
            ctx.fillText(text, x, y);
        }
    }

    drawRarityBadge(ctx, rarity, x, y) {
        const width = 120;
        const height = 40;

        // Fond avec couleur de rareté
        ctx.fillStyle = rarity.color;
        ctx.fillRect(x, y, width, height);

        // Bordure brillante
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Texte
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${rarity.emoji} ${rarity.name.toUpperCase()}`, x + width / 2, y + height / 2 + 5);
        ctx.textAlign = 'left';
    }

    drawTimestamp(ctx, x, y) {
        const now = new Date();
        const timeString = now.toLocaleDateString('fr-FR') + ' • ' + now.toLocaleTimeString('fr-FR');
        
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(timeString, x, y);
        ctx.textAlign = 'left';
    }

    // Méthode pour nettoyer les ressources
    cleanup() {
        // Nettoyer les images mises en cache, etc.
        console.log('🧹 Nettoyage des ressources Canvas effectué');
    }
}

module.exports = new CanvasUtils();