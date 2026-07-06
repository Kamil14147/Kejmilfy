#!/usr/bin/env bash
# setup-supabase.sh — Switch kejmilfy from local SQLite to Supabase Postgres + Realtime
#
# Usage:
#   ./scripts/setup-supabase.sh <PROJECT_REF> <DB_PASSWORD> <SUPABASE_URL> <ANON_KEY>
#
# Example:
#   ./scripts/setup-supabase.sh abcdefghijklmnop mySecretPass123 \
#     https://abcdefghijklmnop.supabase.co eyJhbGc...anonKey...
#
# What this does:
#   1. Updates prisma/schema.prisma: provider sqlite → postgresql
#   2. Updates .env: DATABASE_URL → Supabase Postgres connection string
#   3. Updates .env: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
#   4. Runs `prisma db push` to create all tables in Supabase
#   5. Regenerates Prisma client
#
# After running: restart your dev server (`bun run dev`).

set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <PROJECT_REF> <DB_PASSWORD> <SUPABASE_URL> <ANON_KEY>"
  echo ""
  echo "Get these values from your Supabase dashboard:"
  echo "  - Project Settings → API → Project URL  (https://<ref>.supabase.co)"
  echo "  - Project Settings → API → Project API keys → anon public"
  echo "  - Project Settings → Database → Connection string → URI"
  echo "    (password is the one you set when creating the project)"
  exit 1
fi

PROJECT_REF="$1"
DB_PASSWORD="$2"
SUPABASE_URL="$3"
ANON_KEY="$4"

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== Switching kejmilfy to Supabase ==="
echo "Project ref: $PROJECT_REF"
echo "Supabase URL: $SUPABASE_URL"
echo ""

# 1. Update prisma/schema.prisma: sqlite → postgresql
SCHEMA="prisma/schema.prisma"
echo "[1/5] Updating $SCHEMA (sqlite → postgresql)"
sed -i.bak 's|provider = "sqlite"|provider = "postgresql"|' "$SCHEMA"
rm -f "$SCHEMA.bak"

# 2. Update .env
ENV_FILE=".env"
echo "[2/5] Updating $ENV_FILE"
cat > "$ENV_FILE" <<EOF
# Database (Prisma) — Supabase Postgres
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me")
NEXTAUTH_URL=http://localhost:3000

# Supabase (Realtime cursors + presence)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

echo "[3/5] Installing dependencies"
bun install

echo "[4/5] Pushing schema to Supabase (creates tables)"
bun run db:push

echo "[5/5] Regenerating Prisma client"
bun run db:generate

echo ""
echo "✓ Done! kejmilfy is now connected to Supabase."
echo ""
echo "Next steps:"
echo "  1. Restart your dev server: bun run dev"
echo "  2. Open the editor with two browser windows side-by-side"
echo "  3. Move your mouse — you'll see each other's live cursors"
echo ""
echo "Note: For realtime cursors to work, in your Supabase dashboard:"
echo "  Database → Replication → make sure 'wal_level' is logical"
echo "  (Supabase enables this by default on new projects)"
