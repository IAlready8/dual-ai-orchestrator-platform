# 🤖 Dual-AI Orchestrator Platform

**Enterprise-grade AI collaboration platform enabling seamless interaction between OpenAI and Claude/Anthropic models with real-time multi-agent orchestration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey)](https://www.apple.com/macos/)
[![No Docker](https://img.shields.io/badge/deployment-native%20macOS-blue)]()

---

## 🚀 **WHAT IS THIS?**

This is a **production-ready AI collaboration platform** that enables multiple AI models to work together seamlessly. Think of it as a **command center for AI collaboration** where OpenAI's GPT models and Anthropic's Claude models can collaborate on complex tasks in real-time.

### ✨ **Core Capabilities**

- **🔄 Dual-API Integration**: Native support for both OpenAI and Anthropic APIs
- **🧠 Multi-Agent Orchestration**: AI agents collaborate with individual memory and context
- **⚡ Real-time Communication**: WebSocket-powered live collaboration interface
- **🔒 Enterprise Security**: Rate limiting, input validation, and secure API key management
- **📊 Advanced Analytics**: Real-time metrics, cost tracking, and performance monitoring
- **🎨 Beautiful Interface**: Modern, responsive UI with dark mode support
- **💻 macOS Optimized**: Native deployment without Docker overhead

---

## 🚀 **QUICK START**

### **Prerequisites**
- **Node.js 18+** (recommended: latest LTS)
- **macOS** (optimized for M1/M2 Macs and Intel Macs)
- **OpenAI API Key** (get from [OpenAI Platform](https://platform.openai.com/api-keys))
- **Anthropic API Key** (get from [Anthropic Console](https://console.anthropic.com/))

### **Installation**

```bash
# Clone the repository
git clone https://github.com/IAlready8/dual-ai-orchestrator-platform.git
cd dual-ai-orchestrator-platform

# Option 1: Interactive Setup (Recommended)
npm run setup

# Option 2: Manual Setup
cp .env.example .env
# Edit .env with your API keys
npm install

# Start the platform
npm start
```

### **Access Your Platform**

- **Web Interface**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Statistics**: http://localhost:3001/api/stats

---

## 🎯 **KEY FEATURES**

### **🔄 Dual-API Integration**
- **OpenAI Models**: GPT-4, GPT-4o, GPT-4-turbo, GPT-3.5-turbo
- **Anthropic Models**: Claude 3.5 Sonnet, Claude 3 Sonnet, Claude 3 Haiku, Claude 3 Opus
- **Intelligent Routing**: Automatic provider selection based on task requirements
- **Fallback Support**: Automatic switching on provider errors
- **Unified Interface**: Single platform for managing both providers

### **🧠 Multi-Agent Orchestration**
- **Individual Agent Memory**: Each agent maintains its own conversation history and context
- **Customizable Personalities**: Configure agents with specific expertise and instructions
- **Provider Preferences**: Assign preferred AI providers to each agent
- **Turn-based Processing**: Intelligent agent sequencing and iteration control
- **Context Management**: Automatic context window optimization

### **⚡ Real-time Features**
- **WebSocket Communication**: Live updates and real-time collaboration
- **Session Persistence**: Save, resume, and manage conversation sessions
- **Live Metrics**: Real-time performance monitoring and analytics
- **Multi-client Support**: Multiple users can collaborate simultaneously
- **Auto-save**: Automatic conversation backups and recovery

### **🔒 Enterprise Security**
- **Rate Limiting**: Configurable per-provider and global rate limits
- **Input Validation**: Comprehensive request validation and sanitization
- **API Key Security**: Encrypted storage and secure transmission
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: Helmet.js protection with Content Security Policy
- **Session Security**: UUID-based sessions with automatic cleanup

### **📊 Advanced Analytics**
- **Usage Metrics**: Request counts, response times, and error rates
- **Cost Tracking**: Token usage and estimated API costs
- **Performance Analytics**: Agent performance and system metrics
- **Health Monitoring**: Continuous system health checks
- **Export Capabilities**: Multiple export formats for conversations
- **Historical Data**: Comprehensive usage and performance history

### **🎨 Beautiful Interface**
- **Modern Design**: Clean, responsive interface with intuitive controls
- **Dark Mode Support**: Automatic dark/light mode detection
- **Real-time Updates**: Live conversation display and status indicators
- **Agent Configuration**: Visual agent setup and customization
- **Progress Tracking**: Visual progress indicators and collaboration status
- **Template System**: Pre-built collaboration templates

---

## 💻 **MACOS OPTIMIZATION**

### **Why No Docker?**
This platform is specifically optimized for **native macOS deployment** to provide:
- **Maximum Performance**: Direct Node.js execution without containerization overhead
- **Resource Efficiency**: Optimized memory usage for macOS systems
- **Simplified Deployment**: No container management complexity
- **Native Integration**: Leverages macOS-specific optimizations

### **Memory Management**
- **Optimized for 8GB+ macOS systems** (MacBook M2, Mac Pro, etc.)
- **Conservative memory limits**: `--max-old-space-size=2048`
- **Efficient garbage collection**: Optimized for macOS memory management
- **Resource monitoring**: Real-time memory and CPU usage tracking

---

## 🛠️ **AVAILABLE COMMANDS**

### **Setup & Configuration**
```bash
npm run setup              # Interactive setup wizard
./deploy.sh setup         # Comprehensive deployment setup
```

### **Starting the Platform**
```bash
npm start                  # Production mode
./start.sh                # Quick start script
npm run dev               # Development mode with auto-restart
./dev.sh                  # Development with nodemon
```

### **Management & Maintenance**
```bash
./deploy.sh stop          # Stop the server
./deploy.sh restart       # Restart the server
./deploy.sh status        # Check system status
./deploy.sh health        # Comprehensive health check
./deploy.sh backup        # Create backup
./deploy.sh clean         # Clean project files
./deploy.sh update        # Update dependencies
```

### **Testing & Validation**
```bash
npm test                  # Run comprehensive tests
npm run validate          # Full system validation
./deploy.sh health        # Health monitoring
```

---

## 🎯 **USAGE EXAMPLES**

### **Basic Collaboration**
1. **Configure API Keys**: Add OpenAI and/or Anthropic API keys in `.env`
2. **Set Project Goal**: "Design a mobile app for productivity"
3. **Configure Agents**: Set up agents with different expertise (UI/UX Designer, Developer, Product Manager)
4. **Start Collaboration**: Watch AI agents work together to achieve your goal

### **Research Collaboration**
1. **Use Research Template**: Select "Collaborative Research" template
2. **Set Research Goal**: "Analyze AI trends in healthcare"
3. **Configure Specialist Agents**: Research Analyst (Claude) + Industry Expert (OpenAI)
4. **Export Results**: Generate comprehensive research report

### **Product Development**
1. **Use Product Template**: Select "Product Development" workflow
2. **Define Product Goal**: "Create SaaS platform for small businesses"
3. **Set Team Roles**: Product Manager (OpenAI) + Tech Lead (Claude) + Market Analyst (OpenAI)
4. **Iterate and Refine**: Track progress through multiple development iterations

---

## 📞 **SUPPORT & COMMUNITY**

- **GitHub Repository**: [https://github.com/IAlready8/dual-ai-orchestrator-platform](https://github.com/IAlready8/dual-ai-orchestrator-platform)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/IAlready8/dual-ai-orchestrator-platform/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/IAlready8/dual-ai-orchestrator-platform/issues) with "enhancement" label
- **Documentation**: Complete guides in README.md and QUICKSTART.md

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **GET STARTED TODAY!**

Your Dual-AI Orchestrator Platform is ready to revolutionize how you work with AI. Start by running:

```bash
git clone https://github.com/IAlready8/dual-ai-orchestrator-platform.git
cd dual-ai-orchestrator-platform
npm run setup
npm start
```

Then open http://localhost:3001 and **start collaborating with the world's most advanced AI models!**

---

### 🏆 **Built for Excellence. Optimized for macOS. Ready for Production.**

**Experience the future of AI collaboration today!** 🚀
