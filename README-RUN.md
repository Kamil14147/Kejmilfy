# kejmilfy — instrukcja uruchomienia

kejmilfy to pełnowartościowy edytor graficzny online typu Canva, zbudowany w Next.js 16 + TypeScript + Tailwind + Supabase.

## Wymagania

- **Node.js 18+** (zalecane 20+) — pobierz z https://nodejs.org
- **Bun** (szybszy runtime) — instalacja:
  ```bash
  # Linux/Mac
  curl -fsSL https://bun.sh/install | bash
  # Windows (PowerShell)
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
  Lub użyj npm zamiast bun (zamień `bun` → `npm` w komendach poniżej).

## Szybki start (lokalnie, bez Supabase)

1. **Rozpakuj ZIP**:
   ```bash
   unzip kejmilfy.zip
   cd kejmilfy
   ```

2. **Zainstaluj zależności**:
   ```bash
   bun install
   # lub: npm install
   ```

3. **Skonfiguruj zmienne środowiskowe** — plik `.env` już istnieje z Twoimi kluczami Supabase. Jeśli chcesz działać lokalnie bez Supabase, zmień na:
   ```env
   DATABASE_PROVIDER=sqlite
   DATABASE_URL=file:./db/local.db
   NEXTAUTH_SECRET=jakis-tajny-klucz
   NEXTAUTH_URL=http://localhost:3000
   # Pozostaw puste lub usuń zmienne Supabase, aby wyłączyć Realtime
   ```

4. **Zainicjuj bazę danych** (jeśli używasz SQLite):
   ```bash
   bun run db:push
   # lub: npx prisma db push
   ```

5. **Uruchom serwer deweloperski**:
   ```bash
   bun run dev
   # lub: npm run dev
   ```

6. **Otwórz w przeglądarce**: http://localhost:3000

## Konfiguracja z Supabase (zalecane)

Twoje klucze Supabase są już w pliku `.env`. Aby włączyć pełną funkcjonalność (konta, zapis projektów, live cursory):

### Krok 1: Utwórz tabele w Supabase

1. Zaloguj się do https://supabase.com
2. Otwórz swój projekt: `nwbptgtpneovjzghdhom`
3. Przejdź do **SQL Editor** → **New query**
4. Wklej poniższy SQL i kliknij **Run**:

```sql
create table if not exists users (
  id            text primary key,
  email         text unique not null,
  name          text,
  password_hash text not null,
  avatar_color  text not null default '#6366f1',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists folders (
  id         text primary key,
  name       text not null,
  color      text not null default '#6366f1',
  user_id    text not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id          text primary key,
  name        text not null,
  data        text not null,
  thumbnail   text,
  favorite    boolean not null default false,
  deleted     boolean not null default false,
  folder_id   text references folders(id) on delete set null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists comments (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  page_id     text not null,
  x           double precision not null,
  y           double precision not null,
  text        text not null,
  resolved    boolean not null default false,
  replies     text not null default '[]',
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists activities (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  type        text not null,
  action      text not null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists projects_author_id_idx on projects(author_id);
create index if not exists projects_updated_at_idx on projects(updated_at desc);
create index if not exists comments_project_id_idx on comments(project_id);
create index if not exists activities_project_id_idx on activities(project_id);

alter table users      enable row level security;
alter table folders    enable row level security;
alter table projects   enable row level security;
alter table comments   enable row level security;
alter table activities enable row level security;

create policy "read users"        on users      for select using (true);
create policy "insert users"      on users      for insert with check (true);
create policy "update users"      on users      for update using (true);
create policy "read projects"     on projects   for select using (true);
create policy "insert projects"   on projects   for insert with check (true);
create policy "update projects"   on projects   for update using (true);
create policy "delete projects"   on projects   for delete using (true);
create policy "read folders"      on folders    for select using (true);
create policy "insert folders"    on folders    for insert with check (true);
create policy "update folders"    on folders    for update using (true);
create policy "delete folders"    on folders    for delete using (true);
create policy "read comments"     on comments   for select using (true);
create policy "insert comments"   on comments   for insert with check (true);
create policy "update comments"   on comments   for update using (true);
create policy "delete comments"   on comments   for delete using (true);
create policy "read activities"   on activities for select using (true);
create policy "insert activities" on activities for insert with check (true);
create policy "delete activities" on activities for delete using (true);

alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table activities;
```

### Krok 2: Przełącz Prisma na PostgreSQL

Edytuj plik `prisma/schema.prisma` — zmień `provider = "sqlite"` na `provider = "postgresql"`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Następnie zaktualizuj `.env`:

```env
DATABASE_URL="postgresql://postgres:[TWOJE_HASŁO_DO_BAZY]@db.nwbptgtpneovjzghdhom.supabase.co:5432/postgres"
```

> Hasło do bazy ≠ klucz anon. Hasło ustawiałeś przy tworzeniu projektu Supabase. Jeśli go nie pamiętasz, zresetuj je w: Supabase Dashboard → Project Settings → Database → Reset database password.

### Krok 3: Wypchnij schemę i uruchom

```bash
bun run db:push     # tworzy tabele w Postgres (jeśli SQL nie został uruchomiony ręcznie)
bun run db:generate # regeneruje klienta Prisma
bun run dev
```

### Krok 4: Sprawdź status

Otwórz http://localhost:3000/setup — powinno pokazać „Baza gotowa!" (zielony).

## Użytkowanie

1. **Rejestracja**: http://localhost:3000/auth?mode=register
2. **Logowanie**: http://localhost:3000/auth
3. **Dashboard**: http://localhost:3000/dashboard — lista projektów, tworzenie nowych
4. **Edytor**: http://localhost:3000/editor — pełny edytor graficzny

### Skróty klawiszowe w edytorze

- `Ctrl+Z` / `Ctrl+Shift+Z` — undo / redo
- `Ctrl+C` / `Ctrl+V` / `Ctrl+X` — copy / paste / cut
- `Ctrl+D` — duplikuj
- `Ctrl+A` — zaznacz wszystko
- `Ctrl+G` / `Ctrl+Shift+G` — grupuj / rozgrupuj
- `Ctrl+]` / `Ctrl+[` — warstwa w górę / w dół
- `Ctrl+Shift+]` / `Ctrl+Shift+[` — na wierzch / na spód
- `Ctrl+=` / `Ctrl+-` / `Ctrl+0` — zoom in / out / fit
- `Delete` / `Backspace` — usuń zaznaczone
- `Strzałki` — przesuń o 1px (Shift = 10px)
- `Escape` — odznacz
- `Spacja + przeciągnij` — pan canvas
- `Ctrl + scroll` — zoom
- `G` — przełącz siatkę
- `Shift+S` — przełącz snap

## Struktura projektu

```
kejmilfy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page (z animacją scroll)
│   │   ├── auth/page.tsx      # Logowanie/rejestracja
│   │   ├── dashboard/page.tsx # Lista projektów
│   │   ├── editor/page.tsx    # Edytor graficzny
│   │   ├── setup/page.tsx     # Setup Supabase
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth + rejestracja
│   │       ├── projects/      # CRUD projektów
│   │       ├── comments/      # Komentarze
│   │       ├── upload/        # Upload plików
│   │       └── setup-check/   # Status bazy
│   ├── components/
│   │   ├── editor/            # Komponenty edytora
│   │   │   ├── canvas/        # Canvas + elementy
│   │   │   ├── panels/        # Lewy/prawy panel
│   │   │   ├── topbar/        # Górny pasek
│   │   │   ├── LiveCursors.tsx    # Live cursory (Supabase)
│   │   │   ├── CommentsOverlay.tsx
│   │   │   ├── ShareDialog.tsx
│   │   │   └── ...
│   │   ├── ParticleField.tsx  # Animowane particles (canvas)
│   │   └── ui/                # shadcn/ui komponenty
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── supabase.ts        # Browser client
│   │   ├── supabase-server.ts # Server client (secret key)
│   │   ├── db.ts              # Prisma client
│   │   └── canvas/            # Typy, store, export, szablony
│   └── hooks/                 # Custom hooks
├── prisma/schema.prisma       # Schema bazy
├── public/                    # Statyczne zasoby
├── scripts/
│   ├── setup-supabase.sh      # Auto-setup Supabase
│   └── supabase-schema.sql    # SQL schema
├── .env                       # Zmienne środowiskowe
└── package.json
```

## Funkcje

- ✅ Edytor graficzny (canvas, tekst, kształty, obrazy, ikony)
- ✅ Multi-select, grupowanie, warstwy
- ✅ Undo/redo z pełną historią
- ✅ Autozapis do Supabase
- ✅ Projekty wielostronicowe
- ✅ Magic Resize
- ✅ Szablony i brand kit
- ✅ Eksport PNG/JPG/SVG/PDF
- ✅ Tryb prezentacji
- ✅ Komentarze z pinami na canvas
- ✅ Share link + QR code
- ✅ Live cursory (Supabase Realtime)
- ✅ Presence (kto online)
- ✅ Tryb ciemny
- ✅ Responsywność mobile
- ✅ Service worker (offline)

## Troubleshooting

**„Baza danych nie jest skonfigurowana"** na stronie /auth
→ Uruchom SQL w Supabase SQL Editor (patrz Krok 1 powyżej)

**Login nie działa po przełączeniu na PostgreSQL**
→ Upewnij się że `DATABASE_URL` w `.env` używa poprawnego hasła bazy (nie klucza anon)

**Live cursory nie działają**
→ Sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` są w `.env`. Realtime działa bez tabel — tylko broadcast + presence.

**Błąd „Prisma Client not generated"**
→ Uruchom `bun run db:generate`

**Port 3000 zajęty**
→ Zmień w `package.json`: `"dev": "next dev -p 3001"`

## Deployment

### Vercel (najprościej)
1. Wrzuć projekt na GitHub
2. Zaimportuj na https://vercel.com
3. Dodaj zmienne środowiskowe z `.env` w ustawieniach Vercel
4. Zmień `NEXTAUTH_URL` na swój URL Vercel
5. Deploy

### Self-hosted (Docker)
```dockerfile
FROM oven/bun:1 as deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

## Wsparcie

W razie problemów sprawdź logi serwera (`dev.log`) i konsolę przeglądarki.
