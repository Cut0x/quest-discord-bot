// setup.js - Script d'installation et de configuration automatique
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class QuestBotSetup {
    constructor() {
        this.config = {};
        this.requiredDirs = [
            'commands', 'commands/user', 'commands/admin', 'commands/utility',
            'events', 'assets', 'assets/fonts', 'backups', 'temp', 'utils'
        ];
    }

    async start() {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║            🚀 QUESTBOT ADVANCED SETUP v3.0              ║
║                   MODERN CANVAS EDITION                  ║
╚══════════════════════════════════════════════════════════╝
        `);

        console.log('Welcome to QuestBot Advanced Modern setup!\n');

        try {
            await this.checkEnvironment();
            await this.createDirectories();
            await this.setupEnvironment();
            await this.testCanvas();
            await this.finalizeSetup();
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkEnvironment() {
        console.log('🔍 Checking environment...\n');

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            throw new Error(`Node.js 16+ required. Current: ${nodeVersion}`);
        }
        console.log(`✅ Node.js version: ${nodeVersion}`);

        // Check Canvas dependencies
        try {
            require('canvas');
            console.log('✅ Canvas package available');
        } catch (error) {
            console.log('❌ Canvas package not found');
            console.log('\n📋 Please install Canvas dependencies first:');
            console.log('Ubuntu/Debian: sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev');
            console.log('macOS: brew install pkg-config cairo pango libpng jpeg giflib librsvg');
            console.log('Windows: npm install --global windows-build-tools\n');
            throw new Error('Canvas dependencies missing');
        }

        // Check Discord.js
        try {
            require('discord.js');
            console.log('✅ Discord.js available');
        } catch (error) {
            console.log('❌ Discord.js not found');
            throw new Error('Please run: npm install discord.js');
        }

        console.log('');
    }

    async createDirectories() {
        console.log('📁 Creating directory structure...\n');

        this.requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Created: ${dir}/`);
            } else {
                console.log(`📁 Exists: ${dir}/`);
            }
        });

        console.log('');
    }

    async setupEnvironment() {
        console.log('⚙️ Environment configuration...\n');

        // Check if .env already exists
        if (fs.existsSync('.env')) {
            const overwrite = await this.question('📄 .env file already exists. Overwrite? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('⏭️ Skipping .env configuration');
                return;
            }
        }

        // Collect configuration
        console.log('Please provide the following information:\n');

        this.config.DISCORD_TOKEN = await this.question('🤖 Discord Bot Token (required): ');
        if (!this.config.DISCORD_TOKEN) {
            throw new Error('Discord Bot Token is required');
        }

        this.config.PREFIX = await this.question('⚡ Command Prefix (default: !): ') || '!';
        this.config.NODE_ENV = await this.question('🔧 Environment (development/production, default: development): ') || 'development';

        console.log('\n📋 Optional configuration (press Enter to skip):');
        this.config.NOTIFICATION_CHANNEL_ID = await this.question('📢 Notification Channel ID: ') || '';
        this.config.ADMIN_LOG_CHANNEL_ID = await this.question('🛠️ Admin Log Channel ID: ') || '';
        this.config.ADMIN_IDS = await this.question('👑 Admin User IDs (comma-separated): ') || '';

        const debugMode = await this.question('🐛 Enable debug mode? (y/N): ');
        this.config.DEBUG_MODE = debugMode.toLowerCase() === 'y' ? 'true' : 'false';

        // Write .env file
        this.writeEnvFile();
        console.log('✅ .env file created successfully\n');
    }

    async testCanvas() {
        console.log('🎨 Testing Canvas system...\n');

        try {
            const { createCanvas } = require('canvas');
            const canvas = createCanvas(400, 200);
            const ctx = canvas.getContext('2d');

            // Draw test pattern
            const gradient = ctx.createLinearGradient(0, 0, 400, 200);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 200);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QuestBot Modern', 200, 100);
            ctx.fillText('Canvas Test', 200, 140);

            // Save test image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync('./test-canvas.png', buffer);
            
            console.log('✅ Canvas system working');
            console.log('📸 Test image saved as test-canvas.png');
            
            // Clean up test file
            setTimeout(() => {
                if (fs.existsSync('./test-canvas.png')) {
                    fs.unlinkSync('./test-canvas.png');
                    console.log('🧹 Test image cleaned up');
                }
            }, 5000);

        } catch (error) {
            console.log('❌ Canvas test failed:', error.message);
            throw new Error('Canvas system not working properly');
        }

        console.log('');
    }

    async finalizeSetup() {
        console.log('🎯 Finalizing setup...\n');

        // Create example config files
        this.createExampleFiles();

        console.log(`
╔══════════════════════════════════════════════════════════╗
║                   ✅ SETUP COMPLETE!                    ║
╚══════════════════════════════════════════════════════════╝

🚀 QuestBot Advanced Modern is ready!

📋 Next steps:
1. Verify your .env configuration
2. Run: npm start
3. Invite your bot to your Discord server
4. Test with: ${this.config.PREFIX}help

🔗 Useful commands:
- npm start          → Start the bot
- npm run dev        → Start with auto-reload
- ${this.config.PREFIX}help            → Display help
- ${this.config.PREFIX}stats           → View statistics
- ${this.config.PREFIX}achievements    → View achievements

📚 Documentation: README.md
🐛 Debug mode: ${this.config.DEBUG_MODE === 'true' ? 'ENABLED' : 'DISABLED'}

Happy botting! 🎉
        `);

        rl.close();
    }

    writeEnvFile() {
        const envContent = `# ====================================
# QUESTBOT ADVANCED MODERN v3.0
# Generated by setup script
# ====================================

# OBLIGATOIRE - Token du bot Discord
DISCORD_TOKEN=${this.config.DISCORD_TOKEN}

# CONFIGURATION DE BASE
PREFIX=${this.config.PREFIX}
NODE_ENV=${this.config.NODE_ENV}

# CANAUX IMPORTANTS
${this.config.NOTIFICATION_CHANNEL_ID ? `NOTIFICATION_CHANNEL_ID=${this.config.NOTIFICATION_CHANNEL_ID}` : '# NOTIFICATION_CHANNEL_ID=your_notification_channel_id'}
${this.config.ADMIN_LOG_CHANNEL_ID ? `ADMIN_LOG_CHANNEL_ID=${this.config.ADMIN_LOG_CHANNEL_ID}` : '# ADMIN_LOG_CHANNEL_ID=your_admin_log_channel_id'}

# PERMISSIONS ET RÔLES
${this.config.ADMIN_IDS ? `ADMIN_IDS=${this.config.ADMIN_IDS}` : '# ADMIN_IDS=user_id_1,user_id_2'}

# NOTIFICATIONS
SEND_PRIVATE_NOTIFICATIONS=false
SEND_PUBLIC_NOTIFICATIONS=true

# DÉBOGAGE
DEBUG_MODE=${this.config.DEBUG_MODE}

# ====================================
# CONFIGURATION AVANCÉE (Optionnel)
# ====================================

# LEVELUP_CHANNEL_ID=your_levelup_channel_id
# WELCOME_CHANNEL_ID=your_welcome_channel_id
# ADMIN_ROLE_ID=admin_role_id
# MODERATOR_ROLE_ID=moderator_role_id
# OWNER_ROLE_ID=owner_role_id

# NOTIFY_BOOST_END=false
# LOG_NICKNAME_CHANGES=false
`;

        fs.writeFileSync('.env', envContent);
    }

    createExampleFiles() {
        // Create a basic command example if commands folder is empty
        const userCommandsPath = './commands/user';
        if (fs.readdirSync(userCommandsPath).length === 0) {
            const exampleCommand = `// commands/user/ping.js - Example command
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping',
        description: 'Display bot latency',
        aliases: ['latency'],
        usage: '',
        category: 'utility',
        cooldown: 5000
    },

    async execute(message, args, bot) {
        const sent = await message.reply('🏓 Calculating latency...');
        
        const botLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(bot.client.ws.ping);
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription('Latency measured successfully')
            .addFields([
                {
                    name: '🤖 Bot Latency',
                    value: \`\${botLatency}ms\`,
                    inline: true
                },
                {
                    name: '📡 API Latency',
                    value: \`\${apiLatency}ms\`,
                    inline: true
                }
            ])
            .setColor('#667eea')
            .setTimestamp();

        await sent.edit({ content: '', embeds: [embed] });
    }
};`;

            fs.writeFileSync('./commands/user/ping.js', exampleCommand);
            console.log('📝 Created example command: ping.js');
        }

        console.log('📄 Example files created');
    }

    question(prompt) {
        return new Promise((resolve) => {
            rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// Start setup
const setup = new QuestBotSetup();
setup.start().catch(console.error);