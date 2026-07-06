# kejmilfy — Deployment na Cloudflare Pages (ZA DARMO)

Cloudflare Pages ma **darmowy plan** z:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds / miesiąc
- ✅ Custom domain + HTTPS
- ✅ Global CDN

## Wymagania

- Konto na [Cloudflare](https://dash.cloudflare.com/sign-up) (darmowe)
- Konto na [GitHub](https://github.com) (darmowe) — kod musi być na GitHub
- Istniejący projekt Supabase (już masz: `nwbptgtpneovjzghdhom`)

## Krok 1: Wrzuć kod na GitHub

```bash
# W rozpakowanym folderze kejmilfy
git init
git add .
git commit -m "kejmilfy - initial commit"
git branch -M main
git remote add origin https://github.com/TWOJ_USER/kejmilfy.git
git push -u origin main
```

## Krok 2: Połącz z Cloudflare Pages

1. Wejdź na https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Wybierz GitHub i autoryzuj
3. Wybierz repozytorium `kejmilfy`
4. W **Set up builds and deployments**:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Node version**: `18` (lub nowsza)
5. W **Environment variables** dodaj (wszystkie z Twojego `.env`):

   | Variable name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://nwbptgtpneovjzghdhom.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_ZFcDJW9btd78NO44OHoIXg_6SvdOvlV` |
   | `SUPABASE_SECRET_KEY` | `sb_secret_LIVSbilFXp8wCP0mVR0bHg_TDpncjhk` |
   | `SUPABASE_JWKS_URL` | `https://nwbptgtpneovjzghdhom.supabase.co/auth/v1/.well-known/jwks.json` |
   | `NEXTAUTH_SECRET` | `YiXvrGzC/7kAsWzFQujKjhVlEogkmk+EHHi5zAh157M=` |
   | `NEXTAUTH_URL` | `https://kejmilfy.pages.dev` *(zmień po pierwszym deploymencie na swój URL)* |

6. Kliknij **Save and Deploy**

## Krok 3: Poczekaj na build (3-5 minut)

Cloudflare zainstaluje `@cloudflare/next-on-pages` automatycznie i zbuduje projekt. Build log pojawi się w czasie rzeczywistym.

## Krok 4: Sprawdź czy działa

Po udanym buildzie dostaniesz URL typu:
```
https://abc123.kejmilfy.pages.dev
```

Otwórz go — strona główna kejmilfy powinna się załadować.

## Krok 5: Zaktualizuj NEXTAUTH_URL

Po pierwszym deploymencie wejdź w:
- **Cloudflare Pages → kejmilfy → Settings → Environment variables**
- Zmień `NEXTAUTH_URL` na swój docelowy URL (np. `https://kejmilfy.pages.dev`)
- Wywołaj nowy build (push czegokolwiek do GitHub albo **Retry deployment**)

## Krok 6 (opcjonalny): Custom domain

1. **Cloudflare Pages → kejmilfy → Custom domains → Set up a domain**
2. Wpisz swoją domenę (np. `kejmilfy.pl`)
3. Cloudflare pokaże instrukcję DNS — dodaj rekord CNAME w swoim registrarze
4. Poczekaj 5-30 minut na propagację DNS
5. HTTPS jest automatyczny (Cloudflare generuje certyfikat)

## Troubleshooting

### Build failed: `@cloudflare/next-on-pages` not found
Cloudflare automatycznie instaluje zależności, ale czasem trzeba dodać pakiet ręcznie:
```bash
npm install --save-dev @cloudflare/next-on-pages
git add package.json package-lock.json
git commit -m "add cloudflare adapter"
git push
```

### Function timeout
Cloudflare Pages Functions mają limit **30 sekund** na darmowym planie. Eksport PDF z dużymi projektami może przekroczyć. Wtedy:
- Zmniejsz `pixelRatio` w eksporcie (już mamy `1` dla JPG)
- Albo przenieś eksport do client-side (już jest client-side — `html-to-image` działa w przeglądarce)

### NextAuth error: `JWT_SECRET` missing
Upewnij się że `NEXTAUTH_SECRET` jest ustawione w **Environment variables** Cloudflare (nie tylko w `.env` lokalnie).

### Supabase connection error
Cloudflare Pages są globalne — upewnij się że w Supabase:
- **Settings → Database → Network restrictions** — puste (dostęp z każdego IP)
- **Settings → API → URL** pasuje do `NEXT_PUBLIC_SUPABASE_URL`

### Realtime cursory nie działają
Supabase Realtime wymaga włączonej replikacji. W dashboardzie Supabase:
- **Database → Replication** → `supabase_realtime` publication powinna zawierać tabele `projects`, `comments`, `activities`

### Service worker nie ładuje się
Cloudflare Pages serwuje `public/sw.js` poprawnie. Jeśli nie działa:
- Sprawdź w DevTools → Application → Service Workers
- Może być problem z `/sw.js` path — zmień na relatywny w `ServiceWorkerRegister.tsx`

## Ograniczenia darmowego planu

| Limit | Darmowy | Płatny ($20/m-c) |
|---|---|---|
| Builds / miesiąc | 500 | Unlimited |
| Concurrent builds | 1 | 5 |
| Function invocation | 100k/dzień | Unlimited |
| Function duration | 30s | 60s |
| Bandwidth | Unlimited | Unlimited |
| Requests | Unlimited | Unlimited |

Dla małej aplikacji jak kejmilfy darmowy plan wystarczy na długo.

## Lokalny test przed deployem

```bash
# Zbuduj i przetestuj lokalnie z Cloudflare adapter
npx @cloudflare/next-on-pages
npx wrangler pages dev .vercel/output/static

# Otwórz http://localhost:8788
```

## Automatyczny deploy przez GitHub Actions (opcjonalne)

Stwórz `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx @cloudflare/next-on-pages
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: kejmilfy
          directory: .vercel/output/static
```

Tokeny pobierzesz z: Cloudflare Dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template.

## Co działa na Cloudflare Pages

| Funkcja | Status |
|---|---|
| Landing page z animacjami | ✅ |
| Logowanie/rejestracja (NextAuth + Supabase) | ✅ |
| Edytor graficzny (canvas, elementy) | ✅ |
| Zapisywanie projektów (Supabase) | ✅ |
| Komentarze (Supabase) | ✅ |
| Live cursory (Supabase Realtime) | ✅ |
| Eksport PNG/JPG/PDF (client-side) | ✅ |
| Tryb prezentacji | ✅ |
| Share link + QR | ✅ |
| Tryb ciemny | ✅ |
| Service worker (offline) | ✅ |

Wszystko działa. Powodzenia!
