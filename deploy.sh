#!/usr/bin/env bash
# ==============================================================================
# VASTU RITAM - Automated Local Deployment & Environment Orchestration Script
# ==============================================================================
# Usage:
#   ./deploy.sh          # Default: Build & launch production containers (app + db)
#   ./deploy.sh up       # Start production containers in background
#   ./deploy.sh dev      # Start development containers with live reload
#   ./deploy.sh local    # Start local native dev server without Docker (npm run dev)
#   ./deploy.sh test     # Run all integration & unit tests
#   ./deploy.sh logs     # Tail live container logs
#   ./deploy.sh status   # Check health and container statuses
#   ./deploy.sh down     # Gracefully stop all containers
#   ./deploy.sh clean    # Stop and clean containers, volumes, and dangling images
# ==============================================================================

set -eo pipefail

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

APP_NAME="Vastu Ritam"
DEFAULT_PORT="3000"
DEFAULT_DB_PORT="5432"

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_ok() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_err() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "=================================================================="
  echo "  VASTU RITAM - Classical Vastu Research & Consultation Platform  "
  echo "       Containerized Environment & Local Deployment Manager       "
  echo "=================================================================="
  echo -e "${NC}"
}

# ------------------------------------------------------------------------------
# 1. Environment & Pre-flight Checks
# ------------------------------------------------------------------------------
check_docker() {
  log_info "Checking Docker environment..."
  if ! command -v docker >/dev/null 2>&1; then
    log_err "Docker is not installed or not available in PATH."
    log_err "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    log_err "Docker daemon is not running. Please start the Docker service/daemon and re-run."
    exit 1
  fi
  log_ok "Docker daemon is running."

  # Detect compose command
  if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
  else
    log_err "Docker Compose plugin ('docker compose' or 'docker-compose') not found."
    exit 1
  fi
  log_ok "Docker Compose detected: $($DOCKER_COMPOSE version | head -n 1)"
}

check_env_file() {
  log_info "Checking environment configuration (.env)..."
  if [ ! -f .env ]; then
    log_warn ".env file not found. Generating .env from .env.example..."
    if [ -f .env.example ]; then
      cp .env.example .env
    else
      cat <<EOF > .env
PORT=3000
NODE_ENV=production
APP_URL=http://localhost:3000
AUTH_SECRET=vastu-ritam-$(openssl rand -hex 16 2>/dev/null || echo "default-secret-key-2026")
SQL_HOST=db
SQL_DB_NAME=vastu_ritam
SQL_USER=postgres
SQL_PASSWORD=postgres
DB_POOL_MAX=25
EOF
    fi

    # Ensure AUTH_SECRET is filled with a secure key if left placeholder
    if grep -q "vastu-ritam-super-secret-key-2026" .env 2>/dev/null || ! grep -q "AUTH_SECRET=" .env 2>/dev/null; then
      NEW_SECRET=$(openssl rand -hex 16 2>/dev/null || echo "vastu-ritam-secret-$RANDOM")
      echo "AUTH_SECRET=${NEW_SECRET}" >> .env
    fi

    log_ok ".env file initialized."
  else
    log_ok ".env file exists."
  fi
}

check_port_availability() {
  local port=$1
  if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
      log_warn "Port $port appears to be in use by another process on the host."
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
      log_warn "Port $port appears to be in use by another process on the host."
    fi
  fi
}

# ------------------------------------------------------------------------------
# 2. Service Management Functions
# ------------------------------------------------------------------------------
wait_for_service_healthy() {
  local service_name=$1
  local max_attempts=${2:-30}
  local attempt=1

  log_info "Waiting for service '$service_name' to report healthy (timeout: ${max_attempts}s)..."
  while [ $attempt -le $max_attempts ]; do
    local status
    status=$($DOCKER_COMPOSE ps --format json "$service_name" 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d':' -f2 | tr -d '"' || true)
    
    # Fallback to inspect if ps JSON is unavailable
    if [ -z "$status" ]; then
      local container_id
      container_id=$($DOCKER_COMPOSE ps -q "$service_name" 2>/dev/null || true)
      if [ -n "$container_id" ]; then
        status=$(docker inspect --format='{{json .State.Health.Status}}' "$container_id" 2>/dev/null | tr -d '"' || true)
      fi
    fi

    if [ "$status" = "healthy" ]; then
      log_ok "Service '$service_name' is healthy!"
      return 0
    fi

    printf "."
    sleep 1
    attempt=$((attempt + 1))
  done
  echo ""
  log_warn "Service '$service_name' healthcheck did not report 'healthy' within ${max_attempts}s (status: ${status:-unknown}). Proceeding with startup check."
}

