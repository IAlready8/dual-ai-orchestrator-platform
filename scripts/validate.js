#!/usr/bin/env node

/**
 * DUAL-AI ORCHESTRATOR PLATFORM - VALIDATION & TESTING FRAMEWORK
 * Comprehensive validation for macOS deployment
 * Tests all components and ensures production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for terminal output
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

class ValidationFramework {
    constructor() {
        this.projectRoot = process.cwd();
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    logHeader(message) {
        console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(80)}`);
        console.log(`${colors.bold}${colors.cyan} ${message}`);
        console.log(`${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
    }

    logTest(testName, passed, message = '') {
        const status = passed ? '✅' : '❌';
        const color = passed ? 'green' : 'red';
        this.log(`${status} ${testName}${message ? ': ' + message : ''}`, color);
        
        this.testResults.tests.push({
            name: testName,
            passed,
            message
        });
        
        if (passed) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
    }

    logWarning(testName, message) {
        this.log(`⚠️  ${testName}: ${message}`, 'yellow');
        this.testResults.warnings++;
    }

    // File Structure Validation
    validateFileStructure() {
        this.logHeader('FILE STRUCTURE VALIDATION');

        const requiredFiles = [
            'package.json',
            'backend/server.js',
            'frontend/index.html',
            '.env.example',
            'README.md',
            'deploy.sh',
            'start.sh',
            'dev.sh',
            '.gitignore',
            'LICENSE'
        ];

        const requiredDirectories = [
            'backend',
            'frontend',
            'scripts'
        ];

        // Check required files
        requiredFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(filePath);
            this.logTest(`File: ${file}`, exists, exists ? 'Found' : 'Missing');
        });

        // Check required directories
        requiredDirectories.forEach(dir => {
            const dirPath = path.join(this.projectRoot, dir);
            const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
            this.logTest(`Directory: ${dir}`, exists, exists ? 'Found' : 'Missing');
        });

        // Check executable permissions on scripts
        const scripts = ['deploy.sh', 'start.sh', 'dev.sh'];
        scripts.forEach(script => {
            const scriptPath = path.join(this.projectRoot, script);
            if (fs.existsSync(scriptPath)) {
                try {
                    fs.accessSync(scriptPath, fs.constants.X_OK);
                    this.logTest(`Executable: ${script}`, true, 'Has execute permission');
                } catch (error) {
                    this.logTest(`Executable: ${script}`, false, 'Missing execute permission');
                }
            }
        });
    }

    // Package.json Validation
    validatePackageJson() {
        this.logHeader('PACKAGE.JSON VALIDATION');

        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // Check required fields
            const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
            requiredFields.forEach(field => {
                const exists = packageJson.hasOwnProperty(field);
                this.logTest(`Package field: ${field}`, exists, exists ? `Found: ${typeof packageJson[field]}` : 'Missing');
            });

            // Check required scripts
            const requiredScripts = ['start', 'dev', 'setup', 'test'];
            requiredScripts.forEach(script => {
                const exists = packageJson.scripts && packageJson.scripts.hasOwnProperty(script);
                this.logTest(`Script: ${script}`, exists, exists ? 'Defined' : 'Missing');
            });

            // Check dependencies
            const requiredDependencies = ['express', 'cors', 'helmet', 'ws', 'uuid'];
            requiredDependencies.forEach(dep => {
                const exists = packageJson.dependencies && packageJson.dependencies.hasOwnProperty(dep);
                this.logTest(`Dependency: ${dep}`, exists, exists ? `Version: ${packageJson.dependencies[dep]}` : 'Missing');
            });

            // Check Node.js version requirement
            if (packageJson.engines && packageJson.engines.node) {
                this.logTest('Node.js version requirement', true, `Specified: ${packageJson.engines.node}`);
            } else {
                this.logWarning('Node.js version requirement', 'Not specified in engines field');
            }

        } catch (error) {
            this.logTest('Package.json parsing', false, error.message);
        }
    }

    // Environment Configuration Validation
    validateEnvironmentConfig() {
        this.logHeader('ENVIRONMENT CONFIGURATION VALIDATION');

        // Check .env.example
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        if (fs.existsSync(envExamplePath)) {
            try {
                const envContent = fs.readFileSync(envExamplePath, 'utf8');
                
                const requiredVars = [
                    'PORT',
                    'NODE_ENV',
                    'OPENAI_API_KEY',
                    'ANTHROPIC_API_KEY',
                    'SESSION_SECRET'
                ];

                requiredVars.forEach(varName => {
                    const exists = envContent.includes(`${varName}=`);
                    this.logTest(`Env var template: ${varName}`, exists, exists ? 'Found in template' : 'Missing from template');
                });

                this.logTest('.env.example parsing', true, 'Template is valid');
            } catch (error) {
                this.logTest('.env.example parsing', false, error.message);
            }
        } else {
            this.logTest('.env.example exists', false, 'Template file missing');
        }

        // Check if .env exists
        const envPath = path.join(this.projectRoot, '.env');
        if (fs.existsSync(envPath)) {
            // Check permissions
            try {
                const stats = fs.statSync(envPath);
                const permissions = (stats.mode & parseInt('777', 8)).toString(8);
                if (permissions === '600') {
                    this.logTest('.env permissions', true, 'Secure permissions (600)');
                } else {
                    this.logWarning('.env permissions', `Permissions: ${permissions} (recommend 600)`);
                }
            } catch (error) {
                this.logTest('.env permissions check', false, error.message);
            }
        } else {
            this.logWarning('.env file', 'Not found (run setup to create)');
        }
    }

    // Dependencies Validation
    validateDependencies() {
        this.logHeader('DEPENDENCIES VALIDATION');

        // Check if node_modules exists
        const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
        const nodeModulesExists = fs.existsSync(nodeModulesPath);
        this.logTest('node_modules directory', nodeModulesExists, nodeModulesExists ? 'Dependencies installed' : 'Run npm install');

        if (nodeModulesExists) {
            // Check key dependencies
            const keyDependencies = [
                'express',
                'cors', 
                'helmet',
                'ws',
                'uuid',
                'bcryptjs',
                'express-rate-limit'
            ];

            keyDependencies.forEach(dep => {
                const depPath = path.join(nodeModulesPath, dep);
                const exists = fs.existsSync(depPath);
                this.logTest(`Dependency installed: ${dep}`, exists, exists ? 'Available' : 'Missing');
            });

            // Check for security vulnerabilities
            try {
                execSync('npm audit --audit-level=high', { stdio: 'pipe' });
                this.logTest('Security audit', true, 'No high-severity vulnerabilities');
            } catch (error) {
                if (error.status === 1) {
                    this.logWarning('Security audit', 'Vulnerabilities found - run npm audit fix');
                } else {
                    this.logTest('Security audit', false, 'Audit failed to run');
                }
            }
        }
    }

    // macOS Optimization Validation
    validateMacOSOptimization() {
        this.logHeader('MACOS OPTIMIZATION VALIDATION');

        // Check platform
        if (process.platform === 'darwin') {
            this.logTest('Platform detection', true, 'Running on macOS');
            
            // Check system memory
            try {
                const os = require('os');
                const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
                if (totalMemory >= 8) {
                    this.logTest('System memory', true, `${totalMemory}GB available`);
                } else {
                    this.logWarning('System memory', `${totalMemory}GB detected - may impact performance`);
                }
            } catch (error) {
                this.logTest('Memory check', false, error.message);
            }
        } else {
            this.logWarning('Platform', `Running on ${process.platform} (optimized for macOS)`);
        }

        // Check for Docker references (should be none)
        const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.dockerignore'];
        const dockerFound = dockerFiles.some(file => 
            fs.existsSync(path.join(this.projectRoot, file))
        );
        this.logTest('Docker-free deployment', !dockerFound, dockerFound ? 'Docker files found' : 'No Docker dependencies');

        // Check Node.js memory settings
        const nodeOptions = process.env.NODE_OPTIONS || '';
        if (nodeOptions.includes('--max-old-space-size')) {
            this.logTest('Memory optimization', true, `NODE_OPTIONS: ${nodeOptions}`);
        } else {
            this.logWarning('Memory optimization', 'NODE_OPTIONS not set - should include --max-old-space-size=2048');
        }
    }

    // Generate Test Report
    generateReport() {
        this.logHeader('VALIDATION REPORT');

        const total = this.testResults.passed + this.testResults.failed;
        const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;

        this.log(`\nTest Results Summary:`, 'bold');
        this.log(`✅ Passed: ${this.testResults.passed}`, 'green');
        this.log(`❌ Failed: ${this.testResults.failed}`, 'red');
        this.log(`⚠️  Warnings: ${this.testResults.warnings}`, 'yellow');
        this.log(`📊 Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');

        if (this.testResults.failed === 0) {
            this.log(`\n🎉 All critical tests passed! Your platform is ready.`, 'green');
        } else {
            this.log(`\n⚠️  ${this.testResults.failed} critical issues found. Please address them.`, 'red');
        }

        if (this.testResults.warnings > 0) {
            this.log(`\n💡 ${this.testResults.warnings} warnings found. Consider addressing them for optimal performance.`, 'yellow');
        }

        // Write detailed report to file
        this.writeDetailedReport();
    }

    writeDetailedReport() {
        const reportPath = path.join(this.projectRoot, 'validation-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                warnings: this.testResults.warnings,
                passRate: this.testResults.passed + this.testResults.failed > 0 
                    ? ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)
                    : 0
            },
            tests: this.testResults.tests,
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                projectRoot: this.projectRoot
            }
        };

        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            this.log(`\n📄 Detailed report saved to: validation-report.json`, 'cyan');
        } catch (error) {
            this.log(`\n❌ Failed to save detailed report: ${error.message}`, 'red');
        }
    }

    // Main validation runner
    async runAllValidations() {
        this.log('🔍 Starting comprehensive validation...', 'cyan');
        
        try {
            this.validateFileStructure();
            this.validatePackageJson();
            this.validateEnvironmentConfig();
            this.validateDependencies();
            this.validateMacOSOptimization();
            
        } catch (error) {
            this.logTest('Validation framework', false, error.message);
        } finally {
            this.generateReport();
        }
    }
}

// CLI interface
if (require.main === module) {
    const validator = new ValidationFramework();
    
    const command = process.argv[2] || 'all';
    
    switch (command) {
        case 'all':
            validator.runAllValidations();
            break;
        case 'files':
            validator.validateFileStructure();
            validator.generateReport();
            break;
        case 'deps':
            validator.validateDependencies();
            validator.generateReport();
            break;
        case 'env':
            validator.validateEnvironmentConfig();
            validator.generateReport();
            break;
        case 'help':
            console.log(`\nDual-AI Orchestrator Platform Validation Tool\n\nUsage: node validate.js [command]\n\nCommands:\n  all       - Run all validation tests (default)\n  files     - Validate file structure only\n  deps      - Validate dependencies only\n  env       - Validate environment config only\n  help      - Show this help message\n\nExamples:\n  node validate.js all      # Complete validation\n  npm run validate          # Run via npm script\n            `);
            break;
        default:
            console.log(`Unknown command: ${command}. Use 'help' for usage information.`);
            process.exit(1);
    }
}

module.exports = ValidationFramework;