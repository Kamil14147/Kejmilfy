# kejmilfy — Setup Supabase

Aplikacja domyślnie działa na lokalnym SQLite (zero konfiguracji).
Aby włączyć **współpracę na żywo** (live cursory, presence, multiuser), podłącz Supabase.

## Szybki start (automatyczny)

1. Utwórz darmowe konto na [supabase.com](https://supabase.com) i stwórz nowy projekt.
2. Z dashboardu Supabase zbierz 4 wartości:
   - **Project ref** — `Project Settings → API → Project URL` (np. `abcdefgh.supabase.co`, ref to `abcdefgh`)
   - **DB password** — hasło ustawione przy tworzeniu projektu
   - **Supabase URL** — pełny URL (np. `https://abcdefgh.supabase.co`)
   - **Anon key** — `Project Settings → API → Project API keys → anon public`
3. Uruchom skrypt:

   ```bash
   ./scripts/setup-supabase.sh <PROJECT_REF> <DB_PASSWORD> <SUPABASE_URL> <ANON_KEY>
   ```

   Przykład:

   ```bash
   ./scripts/setup-supabase.sh abcdefgh mySecretPass123 \
     https://abcdefgh.supabase.co eyJhbGc...anonKey...
   ```

4. Zrestartuj dev server: `bun run dev`

5. Otwórz edytor w dwóch oknach przeglądarki (lub dwóch urządzeniach) — będziesz widzieć kursory drugiej osoby na żywo.

## Co robi skrypt

- Zmienia `provider = "sqlite"` → `provider = "postgresql"` w `prisma/schema.prisma`
- Aktualizuje `.env` z connection stringiem Supabase
- Uruchamia `prisma db push` — tworzy wszystkie tabele w Twojej bazie Supabase
- Regeneruje klienta Prisma

## Setup ręczny (bez skryptu)

Jeśli wolisz zrobić to ręcznie:

1. Edytuj `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Edytuj `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:TWOJE_HASLO@db.TWOJ_REF.supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL=https://TWOJ_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TWOJ_ANON_KEY
   ```

3. Uruchom:
   ```bash
   bun run db:push
   bun run db:generate
   bun run dev
   ```

## Alternatywa: SQL w Supabase SQL Editor

Jeśli nie chcesz używać `prisma db push`, możesz ręcznie utworzyć tabele:
skopiuj zawartość `scripts/supabase-schema.sql` do SQL Editora w dashboardzie Supabase i uruchom.

## Co działa po podłączeniu Supabase

| Funkcja | Bez Supabase | Z Supabase |
|---|---|---|
| Edytor graficzny | ✓ | ✓ |
| Konta i logowanie | ✓ (SQLite) | ✓ (Supabase Postgres) |
| Zapisywanie projektów | ✓ (lokalnie) | ✓ (w chmurze) |
| Eksport PNG/JPG/PDF | ✓ | ✓ |
| **Live cursory** | ✗ | ✓ |
| **Presence (kto online)** | ✗ | ✓ |
| Komentarze | ✓ (async) | ✓ (async) |

## Troubleshooting

**"Supabase init failed"** — sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` są ustawione w `.env` i nie zawierają `[YOUR-...` placeholderów.

**Cursors się nie pojawiają** — Supabase Realtime wymaga włączonej replikacji. W dashboardzie: `Database → Replication → wal_level` powinno być `logical` (domyślne w nowych projektach).

**Prisma connection error** — sprawdź hasło. Przy pierwszym połączeniu użyj `postgres` jako user i hasła ustawionego przy tworzeniu projektu. Możesz też użyć connection poolera: `?pgbouncer=true&connection_limit=1` na końcu `DATABASE_URL`.

**Zmiana z SQLite na Postgres** — jeśli miałeś dane w SQLite i chcesz je zmigrować, użyj:
```bash
bunx prisma db pull   # wyciągnij schemat z SQLite
# przełącz na postgresql
bunx prisma db push   # wypchnij do Postgres
```