deploy_production() {
  print_banner
  check_docker
  check_env_file
  check_port_availability 3000
  check_port_availability 5432

  log_info "Building and launching production containers with Docker Compose..."
  $DOCKER_COMPOSE up -d --build app db

  wait_for_service_healthy db 30
  wait_for_service_healthy app 40

  echo ""
  log_ok "${BOLD}Deployment Successful!${NC}"
  echo -e "=================================================================="
  echo -e "  🌐 ${BOLD}Application URL:${NC} http://localhost:${DEFAULT_PORT}"
  echo -e "  📊 ${BOLD}Health Check:${NC}    http://localhost:${DEFAULT_PORT}/health"
  echo -e "  🗄️  ${BOLD}PostgreSQL DB:${NC}   localhost:${DEFAULT_DB_PORT} (db: vastu_ritam)"
  echo -e "=================================================================="
  echo -e "Use ${CYAN}./deploy.sh logs${NC} to follow live logs, or ${CYAN}./deploy.sh down${NC} to stop."
}

deploy_dev() {
  print_banner
  check_docker
  check_env_file
  check_port_availability 3000
  check_port_availability 5432

  log_info "Starting development container (with live reload) and PostgreSQL..."
  $DOCKER_COMPOSE --profile dev up -d --build app-dev db

  wait_for_service_healthy db 30

  echo ""
  log_ok "${BOLD}Development Environment Ready!${NC}"
  echo -e "=================================================================="
  echo -e "  🛠️  ${BOLD}Dev App URL:${NC}     http://localhost:${DEFAULT_PORT}"
  echo -e "  🔄 ${BOLD}Live Reload:${NC}    Mounted from local workspace"
  echo -e "  🗄️  ${BOLD}PostgreSQL DB:${NC}   localhost:${DEFAULT_DB_PORT}"
  echo -e "=================================================================="
  echo -e "Use ${CYAN}./deploy.sh logs app-dev${NC} to view live reload output."
}

deploy_local_native() {
  print_banner
  log_info "Running native local development mode (no Docker)..."
  check_env_file

  if ! command -v node >/dev/null 2>&1; then
    log_err "Node.js is not installed. Please install Node.js (v20+ or v22+)."
    exit 1
  fi

  if [ ! -d "node_modules" ]; then
    log_info "node_modules not found. Installing dependencies..."
    npm install --legacy-peer-deps
  fi

  log_ok "Starting Express + Vite server on port 3000..."
  npm run dev
}

run_tests() {
  print_banner
  log_info "Running Vastu Ritam test suite..."
  if [ -f "package.json" ]; then
    npm test
  else
    log_err "package.json not found."
    exit 1
  fi
}

show_status() {
  check_docker
  log_info "Container Status:"
  $DOCKER_COMPOSE ps
  echo ""
  log_info "Testing API health ping at http://localhost:${DEFAULT_PORT}/health..."
  if curl -sf "http://localhost:${DEFAULT_PORT}/health" 2>/dev/null; then
    echo ""
    log_ok "Application responded HTTP 200 OK."
  else
    log_warn "Application is not reachable at http://localhost:${DEFAULT_PORT}/health."
  fi
}

stop_services() {
  check_docker
  log_info "Stopping containers..."
  $DOCKER_COMPOSE --profile dev down
  log_ok "Containers stopped."
}

clean_environment() {
  check_docker
  log_warn "Cleaning containers, networks, and persistent database volumes..."
  $DOCKER_COMPOSE --profile dev down -v --remove-orphans
  log_ok "Clean completed."
}

show_logs() {
  check_docker
  local target_service=${1:-}
  if [ -n "$target_service" ]; then
    $DOCKER_COMPOSE logs -f "$target_service"
  else
    $DOCKER_COMPOSE logs -f
  fi
}

# ------------------------------------------------------------------------------
# 3. Main Command Dispatcher
# ------------------------------------------------------------------------------
CMD="${1:-up}"

case "$CMD" in
  up|start|prod)
    deploy_production
    ;;
  dev)
    deploy_dev
    ;;
  local)
    deploy_local_native
    ;;
  test)
    run_tests
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs "${2:-}"
    ;;
  down|stop)
    stop_services
    ;;
  clean)
    clean_environment
    ;;
  build)
    check_docker
    log_info "Rebuilding container images..."
    $DOCKER_COMPOSE build --no-cache
    log_ok "Build complete."
    ;;
  help|--help|-h)
    print_banner
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up       (Default) Build & start production containers (app + db)"
    echo "  dev      Start development environment with hot reload & PostgreSQL"
    echo "  local    Run natively via Node.js/npm on host without Docker"
    echo "  test     Run the 35+ test suite across REST API, Auth, & Handbooks"
    echo "  status   Show container statuses and perform HTTP health check"
    echo "  logs     Tail container logs (e.g. ./deploy.sh logs or ./deploy.sh logs app)"
    echo "  down     Stop all running containers"
    echo "  build    Rebuild Docker images without cache"
    echo "  clean    Stop containers and remove volumes (reset database)"
    echo ""
    ;;
  *)
    log_err "Unknown command: $CMD"
    echo "Run './deploy.sh help' for usage instructions."
    exit 1
    ;;
esac
