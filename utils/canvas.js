// utils/canvas.js - Canvas moderne amélioré avec Roboto uniquement
const { createCanvas, loadImage } = require('canvas');

class ImprovedCanvasUtils {
    constructor(config) {
        this.config = config;
        this.fonts = {
            primary: 'Roboto, Arial, sans-serif',
            secondary: 'Roboto, Arial, sans-serif',
            fallback: 'Arial, sans-serif'
        };
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            background: {
                dark: '#0f172a',
                medium: '#1e293b',
                light: '#334155'
            },
            text: {
                primary: '#ffffff',
                secondary: '#e2e8f0',
                muted: '#94a3b8'
            },
            glass: 'rgba(255, 255, 255, 0.1)',
            shadow: 'rgba(0, 0, 0, 0.4)'
        };
    }

    // =================== PROFILE CARD MODERNE AMÉLIORÉE ===================
    async createModernProfileCard(user, userData, member) {
        const canvas = createCanvas(900, 600);
        const ctx = canvas.getContext('2d');

        // Background moderne avec gradient amélioré
        this.drawEnhancedBackground(ctx, 900, 600);

        // Header section avec avatar
        await this.drawImprovedProfileHeader(ctx, user, userData, member, 40, 40);

        // Stats grid améliorée
        this.drawEnhancedStatsGrid(ctx, userData, 40, 220);

        // Progress bars modernes
        this.drawImprovedProgressBars(ctx, userData, 40, 400);

        // Achievement preview
        this.drawEnhancedAchievementPreview(ctx, userData, 500, 220);

        // Footer avec timestamp
        this.drawFooter(ctx, 900, 600);

        return canvas.toBuffer();
    }

    // =================== ACHIEVEMENT CARD MODERNE AMÉLIORÉE ===================
    async createModernAchievementCard(user, achievement, category, leveledUp = false, newLevel = 1) {
        const canvas = createCanvas(700, 400);
        const ctx = canvas.getContext('2d');

        // Background avec effet glassmorphism amélioré
        this.drawEnhancedGlassBackground(ctx, 700, 400, this.colors.primary);

        // Achievement content amélioré
        await this.drawEnhancedAchievementContent(ctx, user, achievement, category, leveledUp, newLevel);

        return canvas.toBuffer();
    }

    // =================== LEADERBOARD MODERNE AMÉLIORÉ ===================
    async createModernLeaderboard(leaderboardData, category, limit, client) {
        const canvas = createCanvas(800, Math.max(500, 150 + (limit * 60)));
        const ctx = canvas.getContext('2d');

        // Background
        this.drawEnhancedBackground(ctx, 800, canvas.height);

        // Header amélioré
        this.drawEnhancedLeaderboardHeader(ctx, category, 800);

        // User list améliorée
        await this.drawEnhancedUserList(ctx, leaderboardData, limit, client, 40, 150);

        // Footer
        this.drawFooter(ctx, 800, canvas.height);

        return canvas.toBuffer();
    }

    // =================== MÉTHODES DE DESSIN AMÉLIORÉES ===================

    drawEnhancedBackground(ctx, width, height) {
        // Base gradient amélioré
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, this.colors.background.dark);
        gradient.addColorStop(0.3, this.colors.background.medium);
        gradient.addColorStop(0.7, this.colors.background.light);
        gradient.addColorStop(1, '#475569');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Pattern subtil amélioré
        this.drawEnhancedPattern(ctx, width, height);

        // Accent gradient overlay amélioré
        const accentGradient = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.5, height * 0.5, width * 0.8);
        accentGradient.addColorStop(0, this.colors.primary + '25');
        accentGradient.addColorStop(0.5, this.colors.secondary + '15');
        accentGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = accentGradient;
        ctx.fillRect(0, 0, width, height);

        // Effet de brillance en haut
        const topShine = ctx.createLinearGradient(0, 0, 0, height * 0.3);
        topShine.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        topShine.addColorStop(1, 'transparent');
        ctx.fillStyle = topShine;
        ctx.fillRect(0, 0, width, height * 0.3);
    }

    drawEnhancedGlassBackground(ctx, width, height, accentColor) {
        // Dark base amélioré
        const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
        baseGradient.addColorStop(0, this.colors.background.dark);
        baseGradient.addColorStop(1, this.colors.background.medium);
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, width, height);

        // Glass effect principal
        const glassGradient = ctx.createLinearGradient(0, 0, 0, height);
        glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
        
        ctx.fillStyle = glassGradient;
        this.roundRect(ctx, 30, 30, width - 60, height - 60, 25);
        ctx.fill();

        // Border principal
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, 30, 30, width - 60, height - 60, 25);
        ctx.stroke();

        // Accent border avec glow
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = accentColor + '60';
        ctx.lineWidth = 3;
        this.roundRect(ctx, 32, 32, width - 64, height - 64, 23);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Highlight en haut
        const highlight = ctx.createLinearGradient(0, 30, 0, 80);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlight.addColorStop(1, 'transparent');
        ctx.fillStyle = highlight;
        this.roundRect(ctx, 30, 30, width - 60, 50, 25);
        ctx.fill();
    }

    drawEnhancedPattern(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = 0.04;
        
        // Pattern en diamant
        for (let x = 0; x < width; x += 60) {
            for (let y = 0; y < height; y += 60) {
                const offsetX = (y / 60) % 2 === 0 ? 0 : 30;
                ctx.fillStyle = this.colors.text.primary;
                ctx.fillRect(x + offsetX, y, 2, 2);
                ctx.fillRect(x + offsetX + 30, y + 30, 2, 2);
            }
        }
        
        ctx.restore();
    }

    async drawImprovedProfileHeader(ctx, user, userData, member, x, y) {
        // Container pour le header
        const headerHeight = 140;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(ctx, x, y, 820, headerHeight, 15);
        ctx.fill();

        // Avatar avec style moderne amélioré
        await this.drawEnhancedAvatar(ctx, user, x + 20, y + 20, 100);

        // User info avec meilleure disposition
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 32px ${this.fonts.primary}`;
        ctx.fillText(user.displayName, x + 150, y + 50);

        // Level badge amélioré
        this.drawEnhancedBadge(ctx, `LEVEL ${userData.level}`, x + 150, y + 65, this.colors.primary);

        // XP info avec style
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `18px ${this.fonts.primary}`;
        ctx.fillText(`${this.formatNumber(userData.experience)} XP Total`, x + 150, y + 105);

        // Status indicators améliorés
        if (member?.premiumSince) {
            this.drawEnhancedBadge(ctx, 'BOOSTER', x + 350, y + 65, this.colors.accent);
        }

        // Joined date
        ctx.fillStyle = this.colors.text.muted;
        ctx.font = `14px ${this.fonts.primary}`;
        const joinedDate = new Date(userData.joinedAt).toLocaleDateString('fr-FR');
        ctx.fillText(`Member since ${joinedDate}`, x + 150, y + 125);
    }

    async drawEnhancedAvatar(ctx, user, x, y, size) {
        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            
            // Shadow plus prononcée
            ctx.save();
            ctx.shadowColor = this.colors.shadow;
            ctx.shadowBlur = 25;
            ctx.shadowOffsetY = 10;
            
            // Clip circle
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            // Draw avatar
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // Border avec glow
            ctx.shadowColor = this.colors.primary;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = this.colors.primary;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2 + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Highlight sur l'avatar
            const highlight = ctx.createRadialGradient(x + size*0.3, y + size*0.3, 0, x + size/2, y + size/2, size/2);
            highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            highlight.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
            highlight.addColorStop(1, 'transparent');
            
            ctx.fillStyle = highlight;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();

        } catch (error) {
            // Fallback avatar amélioré
            const fallbackGradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size/2);
            fallbackGradient.addColorStop(0, this.colors.background.light);
            fallbackGradient.addColorStop(1, this.colors.background.medium);
            
            ctx.fillStyle = fallbackGradient;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();

            // Icône utilisateur par défaut
            ctx.fillStyle = this.colors.text.muted;
            ctx.font = `${size/3}px ${this.fonts.primary}`;
            ctx.textAlign = 'center';
            ctx.fillText('👤', x + size/2, y + size/2 + size/9);
            ctx.textAlign = 'left';
        }
    }

    drawEnhancedBadge(ctx, text, x, y, color) {
        const padding = 12;
        const height = 28;
        
        ctx.font = `bold 14px ${this.fonts.primary}`;
        const width = ctx.measureText(text).width + padding * 2;

        // Background avec gradient
        const badgeGradient = ctx.createLinearGradient(x, y, x, y + height);
        badgeGradient.addColorStop(0, color + '60');
        badgeGradient.addColorStop(1, color + '40');
        ctx.fillStyle = badgeGradient;
        this.roundRect(ctx, x, y, width, height, height/2);
        ctx.fill();

        // Border avec glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color + 'aa';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, width, height, height/2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Text avec shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.fillStyle = this.colors.text.primary;
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width/2, y + height/2 + 5);
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
    }

    drawEnhancedStatsGrid(ctx, userData, x, y) {
        const stats = [
            { label: 'Messages', value: this.formatNumber(userData.messagesCount), color: this.colors.primary, icon: '💬' },
            { label: 'Voice Time', value: this.formatDuration(userData.voiceTime), color: this.colors.secondary, icon: '🎙️' },
            { label: 'Reactions', value: this.formatNumber(userData.reactionsGiven), color: this.colors.accent, icon: '❤️' },
            { label: 'Achievements', value: userData.achievements.length.toString(), color: this.colors.success, icon: '🏆' }
        ];

        const cardWidth = 100;
        const cardHeight = 80;
        const gap = 25;

        stats.forEach((stat, index) => {
            const cardX = x + (index * (cardWidth + gap));
            
            // Card background avec gradient
            const cardGradient = ctx.createLinearGradient(cardX, y, cardX, y + cardHeight);
            cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            ctx.fillStyle = cardGradient;
            this.roundRect(ctx, cardX, y, cardWidth, cardHeight, 12);
            ctx.fill();

            // Accent border avec glow
            ctx.shadowColor = stat.color;
            ctx.shadowBlur = 8;
            ctx.strokeStyle = stat.color + '80';
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, y, cardWidth, cardHeight, 12);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icon (emoji remplacé par symbole)
            ctx.fillStyle = stat.color;
            ctx.font = `20px ${this.fonts.primary}`;
            ctx.textAlign = 'center';
            ctx.fillText(stat.icon, cardX + cardWidth/2, y + 25);

            // Value
            ctx.fillStyle = this.colors.text.primary;
            ctx.font = `bold 18px ${this.fonts.primary}`;
            ctx.fillText(stat.value, cardX + cardWidth/2, y + 45);

            // Label
            ctx.fillStyle = this.colors.text.muted;
            ctx.font = `12px ${this.fonts.primary}`;
            ctx.fillText(stat.label, cardX + cardWidth/2, y + 65);
        });

        ctx.textAlign = 'left';
    }

    drawImprovedProgressBars(ctx, userData, x, y) {
        const currentLevelXP = (userData.level - 1) * 1000;
        const nextLevelXP = userData.level * 1000;
        const progressXP = userData.experience - currentLevelXP;
        const neededXP = nextLevelXP - currentLevelXP;
        const progress = Math.min(progressXP / neededXP, 1);

        const barWidth = 400;
        const barHeight = 25;

        // Container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(ctx, x - 10, y - 10, barWidth + 20, barHeight + 40, 15);
        ctx.fill();

        // Label
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 16px ${this.fonts.primary}`;
        ctx.fillText('Experience Progress', x, y - 20);

        // Background de la barre
        ctx.fillStyle = this.colors.background.light;
        this.roundRect(ctx, x, y, barWidth, barHeight, barHeight/2);
        ctx.fill();

        // Progress fill avec gradient amélioré
        const progressGradient = ctx.createLinearGradient(x, y, x + barWidth * progress, y);
        progressGradient.addColorStop(0, this.colors.primary);
        progressGradient.addColorStop(0.5, this.colors.accent);
        progressGradient.addColorStop(1, this.colors.secondary);
        
        ctx.fillStyle = progressGradient;
        this.roundRect(ctx, x, y, barWidth * progress, barHeight, barHeight/2);
        ctx.fill();

        // Glow effect amélioré
        ctx.save();
        ctx.shadowColor = this.colors.primary;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.colors.primary + '60';
        this.roundRect(ctx, x, y, barWidth * progress, barHeight, barHeight/2);
        ctx.fill();
        ctx.restore();

        // Highlight sur la barre
        const highlight = ctx.createLinearGradient(x, y, x, y + barHeight/2);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlight.addColorStop(1, 'transparent');
        ctx.fillStyle = highlight;
        this.roundRect(ctx, x, y, barWidth * progress, barHeight/2, barHeight/2);
        ctx.fill();

        // Text avec ombre
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 14px ${this.fonts.primary}`;
        ctx.textAlign = 'center';
        ctx.fillText(`${this.formatNumber(progressXP)} / ${this.formatNumber(neededXP)} XP (${Math.round(progress * 100)}%)`, x + barWidth/2, y + barHeight/2 + 5);
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
    }

    drawEnhancedAchievementPreview(ctx, userData, x, y) {
        const width = 320;
        const height = 160;

        // Background container
        const containerGradient = ctx.createLinearGradient(x, y, x, y + height);
        containerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        containerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        ctx.fillStyle = containerGradient;
        this.roundRect(ctx, x, y, width, height, 15);
        ctx.fill();

        // Border avec glow
        ctx.shadowColor = this.colors.success;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = this.colors.success + '60';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, width, height, 15);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Title avec style
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 18px ${this.fonts.primary}`;
        ctx.fillText('🏆 Achievement Progress', x + 20, y + 35);

        // Achievement count avec style
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `16px ${this.fonts.primary}`;
        ctx.fillText(`${userData.achievements.length} Total Unlocked`, x + 20, y + 60);

        // Progress indicator
        const totalAchievements = 50;
        const completionRate = Math.round((userData.achievements.length / totalAchievements) * 100);
        
        ctx.fillStyle = this.colors.text.muted;
        ctx.font = `14px ${this.fonts.primary}`;
        ctx.fillText(`${completionRate}% Collection Complete`, x + 20, y + 85);

        // Mini progress bar améliorée
        const miniBarWidth = 280;
        const miniBarHeight = 8;
        const miniY = y + 100;

        ctx.fillStyle = this.colors.background.light;
        this.roundRect(ctx, x + 20, miniY, miniBarWidth, miniBarHeight, miniBarHeight/2);
        ctx.fill();

        const miniProgress = completionRate / 100;
        const miniGradient = ctx.createLinearGradient(x + 20, miniY, x + 20 + miniBarWidth * miniProgress, miniY);
        miniGradient.addColorStop(0, this.colors.success);
        miniGradient.addColorStop(1, this.colors.accent);
        ctx.fillStyle = miniGradient;
        this.roundRect(ctx, x + 20, miniY, miniBarWidth * miniProgress, miniBarHeight, miniBarHeight/2);
        ctx.fill();

        // Recent achievements text
        ctx.fillStyle = this.colors.text.muted;
        ctx.font = `12px ${this.fonts.primary}`;
        ctx.fillText('Keep earning achievements to level up faster!', x + 20, y + 135);
    }

    async drawEnhancedAchievementContent(ctx, user, achievement, category, leveledUp, newLevel) {
        const centerX = 350;
        const centerY = 200;

        // Title avec glow
        ctx.shadowColor = this.colors.warning;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 28px ${this.fonts.primary}`;
        ctx.textAlign = 'center';
        ctx.fillText('🎉 Achievement Unlocked!', centerX, 80);
        ctx.shadowBlur = 0;

        // Achievement name avec style
        ctx.fillStyle = this.colors.warning;
        ctx.font = `bold 24px ${this.fonts.primary}`;
        ctx.fillText(achievement.name, centerX, 130);

        // Description avec meilleur style
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `16px ${this.fonts.primary}`;
        this.wrapText(ctx, achievement.description || 'Congratulations on this achievement!', centerX, 160, 500, 22);

        // Avatar amélioré
        await this.drawEnhancedAvatar(ctx, user, centerX - 40, 200, 80);

        // XP reward
        if (achievement.xp) {
            ctx.fillStyle = this.colors.accent;
            ctx.font = `bold 18px ${this.fonts.primary}`;
            ctx.fillText(`+${achievement.xp} XP Earned!`, centerX, 310);
        }

        // Level up indicator amélioré
        if (leveledUp) {
            ctx.shadowColor = this.colors.warning;
            ctx.shadowBlur = 10;
            ctx.fillStyle = this.colors.warning;
            ctx.font = `bold 20px ${this.fonts.primary}`;
            ctx.fillText(`🎊 Level Up! Now Level ${newLevel}!`, centerX, 340);
            ctx.shadowBlur = 0;
        }

        ctx.textAlign = 'left';
    }

    drawEnhancedLeaderboardHeader(ctx, category, width) {
        const headerHeight = 100;

        // Header background avec gradient
        const headerGradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
        headerGradient.addColorStop(0, this.colors.primary + '40');
        headerGradient.addColorStop(0.5, this.colors.secondary + '30');
        headerGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, width, headerHeight);

        // Title avec glow
        ctx.shadowColor = this.colors.primary;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.colors.text.primary;
        ctx.font = `bold 32px ${this.fonts.primary}`;
        ctx.textAlign = 'center';
        ctx.fillText(`🏆 Leaderboard - ${this.getCategoryDisplayName(category)}`, width/2, 50);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `16px ${this.fonts.primary}`;
        ctx.fillText('Top performers in the community', width/2, 75);

        ctx.textAlign = 'left';
    }

    async drawEnhancedUserList(ctx, leaderboardData, limit, client, x, y) {
        const itemHeight = 50;
        const itemGap = 8;

        for (let i = 0; i < Math.min(leaderboardData.length, limit); i++) {
            const userData = leaderboardData[i];
            const itemY = y + (i * (itemHeight + itemGap));
            const position = i + 1;

            // Background avec gradient basé sur la position
            let bgAlpha = position <= 3 ? 0.2 : 0.1;
            let borderColor = position <= 3 ? this.colors.warning : this.colors.text.muted;
            
            const itemGradient = ctx.createLinearGradient(x, itemY, x, itemY + itemHeight);
            itemGradient.addColorStop(0, `rgba(255, 255, 255, ${bgAlpha})`);
            itemGradient.addColorStop(1, `rgba(255, 255, 255, ${bgAlpha * 0.5})`);
            ctx.fillStyle = itemGradient;
            this.roundRect(ctx, x, itemY, 720, itemHeight, 12);
            ctx.fill();

            // Border pour les top 3
            if (position <= 3) {
                ctx.strokeStyle = borderColor + '60';
                ctx.lineWidth = 2;
                this.roundRect(ctx, x, itemY, 720, itemHeight, 12);
                ctx.stroke();
            }

            // Position indicator avec style
            ctx.fillStyle = borderColor;
            ctx.font = `bold 20px ${this.fonts.primary}`;
            ctx.fillText(`#${position}`, x + 25, itemY + 32);

            // Medal pour top 3
            if (position <= 3) {
                const medals = ['🥇', '🥈', '🥉'];
                ctx.font = `24px ${this.fonts.primary}`;
                ctx.fillText(medals[position - 1], x + 70, itemY + 35);
            }

            // User name avec style
            try {
                const user = await client.users.fetch(userData.userId);
                ctx.fillStyle = this.colors.text.primary;
                ctx.font = `bold 18px ${this.fonts.primary}`;
                ctx.fillText(user.displayName || user.username, x + (position <= 3 ? 110 : 90), itemY + 32);
            } catch {
                ctx.fillStyle = this.colors.text.muted;
                ctx.font = `18px ${this.fonts.primary}`;
                ctx.fillText('Unknown User', x + (position <= 3 ? 110 : 90), itemY + 32);
            }

            // Value avec highlight
            ctx.fillStyle = this.colors.text.secondary;
            ctx.font = `bold 18px ${this.fonts.primary}`;
            ctx.textAlign = 'right';
            ctx.fillText(this.formatNumber(userData.value), x + 690, itemY + 32);
        }

        ctx.textAlign = 'left';
    }

    drawFooter(ctx, width, height) {
        const footerHeight = 30;
        const footerY = height - footerHeight;

        // Footer background subtil
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, footerY, width, footerHeight);

        // Timestamp
        ctx.fillStyle = this.colors.text.muted;
        ctx.font = `12px ${this.fonts.primary}`;
        ctx.textAlign = 'center';
        const now = new Date();
        ctx.fillText(`Generated on ${now.toLocaleDateString()} • QuestBot Advanced v3.0`, width/2, footerY + 20);
        ctx.textAlign = 'left';
    }

    // =================== UTILITAIRES AMÉLIORÉS ===================

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        ctx.textAlign = 'center';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        ctx.textAlign = 'left';
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    getCategoryDisplayName(category) {
        const names = {
            messages: 'Messages',
            voice: 'Voice Time',
            level: 'Level',
            experience: 'Experience',
            reactions_given: 'Reactions Given',
            reactions_received: 'Reactions Received',
            achievements: 'Achievements',
            camera: 'Camera Time',
            stream: 'Stream Time'
        };
        return names[category] || category;
    }
}

module.exports = ImprovedCanvasUtils;