# 🚀 Quick Start Guide - Dual-AI Orchestrator Platform

**Get your AI collaboration platform running in minutes!**

---

## ⚡ **FASTEST SETUP** (30 seconds)

```bash
# Clone and start immediately
git clone https://github.com/IAlready8/dual-ai-orchestrator-platform.git
cd dual-ai-orchestrator-platform
./start.sh
```

**Done!** Open http://localhost:3001

---

## 🎯 **STEP-BY-STEP SETUP**

### **1. Prerequisites**
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **macOS** (optimized) or any Unix system
- **API Keys** from OpenAI and/or Anthropic

### **2. Installation**

```bash
# Clone repository
git clone https://github.com/IAlready8/dual-ai-orchestrator-platform.git
cd dual-ai-orchestrator-platform

# Interactive setup (recommended)
npm run setup

# OR manual setup
cp .env.example .env
npm install
```

### **3. Configuration**

Edit `.env` file with your API keys:

```bash
# Required: At least one API key
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Optional: Server settings
PORT=3001
NODE_ENV=production
SESSION_SECRET=your-secure-session-secret
```

### **4. Start Platform**

```bash
# Production mode
npm start

# OR quick start
./start.sh

# OR development mode
npm run dev
```

### **5. Access Your Platform**

- **Web Interface**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Stats**: http://localhost:3001/api/stats

---

## 🔑 **GET API KEYS**

### **OpenAI API Key**
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key (starts with `sk-`)
4. Add to `.env`: `OPENAI_API_KEY=sk-your-key`

### **Anthropic API Key**
1. Visit: https://console.anthropic.com/
2. Go to "API Keys" section
3. Create new key
4. Copy key (starts with `sk-ant-`)
5. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-your-key`

---

## 🤖 **FIRST COLLABORATION**

### **Create Your First Agents**
1. Open web interface at http://localhost:3001
2. Fill in agent details:
   - **Name**: "Research Assistant"
   - **Role**: "Data Analyst"
   - **Provider**: OpenAI or Anthropic
   - **Instructions**: "You are an expert at analyzing data and providing insights"
3. Click "Create Agent"
4. Repeat to create 2-3 agents with different roles

### **Start Collaboration**
1. Enter collaboration goal: "Analyze the future of AI in healthcare"
2. Choose iterations: 3 rounds
3. Click "Start Collaboration"
4. Watch AI agents work together in real-time!

---

## 🛠️ **COMMON COMMANDS**

```bash
# Management
./deploy.sh status        # Check if running
./deploy.sh health        # Health check
./deploy.sh restart       # Restart server
./deploy.sh stop          # Stop server

# Development
npm run dev              # Auto-restart dev mode
npm test                 # Run validation tests
npm run validate         # Full system check

# Maintenance
./deploy.sh backup       # Create backup
./deploy.sh clean        # Clean project
./deploy.sh update       # Update dependencies
```

---

## 📊 **MONITOR YOUR PLATFORM**

### **Real-time Monitoring**
- **System Status**: Built into web interface
- **Live Metrics**: Request counts, active sessions
- **Health Endpoint**: http://localhost:3001/health
- **Detailed Stats**: http://localhost:3001/api/stats

### **Logs & Debugging**
```bash
# View recent logs
./deploy.sh logs

# Follow logs in real-time
./deploy.sh follow

# Check system status
./deploy.sh status
```

---

## 🔧 **TROUBLESHOOTING**

### **Server Won't Start**
```bash
# Check if port is in use
lsof -i :3001

# Check environment
cat .env

# Validate setup
npm run validate

# Check logs
./deploy.sh logs
```

### **API Keys Not Working**
- Verify keys start with `sk-` (OpenAI) or `sk-ant-` (Anthropic)
- Check API key permissions and billing
- Ensure no extra spaces in `.env` file
- Restart server after changing keys

### **WebSocket Connection Issues**
- Check if port 3002 is available
- Verify firewall settings
- Try refreshing the browser

### **Memory Issues on macOS**
```bash
# Check current memory usage
top -pid $(pgrep node)

# Increase memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

---

## 🎯 **EXAMPLE USE CASES**

### **1. Research Project**
- **Goal**: "Analyze renewable energy trends for 2025"
- **Agents**: Research Analyst (Claude) + Market Expert (OpenAI)
- **Outcome**: Comprehensive research report

### **2. Product Development**
- **Goal**: "Design a mobile app for productivity"
- **Agents**: UX Designer (OpenAI) + Developer (Claude) + PM (OpenAI)
- **Outcome**: Product roadmap and feature specs

### **3. Content Creation**
- **Goal**: "Create a marketing campaign for a SaaS product"
- **Agents**: Copywriter (Claude) + Strategist (OpenAI) + Designer (Claude)
- **Outcome**: Complete marketing strategy

### **4. Technical Analysis**
- **Goal**: "Evaluate cloud architecture options"
- **Agents**: Cloud Architect (OpenAI) + Security Expert (Claude)
- **Outcome**: Architecture recommendations

---

## 🚀 **ADVANCED FEATURES**

### **Custom Templates**
Create reusable agent configurations:
1. Configure agents for specific use cases
2. Save configurations for repeated use
3. Share templates with team members

### **Collaboration Analytics**
- Track agent performance
- Monitor collaboration effectiveness
- Export conversation history
- Analyze response patterns

### **Integration Options**
- REST API for external integrations
- WebSocket for real-time applications
- Export capabilities for downstream tools

---

## 📞 **GET HELP**

- **Documentation**: Complete guides in README.md
- **Issues**: [GitHub Issues](https://github.com/IAlready8/dual-ai-orchestrator-platform/issues)
- **Health Check**: `./deploy.sh health`
- **Validation**: `npm run validate`

---

## 🎉 **SUCCESS!**

You now have a production-ready AI collaboration platform! Your setup enables:

✅ **Dual-API Integration** - OpenAI + Anthropic working together  
✅ **Real-time Collaboration** - Live AI conversations  
✅ **Enterprise Security** - Rate limiting and validation  
✅ **Beautiful Interface** - Modern, responsive UI  
✅ **macOS Optimized** - Native performance without Docker  
✅ **Production Ready** - Comprehensive monitoring and management  

**Start collaborating with the world's most advanced AI models today!** 🚀

---

### 🏆 **Built for Excellence. Ready for Production.**

**Experience the future of AI collaboration!**