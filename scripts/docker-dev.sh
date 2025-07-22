#!/bin/bash

# Docker Development Helper Script for URL Shortener
# This script provides convenient commands to manage the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print section headers
print_header() {
    echo
    print_color $BLUE "================================================"
    print_color $BLUE "$1"
    print_color $BLUE "================================================"
    echo
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_color $RED "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start services
start_services() {
    print_header "🚀 Starting URL Shortener Development Environment"

    check_docker

    print_color $YELLOW "Starting MongoDBcontainer..."
    docker-compose up -d mongodb

    print_color $YELLOW "Waiting for services to be ready..."
    sleep 10

    # Check if MongoDB is ready
    echo "Checking MongoDB connection..."
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_color $GREEN "✅ MongoDB is ready"
    else
        print_color $RED "❌ MongoDB failed to start"
        return 1
    fi

    print_color $GREEN "🎉 All services are ready!"
    print_services_info
}

# Function to start services with Mongo Express
start_with_ui() {
    print_header "🚀 Starting URL Shortener with Database UI"

    check_docker

    print_color $YELLOW "Starting all containers including Mongo Express..."
    docker-compose up -d

    print_color $YELLOW "Waiting for services to be ready..."
    sleep 15

    print_color $GREEN "🎉 All services including UI are ready!"
    print_services_info

    echo
    print_color $BLUE "🔧 Database Management UI:"
    print_color $YELLOW "   Mongo Express: http://localhost:8081"
    print_color $YELLOW "   Username: admin"
    print_color $YELLOW "   Password: admin123"
}

# Function to stop services
stop_services() {
    print_header "🛑 Stopping URL Shortener Development Environment"

    docker-compose down
    print_color $GREEN "✅ All services stopped"
}

# Function to restart services
restart_services() {
    print_header "🔄 Restarting URL Shortener Development Environment"

    stop_services
    sleep 2
    start_services
}

# Function to show logs
show_logs() {
    service=${1:-""}

    if [ -z "$service" ]; then
        print_header "📋 Showing logs for all services"
        docker-compose logs -f
    else
        print_header "📋 Showing logs for $service"
        docker-compose logs -f "$service"
    fi
}

# Function to clean up everything
cleanup() {
    print_header "🧹 Cleaning up URL Shortener Development Environment"

    print_color $YELLOW "Stopping and removing containers..."
    docker-compose down -v

    print_color $YELLOW "Removing unused volumes..."
    docker volume prune -f

    print_color $GREEN "✅ Cleanup completed"
}

# Function to show service status
status() {
    print_header "📊 Service Status"

    docker-compose ps

    echo
    print_color $BLUE "🔍 Health Checks:"

    # Check MongoDB
    if docker-compose ps mongodb | grep -q "Up"; then
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            print_color $GREEN "✅ MongoDB: Healthy"
        else
            print_color $RED "❌ MongoDB: Unhealthy"
        fi
    else
        print_color $RED "❌ MongoDB: Not running"
    fi

    # Check Mongo Express
    if docker-compose ps mongo-express | grep -q "Up"; then
        print_color $GREEN "✅ Mongo Express: Running"
    else
        print_color $YELLOW "⚠️  Mongo Express: Not running"
    fi
}

# Function to access MongoDB shell
mongo_shell() {
    print_header "🔧 MongoDB Shell Access"

    if ! docker-compose ps mongodb | grep -q "Up"; then
        print_color $RED "❌ MongoDB is not running. Start it first with: $0 start"
        exit 1
    fi

    print_color $YELLOW "Connecting to MongoDB shell..."
    print_color $BLUE "Database: url-shortener"
    print_color $BLUE "User: urlshortener"
    echo

    docker-compose exec mongodb mongosh -u urlshortener -p urlshortener123 url-shortener
}


# Function to backup database
backup() {
    print_header "💾 Creating Database Backup"

    if ! docker-compose ps mongodb | grep -q "Up"; then
        print_color $RED "❌ MongoDB is not running. Start it first with: $0 start"
        exit 1
    fi

    BACKUP_DIR="./backups"
    BACKUP_FILE="url-shortener-backup-$(date +%Y%m%d-%H%M%S).archive"

    mkdir -p "$BACKUP_DIR"

    print_color $YELLOW "Creating backup..."
    docker-compose exec -T mongodb mongodump \
        --uri="mongodb://urlshortener:urlshortener123@localhost:27017/url-shortener" \
        --archive="/tmp/backup.archive"

    docker-compose exec -T mongodb cat /tmp/backup.archive > "$BACKUP_DIR/$BACKUP_FILE"

    print_color $GREEN "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE"
}

# Function to restore database
restore() {
    backup_file=$1

    if [ -z "$backup_file" ]; then
        print_color $RED "❌ Please specify backup file: $0 restore <backup-file>"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        print_color $RED "❌ Backup file not found: $backup_file"
        exit 1
    fi

    print_header "📥 Restoring Database Backup"

    if ! docker-compose ps mongodb | grep -q "Up"; then
        print_color $RED "❌ MongoDB is not running. Start it first with: $0 start"
        exit 1
    fi

    print_color $YELLOW "Restoring from backup: $backup_file"

    docker cp "$backup_file" "$(docker-compose ps -q mongodb):/tmp/restore.archive"

    docker-compose exec mongodb mongorestore \
        --uri="mongodb://urlshortener:urlshortener123@localhost:27017/url-shortener" \
        --archive="/tmp/restore.archive" \
        --drop

    print_color $GREEN "✅ Database restored successfully"
}

# Function to show service information
print_services_info() {
    echo
    print_color $BLUE "🔗 Service Information:"
    print_color $YELLOW "   MongoDB:     localhost:27017"
    print_color $YELLOW "   Your API:    http://localhost:3000"
    echo
    print_color $BLUE "🔧 Connection Details:"
    print_color $YELLOW "   MongoDB URI: mongodb://urlshortener:urlshortener123@localhost:27017/url-shortener"
}

# Function to show help
show_help() {
    echo
    print_color $BLUE "🛠️  URL Shortener Docker Development Helper"
    echo
    print_color $YELLOW "Usage: $0 <command>"
    echo
    print_color $GREEN "Available commands:"
    echo "  start          Start MongoDB container"
    echo "  start-ui       Start all containers including Mongo Express UI"
    echo "  stop           Stop all containers"
    echo "  restart        Restart all containers"
    echo "  status         Show service status and health"
    echo "  logs [service] Show logs for all services or specific service"
    echo "  cleanup        Stop containers and remove volumes"
    echo "  mongo          Access MongoDB shell"
    echo "  backup         Create database backup"
    echo "  restore <file> Restore database from backup"
    echo "  help           Show this help message"
    echo
    print_color $BLUE "Examples:"
    print_color $YELLOW "  $0 start              # Start development environment"
    print_color $YELLOW "  $0 start-ui           # Start with database UI"
    print_color $YELLOW "  $0 logs mongodb       # Show MongoDB logs"
    print_color $YELLOW "  $0 mongo              # Access MongoDB shell"
    print_color $YELLOW "  $0 backup             # Create database backup"
    echo
}

# Main script logic
case "${1:-help}" in
    "start")
        start_services
        ;;
    "start-ui")
        start_with_ui
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "mongo")
        mongo_shell
        ;;
    "backup")
        backup
        ;;
    "restore")
        restore "$2"
        ;;
    "help"|*)
        show_help
        ;;
esac
