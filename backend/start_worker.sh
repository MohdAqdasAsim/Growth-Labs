#!/bin/bash
# Celery Worker Startup Script
# Usage: ./start_worker.sh

cd "$(dirname "$0")"

echo "🚀 Starting Celery Worker for Super Engine Lab..."
echo "📦 Worker will process campaign workflow tasks"
echo "⏸️  Press Ctrl+C to stop"
echo ""

# Start Celery worker with:
# - 2 concurrent workers (adjust based on CPU cores)
# - INFO log level (change to DEBUG for troubleshooting)
# - Autoreload on code changes (disable in production)

celery -A backend.celery_app worker \
    --loglevel=info \
    --concurrency=2 \
    --pool=solo \
    --task-events \
    --without-heartbeat
