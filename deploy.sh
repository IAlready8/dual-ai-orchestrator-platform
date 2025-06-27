#!/bin/bash

# DUAL-AI ORCHESTRATOR PLATFORM - DEPLOYMENT SCRIPT
# Comprehensive deployment and management for macOS
# NO DOCKER - Native macOS deployment for maximum performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Dual-AI Orchestrator Platform"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3001
WS_PORT=3002
PID_FILE="$PROJECT_DIR/.server.pid"
LOG_DIR="$PROJECT_DIR/logs"
BACKUP_DIR="$PROJECT_DIR/backups"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$PROJECT_DIR/.env.example"

# Logging function
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Banner
show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    🤖 DUAL-AI ORCHESTRATOR PLATFORM 🤖                     ║"
    echo "║                                                                              ║"
    echo "║          Enterprise AI Collaboration • OpenAI + Anthropic                   ║"
    echo "║                      macOS Optimized • NO DOCKER                            ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if running on macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_warning "This script is optimized for macOS but can run on other Unix systems"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        log_info "Install Node.js from: https://nodejs.org/ (18+ recommended)"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 18+ is required (found: $(node --version))"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
    log_info "Node.js: $(node --version)"
    log_info "npm: $(npm --version)"
    log_info "Platform: $(uname -s) $(uname -m)"
}

# Setup project directories
setup_directories() {
    log "Setting up project directories..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$PROJECT_DIR/backend"
    mkdir -p "$PROJECT_DIR/frontend"
    mkdir -p "$PROJECT_DIR/scripts"
    mkdir -p "$PROJECT_DIR/tests"
    
    log_success "Directories created"
}

# Environment setup
setup_environment() {
    log "Setting up environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_EXAMPLE" ]; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            log_success "Created .env from template"
            
            # Set secure permissions
            chmod 600 "$ENV_FILE"
            log_success "Set secure permissions on .env file"
            
            log_warning "Please edit .env file with your API keys:"
            log_info "  - OPENAI_API_KEY=sk-your-openai-key-here"
            log_info "  - ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here"
            log_info "  - SESSION_SECRET=your-secure-random-string"
            
        else
            log_error ".env.example not found!"
            exit 1
        fi
    else
        log_success "Environment file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found!"
        exit 1
    fi
    
    # Install with memory optimization for macOS
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm install
    
    log_success "Dependencies installed successfully"
    
    # Run security audit
    if npm audit --audit-level=high > /dev/null 2>&1; then
        log_success "Security audit passed"
    else
        log_warning "Security vulnerabilities found - run 'npm audit fix'"
    fi
}

# Start server
start_server() {
    log "Starting Dual-AI Orchestrator Platform..."
    
    cd "$PROJECT_DIR"
    
    # Check if already running
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_warning "Server is already running (PID: $(cat "$PID_FILE"))"
        return 0
    fi
    
    # Set memory optimization for macOS
    export NODE_OPTIONS="--max-old-space-size=2048"
    
    # Start server in background
    nohup node backend/server.js > "$LOG_DIR/app.log" 2>&1 & echo $! > "$PID_FILE"
    
    # Wait for server to start
    sleep 3
    
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_success "Server started successfully!"
        log_info "PID: $(cat "$PID_FILE")"
        log_info "Web Interface: http://localhost:$PORT"
        log_info "WebSocket: ws://localhost:$WS_PORT"
        log_info "Logs: $LOG_DIR/app.log"
    else
        log_error "Failed to start server"
        if [ -f "$LOG_DIR/app.log" ]; then
            log_error "Last log entries:"
            tail -10 "$LOG_DIR/app.log"
        fi
        exit 1
    fi
}

# Stop server
stop_server() {
    log "Stopping Dual-AI Orchestrator Platform..."
    
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
                sleep 1
            fi
            
            rm -f "$PID_FILE"
            log_success "Server stopped"
        else
            log_warning "Server was not running"
            rm -f "$PID_FILE"
        fi
    else
        log_warning "PID file not found - server may not be running"
    fi
}

# Restart server
restart_server() {
    log "Restarting Dual-AI Orchestrator Platform..."
    stop_server
    sleep 2
    start_server
}

# Check server status
check_status() {
    log "Checking server status..."
    
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        local pid=$(cat "$PID_FILE")
        log_success "Server is running (PID: $pid)"
        
        # Get memory usage
        local memory=$(ps -o rss= -p "$pid" | awk '{print int($1/1024)}' 2>/dev/null || echo "unknown")
        log_info "Memory usage: ${memory}MB"
        
        # Get CPU usage
        local cpu=$(ps -o %cpu= -p "$pid" 2>/dev/null || echo "unknown")
        log_info "CPU usage: ${cpu}%"
        
        # Get uptime
        local start_time=$(ps -o lstart= -p "$pid" 2>/dev/null || echo "unknown")
        log_info "Started: $start_time"
        
        # Check if ports are accessible
        if curl -s "http://localhost:$PORT/health" > /dev/null; then
            log_success "HTTP server responding on port $PORT"
        else
            log_warning "HTTP server not responding on port $PORT"
        fi
        
    else
        log_error "Server is not running"
        return 1
    fi
}

