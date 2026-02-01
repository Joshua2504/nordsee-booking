#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "🗄️  Running database migrations..."
npx knex migrate:latest

# Only run seeds if the users table is empty (first run)
echo "🔍 Checking if database needs seeding..."
USER_COUNT=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Running database seeds (first run)..."
  npx knex seed:run
else
  echo "⏭️  Skipping seeds (database already has $USER_COUNT users)"
fi

echo "✅ Database setup complete!"
echo "🚀 Starting application..."

exec node src/index.js
