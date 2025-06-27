#!/usr/bin/env node

/**
 * DUAL-AI ORCHESTRATOR PLATFORM - INTERACTIVE SETUP WIZARD
 * Comprehensive setup for macOS deployment
 * Guides users through complete configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class SetupWizard {
    constructor() {
        this.projectRoot = process.cwd();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.config = {};
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    logHeader(message) {
        console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(80)}`);
        console.log(`${colors.bold}${colors.cyan} ${message}`);
        console.log(`${colors.bold}${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
    }

    async question(prompt, defaultValue = '') {
        return new Promise((resolve) => {
            const fullPrompt = defaultValue 
                ? `${colors.cyan}${prompt}${colors.reset} ${colors.yellow}(${defaultValue})${colors.reset}: `
                : `${colors.cyan}${prompt}${colors.reset}: `;
            
            this.rl.question(fullPrompt, (answer) => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }

    async confirm(prompt, defaultValue = true) {
        const defaultText = defaultValue ? 'Y/n' : 'y/N';
        const answer = await this.question(`${prompt} (${defaultText})`);
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            return true;
        }
        if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
            return false;
        }
        return defaultValue;
    }

    showBanner() {
        console.clear();
        this.log('╔══════════════════════════════════════════════════════════════════════════════╗', 'magenta');
        this.log('║                    🤖 DUAL-AI ORCHESTRATOR PLATFORM 🤖                     ║', 'magenta');
        this.log('║                                                                              ║', 'magenta');
        this.log('║                          Interactive Setup Wizard                           ║', 'magenta');
        this.log('║                                                                              ║', 'magenta');
        this.log('║          Enterprise AI Collaboration • OpenAI + Anthropic                   ║', 'magenta');
        this.log('║                      macOS Optimized • NO DOCKER                            ║', 'magenta');
        this.log('╚══════════════════════════════════════════════════════════════════════════════╝', 'magenta');
        console.log();
    }

    async checkPrerequisites() {
        this.logHeader('PREREQUISITES CHECK');
        
        // Check Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            
            if (majorVersion >= 18) {
                this.log(`✅ Node.js: ${nodeVersion}`, 'green');
            } else {
                this.log(`❌ Node.js ${nodeVersion} is too old. Please install Node.js 18+`, 'red');
                process.exit(1);
            }
        } catch (error) {
            this.log('❌ Node.js not found. Please install Node.js 18+', 'red');
            process.exit(1);
        }

        // Check npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.log(`✅ npm: ${npmVersion}`, 'green');
        } catch (error) {
            this.log('❌ npm not found', 'red');
            process.exit(1);
        }

        // Check platform
        if (process.platform === 'darwin') {
            this.log('✅ Platform: macOS (optimized)', 'green');
        } else {
            this.log(`⚠️  Platform: ${process.platform} (works but not optimized)`, 'yellow');
        }

        // Check memory
        const totalMem = Math.round(require('os').totalmem() / 1024 / 1024 / 1024);
        if (totalMem >= 8) {
            this.log(`✅ System Memory: ${totalMem}GB`, 'green');
        } else {
            this.log(`⚠️  System Memory: ${totalMem}GB (8GB+ recommended)`, 'yellow');
        }

        this.log('\n🎯 Prerequisites check completed!', 'green');
        await this.question('Press Enter to continue...');
    }

    async configureEnvironment() {
        this.logHeader('ENVIRONMENT CONFIGURATION');
        
        const envPath = path.join(this.projectRoot, '.env');
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        
        // Check if .env already exists
        if (fs.existsSync(envPath)) {
            const overwrite = await this.confirm('Environment file (.env) already exists. Overwrite?', false);
            if (!overwrite) {
                this.log('📝 Keeping existing environment configuration', 'blue');
                return;
            }
        }

        this.log('🔧 Setting up environment configuration...', 'blue');
        
        // Basic server configuration
        this.config.PORT = await this.question('Server port', '3001');
        this.config.WS_PORT = await this.question('WebSocket port', '3002');
        this.config.NODE_ENV = await this.question('Environment', 'production');
        
        // Generate session secret
        this.config.SESSION_SECRET = require('crypto').randomBytes(32).toString('hex');
        this.log('🔐 Generated secure session secret', 'green');
        
        // API Keys
        this.log('\n🔑 API Key Configuration:', 'cyan');
        this.log('You need at least one API key to use the platform.', 'white');
        
        // OpenAI API Key
        this.log('\n📖 OpenAI API Key:', 'yellow');
        this.log('Get your key from: https://platform.openai.com/api-keys', 'white');
        this.config.OPENAI_API_KEY = await this.question('OpenAI API Key (sk-...)', '');
        if (this.config.OPENAI_API_KEY && !this.config.OPENAI_API_KEY.startsWith('sk-')) {
            this.log('⚠️  OpenAI API keys usually start with "sk-"', 'yellow');
        }
        
        // Anthropic API Key
        this.log('\n🤖 Anthropic API Key:', 'yellow');
        this.log('Get your key from: https://console.anthropic.com/', 'white');
        this.config.ANTHROPIC_API_KEY = await this.question('Anthropic API Key (sk-ant-...)', '');
        if (this.config.ANTHROPIC_API_KEY && !this.config.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
            this.log('⚠️  Anthropic API keys usually start with "sk-ant-"', 'yellow');
        }
        
        // Validate at least one API key
        if (!this.config.OPENAI_API_KEY && !this.config.ANTHROPIC_API_KEY) {
            this.log('❌ You need at least one API key to use the platform!', 'red');
            const retry = await this.confirm('Would you like to configure API keys now?', true);
            if (retry) {
                return this.configureEnvironment();
            } else {
                this.log('⚠️  You can add API keys later by editing the .env file', 'yellow');
            }
        }
        
        // Rate limiting
        const configureRates = await this.confirm('Configure rate limiting?', false);
        if (configureRates) {
            this.config.OPENAI_RATE_LIMIT = await this.question('OpenAI requests per minute', '60');
            this.config.ANTHROPIC_RATE_LIMIT = await this.question('Anthropic requests per minute', '60');
            this.config.GLOBAL_RATE_LIMIT = await this.question('Global requests per minute', '100');
        } else {
            this.config.OPENAI_RATE_LIMIT = '60';
            this.config.ANTHROPIC_RATE_LIMIT = '60';
            this.config.GLOBAL_RATE_LIMIT = '100';
        }
        
        // Write environment file
        await this.writeEnvironmentFile();
    }
    
    async writeEnvironmentFile() {
        const envPath = path.join(this.projectRoot, '.env');
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        
        let envContent = '';
        
        // Try to use .env.example as template
        if (fs.existsSync(envExamplePath)) {
            envContent = fs.readFileSync(envExamplePath, 'utf8');
            
            // Replace values
            Object.keys(this.config).forEach(key => {
                const value = this.config[key];
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (envContent.match(regex)) {
                    envContent = envContent.replace(regex, `${key}=${value}`);
                } else {
                    envContent += `\n${key}=${value}`;
                }
            });
        } else {
            // Create minimal .env file
            envContent = Object.keys(this.config)
                .map(key => `${key}=${this.config[key]}`)
                .join('\n');
        }
        
        fs.writeFileSync(envPath, envContent);
        fs.chmodSync(envPath, 0o600); // Secure permissions
        
        this.log('✅ Environment file created and secured', 'green');
    }

    async installDependencies() {
        this.logHeader('DEPENDENCY INSTALLATION');
        
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            this.log('❌ package.json not found!', 'red');
            process.exit(1);
        }
        
        const install = await this.confirm('Install dependencies now?', true);
        if (!install) {
            this.log('⏭️  Skipping dependency installation', 'yellow');
            return;
        }
        
        this.log('📦 Installing dependencies (this may take a few minutes)...', 'blue');
        
        try {
            // Set memory optimization for macOS
            process.env.NODE_OPTIONS = '--max-old-space-size=2048';
            
            execSync('npm install', { 
                stdio: 'inherit',
                cwd: this.projectRoot
            });
            
            this.log('✅ Dependencies installed successfully!', 'green');
            
            // Run security audit
            try {
                execSync('npm audit --audit-level=high', { stdio: 'pipe' });
                this.log('✅ Security audit passed', 'green');
            } catch (error) {
                this.log('⚠️  Security vulnerabilities found - run "npm audit fix"', 'yellow');
            }
            
        } catch (error) {
            this.log('❌ Failed to install dependencies', 'red');
            this.log(error.message, 'red');
            process.exit(1);
        }
    }

    async setupDirectories() {
        this.logHeader('DIRECTORY SETUP');
        
        const directories = [
            'logs',
            'backups',
            'tests',
            'backend',
            'frontend',
            'scripts'
        ];
        
        directories.forEach(dir => {
            const dirPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                this.log(`✅ Created directory: ${dir}`, 'green');
            } else {
                this.log(`📁 Directory exists: ${dir}`, 'blue');
            }
        });
        
        this.log('✅ Directory structure ready', 'green');
    }

    async finalConfiguration() {
        this.logHeader('FINAL CONFIGURATION');
        
        // Make scripts executable
        const scripts = ['deploy.sh', 'start.sh', 'dev.sh'];
        scripts.forEach(script => {
            const scriptPath = path.join(this.projectRoot, script);
            if (fs.existsSync(scriptPath)) {
                fs.chmodSync(scriptPath, 0o755);
                this.log(`✅ Made executable: ${script}`, 'green');
            }
        });
        
        // Validate configuration
        const validation = await this.confirm('Run configuration validation?', true);
        if (validation) {
            try {
                const validatorPath = path.join(this.projectRoot, 'scripts', 'validate.js');
                if (fs.existsSync(validatorPath)) {
                    execSync('node scripts/validate.js files', { stdio: 'inherit' });
                } else {
                    this.log('⚠️  Validator not found, skipping validation', 'yellow');
                }
            } catch (error) {
                this.log('⚠️  Validation completed with warnings', 'yellow');
            }
        }
    }

    async showCompletion() {
        this.logHeader('SETUP COMPLETED!');
        
        this.log('🎉 Your Dual-AI Orchestrator Platform is ready!', 'green');
        console.log();
        
        this.log('📋 Next Steps:', 'cyan');
        this.log('  1. Review your .env file if needed', 'white');
        this.log('  2. Start the platform:', 'white');
        this.log('     npm start          # Production mode', 'yellow');
        this.log('     ./start.sh          # Quick start', 'yellow');
        this.log('     npm run dev         # Development mode', 'yellow');
        console.log();
        
        this.log('🌐 Access URLs:', 'cyan');
        this.log(`  Web Interface:  http://localhost:${this.config.PORT || 3001}`, 'white');
        this.log(`  Health Check:   http://localhost:${this.config.PORT || 3001}/health`, 'white');
        this.log(`  API Stats:      http://localhost:${this.config.PORT || 3001}/api/stats`, 'white');
        console.log();
        
        this.log('🛠️  Management Commands:', 'cyan');
        this.log('  ./deploy.sh status   # Check status', 'white');
        this.log('  ./deploy.sh health   # Health check', 'white');
        this.log('  ./deploy.sh backup   # Create backup', 'white');
        this.log('  npm run validate     # Validate setup', 'white');
        console.log();
        
        this.log('📚 Documentation:', 'cyan');
        this.log('  README.md           # Complete guide', 'white');
        this.log('  .env.example        # Configuration reference', 'white');
        console.log();
        
        const startNow = await this.confirm('Start the platform now?', true);
        if (startNow) {
            this.log('🚀 Starting platform...', 'blue');
            try {
                execSync('./start.sh', { stdio: 'inherit' });
            } catch (error) {
                this.log('❌ Failed to start automatically. Please run: npm start', 'red');
            }
        } else {
            this.log('💡 Run "npm start" when ready to begin!', 'cyan');
        }
    }

    async run() {
        try {
            this.showBanner();
            await this.question('Press Enter to begin setup...');
            
            await this.checkPrerequisites();
            await this.setupDirectories();
            await this.configureEnvironment();
            await this.installDependencies();
            await this.finalConfiguration();
            await this.showCompletion();
            
        } catch (error) {
            this.log(`\n❌ Setup failed: ${error.message}`, 'red');
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }
}

// Run the setup wizard
if (require.main === module) {
    const wizard = new SetupWizard();
    wizard.run().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

module.exports = SetupWizard;