# Health check
health_check() {
    log "Running comprehensive health check..."
    
    # Check server status
    if ! check_status; then
        return 1
    fi
    
    # Check API endpoints
    local health_response=$(curl -s "http://localhost:$PORT/health" || echo "")
    if [ -n "$health_response" ]; then
        log_success "Health endpoint responding"
        
        # Parse JSON response (simplified)
        if echo "$health_response" | grep -q '"status":"healthy"'; then
            log_success "Server reports healthy status"
        else
            log_warning "Server health status unclear"
        fi
    else
        log_error "Health endpoint not responding"
        return 1
    fi
    
    # Check WebSocket port
    if nc -z localhost "$WS_PORT" 2>/dev/null; then
        log_success "WebSocket port $WS_PORT is open"
    else
        log_warning "WebSocket port $WS_PORT not accessible"
    fi
    
    # Check environment
    if [ -f "$ENV_FILE" ]; then
        if grep -q "OPENAI_API_KEY=sk-" "$ENV_FILE" 2>/dev/null; then
            log_success "OpenAI API key configured"
        else
            log_warning "OpenAI API key not configured"
        fi
        
        if grep -q "ANTHROPIC_API_KEY=sk-ant-" "$ENV_FILE" 2>/dev/null; then
            log_success "Anthropic API key configured"
        else
            log_warning "Anthropic API key not configured"
        fi
    fi
    
    # Check logs for errors
    if [ -f "$LOG_DIR/app.log" ]; then
        local error_count=$(grep -c "ERROR\|Error\|error" "$LOG_DIR/app.log" 2>/dev/null || echo "0")
        if [ "$error_count" -eq 0 ]; then
            log_success "No errors in recent logs"
        else
            log_warning "Found $error_count error(s) in logs"
        fi
    fi
    
    log_success "Health check completed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/backup_$timestamp.tar.gz"
    
    # Create backup excluding node_modules and logs
    tar -czf "$backup_file" \
        --exclude="node_modules" \
        --exclude="logs" \
        --exclude=".git" \
        --exclude="backups" \
        -C "$(dirname "$PROJECT_DIR")" \
        "$(basename "$PROJECT_DIR")"
    
    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Backup created: $backup_file ($size)"
        
        # Cleanup old backups (keep last 10)
        ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
        log_info "Old backups cleaned up (keeping last 10)"
    else
        log_error "Failed to create backup"
        return 1
    fi
}

# Clean project
clean_project() {
    log "Cleaning project..."
    
    # Stop server first
    stop_server
    
    # Clean node_modules
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        log_success "Removed node_modules"
    fi
    
    # Clean logs
    if [ -d "$LOG_DIR" ]; then
        rm -f "$LOG_DIR"/*.log
        log_success "Cleaned logs"
    fi
    
    # Clean temporary files
    find "$PROJECT_DIR" -name "*.tmp" -delete 2>/dev/null || true
    find "$PROJECT_DIR" -name ".DS_Store" -delete 2>/dev/null || true
    
    log_success "Project cleaned"
}

# Update dependencies
update_dependencies() {
    log "Updating dependencies..."
    
    cd "$PROJECT_DIR"
    
    # Create backup first
    if [ -f "package-lock.json" ]; then
        cp package-lock.json package-lock.json.backup
        log_info "Backed up package-lock.json"
    fi
    
    # Update dependencies
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm update
    
    # Security audit
    npm audit fix --force 2>/dev/null || true
    
    log_success "Dependencies updated"
    log_warning "Please test thoroughly after dependency updates"
}

# Show logs
show_logs() {
    local lines=${1:-50}
    
    if [ -f "$LOG_DIR/app.log" ]; then
        log "Showing last $lines lines of application log:"
        echo -e "${CYAN}────────────────────────────────────────────────────────────────────────────────${NC}"
        tail -n "$lines" "$LOG_DIR/app.log"
        echo -e "${CYAN}────────────────────────────────────────────────────────────────────────────────${NC}"
    else
        log_warning "No log file found at $LOG_DIR/app.log"
    fi
}

# Follow logs
follow_logs() {
    if [ -f "$LOG_DIR/app.log" ]; then
        log "Following application logs (Ctrl+C to stop):"
        echo -e "${CYAN}────────────────────────────────────────────────────────────────────────────────${NC}"
        tail -f "$LOG_DIR/app.log"
    else
        log_warning "No log file found at $LOG_DIR/app.log"
    fi
}

# Full setup
full_setup() {
    show_banner
    check_macos
    check_prerequisites
    setup_directories
    setup_environment
    install_dependencies
    
    log_success "Setup completed successfully!"
    log_info "Next steps:"
    log_info "  1. Edit .env file with your API keys"
    log_info "  2. Run: ./deploy.sh start"
    log_info "  3. Open: http://localhost:$PORT"
}

# Usage information
show_usage() {
    show_banner
    echo -e "${YELLOW}Usage: $0 {command}${NC}"
    echo
    echo -e "${CYAN}Setup & Management:${NC}"
    echo "  setup          - Complete project setup"
    echo "  start          - Start the server"
    echo "  stop           - Stop the server"
    echo "  restart        - Restart the server"
    echo "  status         - Check server status"
    echo "  health         - Run health check"
    echo
    echo -e "${CYAN}Maintenance:${NC}"
    echo "  backup         - Create project backup"
    echo "  clean          - Clean project files"
    echo "  update         - Update dependencies"
    echo
    echo -e "${CYAN}Monitoring:${NC}"
    echo "  logs [lines]   - Show recent logs (default: 50)"
    echo "  follow         - Follow logs in real-time"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo "  $0 setup       # Initial setup"
    echo "  $0 start       # Start server"
    echo "  $0 health      # Check health"
    echo "  $0 logs 100    # Show last 100 log lines"
    echo
}

# Main command handling
case "${1:-}" in
    setup)
        full_setup
        ;;
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        check_status
        ;;
    health)
        health_check
        ;;
    backup)
        create_backup
        ;;
    clean)
        clean_project
        ;;
    update)
        update_dependencies
        ;;
    logs)
        show_logs "${2:-50}"
        ;;
    follow)
        follow_logs
        ;;
    help|--help|-h)
        show_usage
        ;;
    "")
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac