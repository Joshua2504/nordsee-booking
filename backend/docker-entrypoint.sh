#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "🗄️  Running database migrations..."
npx knex migrate:latest

echo "🌱 Running database seeds..."
npx knex seed:run

echo "✅ Database setup complete!"
echo "🚀 Starting application..."

exec node src/index.js
