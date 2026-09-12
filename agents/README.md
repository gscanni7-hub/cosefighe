# Agenti di Cose Fighe

Gli agenti sono comandi di Claude Code (cartella `.claude/commands/`) che girano
con l'abbonamento, a mano o a orario (routine nel cloud). Nessuna chiave API di
Claude. Preparano, non pubblicano: ogni proposta passa dal pannello (sezione
Bozze) o da una pull request su GitHub, e va online solo dopo l'approvazione.

| Comando | Cosa fa | Quando |
|---|---|---|
| `/scout-esperienze` | Legge i cataloghi partner (GetYourGuide, Viator), applica `agents/regole-selezione.md`, riscrive titolo e descrizione nella voce di Cose Fighe, propone le bozze. | settimanale |
| `/scrivi-articolo` | Scrive un articolo per il blog nella voce del sito, con foto libera e credito, lista SEO applicata. | settimanale o su richiesta |
| `/controllo-seo` | Verifica sitemap, titoli, descrizioni, link rotti, immagini, dati strutturati. Produce un rapporto. | settimanale |

## Cosa serve
- `.env` con `SUPABASE_SERVICE_KEY`, `GYG_PARTNER_ID`, `VIATOR_API_KEY` (vedi `.env.example`). Senza Supabase, lo scout scrive le bozze in `content/bozze/` e apre una pull request.
- Le regole di selezione compilate in `agents/regole-selezione.md`.
- La voce del sito in `agents/voce.md`: gli agenti la leggono prima di scrivere.

## Regole comuni
1. Testi sempre riscritti: mai copiare descrizioni dalle piattaforme. Dalle piattaforme si prendono solo i dati di fatto: prezzo, durata, numero di persone, lingue, cancellazione, valutazione, link.
2. Immagini: nostre o con licenza libera e credito (Wikimedia Commons), mai scaricate dalle pagine delle piattaforme.
3. Link di prenotazione sempre con il codice partner e `rel="sponsored"`.
4. Ogni esecuzione lascia traccia: riga in `agent_runs` (se Supabase) o nota nella pull request.
