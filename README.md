# Cose Fighe

Sito di Cose Fighe, esperienze autentiche a Napoli. React 19, Vite 7, Tailwind CSS 4, motion, react-router 7, Supabase (opzionale).

## Comandi

```bash
npm install      # dipendenze
npm run dev      # sviluppo su http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # anteprima della build
npm run typecheck
```

## Struttura

- `src/pages` pagine pubbliche e `src/pages/admin` pannello (caricato solo quando serve)
- `src/components/ui` sistema di componenti (Button, Sticker, PageHero, ExperienceCard, ArticleCard, WaitlistForm, Reveal)
- `src/data` esperienze, articoli del blog, crediti fotografici
- `public/img` foto (WebP, da Wikimedia Commons con licenza libera, vedi pagina /crediti)
- `public/fonts` Anton e Inter self-hosted (nessuna chiamata a Google Fonts)
- `PRODUCT.md` e `DESIGN.md` linee guida di brand e design

## Moduli e database

Senza Supabase i moduli (contatti, candidatura creator, lista d'attesa) aprono l'app di posta con il messaggio già scritto, così nessuna richiesta va persa. Con Supabase i dati finiscono nelle tabelle `leads`, `experiences`, `articles`.

1. Crea un progetto su https://supabase.com
2. Esegui `supabase/schema.sql` nel SQL Editor
3. In Authentication > Users crea l'utente del team (email + password): è l'accesso al pannello /admin
4. Copia `.env.example` in `.env` e compila `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

Senza Supabase puoi comunque proteggere il pannello con `VITE_ADMIN_PASSWORD` (almeno 8 caratteri). Senza nessuna delle due configurazioni il pannello resta chiuso.

Su Vercel le variabili vanno in Project Settings > Environment Variables.

## Deploy su Vercel

```bash
npm i -g vercel
vercel
```

`vercel.json` contiene il rewrite per la single page app: i link diretti (es. /esperienze) funzionano anche al refresh.

## Da fare prima del lancio

- Far rivedere i testi di /privacy e /cookie a un consulente: sono una base ragionevole, non un parere legale.
- Sostituire le foto di repertorio con scatti propri quando disponibili (aggiornare anche `src/data/credits.json`).
- Il sito e online su https://cosefighe.vercel.app (ogni push su `main` aggiorna la produzione). Quando colleghi un dominio tuo, aggiorna `public/sitemap.xml` e `public/robots.txt`.
- Le esperienze mostrano "Prossimamente": quando aprono le prenotazioni, collegare il pulsante al sistema di booking.
