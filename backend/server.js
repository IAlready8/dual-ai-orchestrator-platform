#!/usr/bin/env node

/**
 * DUAL-AI ORCHESTRATOR PLATFORM - MAIN SERVER
 * Enterprise-grade AI collaboration platform with OpenAI + Anthropic integration
 * Real-time multi-agent orchestration with WebSocket support
 * Optimized for macOS deployment (NO DOCKER)
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Global state
const sessions = new Map();
const metrics = {
    startTime: Date.now(),
    requests: 0,
    openaiRequests: 0,
    anthropicRequests: 0,
    errors: 0,
    activeSessions: 0,
    totalSessions: 0
};

// Dual API Client for OpenAI and Anthropic
class DualAPIClient {
    constructor() {
        this.openaiKey = process.env.OPENAI_API_KEY;
        this.anthropicKey = process.env.ANTHROPIC_API_KEY;
        this.rateLimits = {
            openai: {
                requests: 0,
                resetTime: Date.now() + 60000,
                limit: parseInt(process.env.OPENAI_RATE_LIMIT) || 60
            },
            anthropic: {
                requests: 0,
                resetTime: Date.now() + 60000,
                limit: parseInt(process.env.ANTHROPIC_RATE_LIMIT) || 60
            }
        };
    }

    checkRateLimit(provider) {
        const limit = this.rateLimits[provider];
        if (Date.now() > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = Date.now() + 60000;
        }
        return limit.requests < limit.limit;
    }

    async callOpenAI(messages, model = 'gpt-4', options = {}) {
        if (!this.openaiKey) {
            throw new Error('OpenAI API key not configured');
        }

        if (!this.checkRateLimit('openai')) {
            throw new Error('OpenAI rate limit exceeded');
        }

        this.rateLimits.openai.requests++;
        metrics.openaiRequests++;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000,
                ...options
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async callAnthropic(messages, model = 'claude-3-5-sonnet-20241022', options = {}) {
        if (!this.anthropicKey) {
            throw new Error('Anthropic API key not configured');
        }

        if (!this.checkRateLimit('anthropic')) {
            throw new Error('Anthropic rate limit exceeded');
        }

        this.rateLimits.anthropic.requests++;
        metrics.anthropicRequests++;

        // Convert OpenAI format to Anthropic format
        const systemMessages = messages.filter(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.anthropicKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7,
                system: systemMessages.map(m => m.content).join('\n'),
                messages: conversationMessages,
                ...options
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Convert back to OpenAI format for consistency
        return {
            choices: [{
                message: {
                    role: 'assistant',
                    content: result.content[0].text
                }
            }],
            usage: result.usage
        };
    }

    async callAPI(provider, messages, model, options = {}) {
        try {
            if (provider === 'openai') {
                return await this.callOpenAI(messages, model, options);
            } else if (provider === 'anthropic') {
                return await this.callAnthropic(messages, model, options);
            } else {
                throw new Error(`Unsupported provider: ${provider}`);
            }
        } catch (error) {
            metrics.errors++;
            throw error;
        }
    }
}

// Multi-Agent Orchestrator
class DualAPIOrchestrator {
    constructor() {
        this.apiClient = new DualAPIClient();
        this.agents = new Map();
    }

    createAgent(config) {
        const agent = {
            id: uuidv4(),
            name: config.name || 'Agent',
            role: config.role || 'Assistant',
            provider: config.provider || 'openai',
            model: config.model || (config.provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4'),
            instructions: config.instructions || 'You are a helpful AI assistant.',
            memory: [],
            created: Date.now()
        };
        
        this.agents.set(agent.id, agent);
        return agent;
    }

    async executeAgent(agentId, message, context = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }

        // Build conversation context
        const messages = [
            { role: 'system', content: agent.instructions },
            ...agent.memory,
            { role: 'user', content: message }
        ];

        // Call appropriate API
        const response = await this.apiClient.callAPI(
            agent.provider,
            messages,
            agent.model,
            context.options || {}
        );

        const assistantMessage = response.choices[0].message;
        
        // Update agent memory
        agent.memory.push(
            { role: 'user', content: message },
            assistantMessage
        );

        // Limit memory to prevent context overflow
        if (agent.memory.length > 20) {
            agent.memory = agent.memory.slice(-20);
        }

        return {
            agent: {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                provider: agent.provider
            },
            response: assistantMessage.content,
            usage: response.usage
        };
    }

    async collaborateAgents(agentIds, goal, iterations = 3) {
        const collaboration = {
            id: uuidv4(),
            goal,
            agents: agentIds,
            conversation: [],
            started: Date.now()
        };

        let currentMessage = `Goal: ${goal}\n\nLet's work together to achieve this goal. Please provide your initial thoughts and approach.`;

        for (let i = 0; i < iterations; i++) {
            for (const agentId of agentIds) {
                try {
                    const result = await this.executeAgent(agentId, currentMessage);
                    
                    collaboration.conversation.push({
                        iteration: i + 1,
                        timestamp: Date.now(),
                        ...result
                    });

                    // Next message includes previous responses
                    currentMessage = `Previous responses:\n${collaboration.conversation
                        .slice(-agentIds.length)
                        .map(r => `${r.agent.name}: ${r.response}`)
                        .join('\n\n')}\n\nPlease build upon these ideas and continue working toward our goal.`;
                        
                } catch (error) {
                    collaboration.conversation.push({
                        iteration: i + 1,
                        timestamp: Date.now(),
                        agent: { id: agentId },
                        error: error.message
                    });
                }
            }
        }

        collaboration.completed = Date.now();
        return collaboration;
    }
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

// Compression
app.use(compression());

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.GLOBAL_RATE_LIMIT) || 100,
    message: 'Too many requests from this IP'
});
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    metrics.requests++;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Initialize orchestrator
const orchestrator = new DualAPIOrchestrator();

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes

// Health check
app.get('/health', (req, res) => {
    const uptime = Date.now() - metrics.startTime;
    res.json({
        status: 'healthy',
        uptime: uptime,
        timestamp: Date.now(),
        version: '2.0.0',
        environment: NODE_ENV,
        providers: {
            openai: !!process.env.OPENAI_API_KEY,
            anthropic: !!process.env.ANTHROPIC_API_KEY
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    });
});

// System statistics
app.get('/api/stats', (req, res) => {
    res.json({
        ...metrics,
        activeSessions: sessions.size,
        uptime: Date.now() - metrics.startTime,
        rateLimits: orchestrator.apiClient.rateLimits
    });
});

// Create agent
app.post('/api/agents', (req, res) => {
    try {
        const agent = orchestrator.createAgent(req.body);
        res.json({ success: true, agent });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Execute single agent
app.post('/api/agents/:id/execute', async (req, res) => {
    try {
        const { message, options } = req.body;
        const result = await orchestrator.executeAgent(req.params.id, message, { options });
        res.json({ success: true, result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start collaboration
app.post('/api/collaborate', async (req, res) => {
    try {
        const { agentIds, goal, iterations } = req.body;
        const collaboration = await orchestrator.collaborateAgents(agentIds, goal, iterations);
        res.json({ success: true, collaboration });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List agents
app.get('/api/agents', (req, res) => {
    const agents = Array.from(orchestrator.agents.values());
    res.json({ success: true, agents });
});

// WebSocket Server for real-time communication
const wss = new WebSocket.Server({ 
    port: WS_PORT,
    maxPayload: 16 * 1024 * 1024 // 16MB
});

wss.on('connection', (ws, req) => {
    const sessionId = uuidv4();
    const session = {
        id: sessionId,
        ws,
        ip: req.socket.remoteAddress,
        created: Date.now(),
        lastActivity: Date.now()
    };
    
    sessions.set(sessionId, session);
    metrics.activeSessions = sessions.size;
    metrics.totalSessions++;
    
    console.log(`WebSocket connected: ${sessionId} (${sessions.size} active)`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        sessionId,
        timestamp: Date.now()
    }));
    
    ws.on('message', async (data) => {
        try {
            session.lastActivity = Date.now();
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                case 'execute_agent':
                    const result = await orchestrator.executeAgent(
                        message.agentId,
                        message.message,
                        message.context || {}
                    );
                    ws.send(JSON.stringify({
                        type: 'agent_response',
                        requestId: message.requestId,
                        result,
                        timestamp: Date.now()
                    }));
                    break;
                    
                case 'start_collaboration':
                    const collaboration = await orchestrator.collaborateAgents(
                        message.agentIds,
                        message.goal,
                        message.iterations || 3
                    );
                    ws.send(JSON.stringify({
                        type: 'collaboration_result',
                        requestId: message.requestId,
                        collaboration,
                        timestamp: Date.now()
                    }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type',
                        timestamp: Date.now()
                    }));
            }
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message,
                timestamp: Date.now()
            }));
        }
    });
    
    ws.on('close', () => {
        sessions.delete(sessionId);
        metrics.activeSessions = sessions.size;
        console.log(`WebSocket disconnected: ${sessionId} (${sessions.size} active)`);
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for ${sessionId}:`, error);
        sessions.delete(sessionId);
        metrics.activeSessions = sessions.size;
    });
});

// Session cleanup interval
setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes
    
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.lastActivity > timeout) {
            session.ws.terminate();
            sessions.delete(sessionId);
        }
    }
    
    metrics.activeSessions = sessions.size;
}, 5 * 60 * 1000); // Check every 5 minutes

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    metrics.errors++;
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    wss.close(() => {
        server.close(() => {
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    wss.close(() => {
        server.close(() => {
            process.exit(0);
        });
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
🚀 Dual-AI Orchestrator Platform running!`);
    console.log(`📡 HTTP Server: http://localhost:${PORT}`);
    console.log(`🔗 WebSocket Server: ws://localhost:${WS_PORT}`);
    console.log(`🧠 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🤖 Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🍎 Environment: ${NODE_ENV} (macOS optimized)`);
    console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used\n`);
});

module.exports = { app, server, orchestrator };