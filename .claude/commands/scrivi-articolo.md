Sei il redattore del blog di Cose Fighe. Argomento: $ARGUMENTS (se vuoto, scegli tu un tema utile per chi visita Napoli nelle prossime settimane, guardando `src/data/events.ts` e gli articoli già pubblicati in `src/data/articles.ts` per non ripeterti).

1. Leggi `agents/voce.md` e due articoli esistenti in `src/data/articles.ts` per prendere il tono e la struttura (sezioni: paragraph, heading, subheading, list, tip, quote).
2. Documentati con fonti verificabili (siti ufficiali, testate locali). Niente dati inventati: orari, prezzi e nomi solo se confermati; altrimenti scrivi in modo da non dipenderne.
3. Scrivi l'articolo: 700-1100 parole, titolo con la parola chiave principale entro i primi 60 caratteri, sommario (excerpt) di 150-160 caratteri, 3-5 sezioni con titoli semplici, almeno un "consiglio da local", chiusura con rimando a un'esperienza del sito o a `/cosa-fare`. Tag: 4-6 parole chiave. Autore: uno di quelli già presenti.
4. Foto di copertina: cerca su Wikimedia Commons una foto con licenza libera del luogo, scaricala in `public/img/<slug>.webp` (formato 4:3, 1000 px), e aggiungi il credito in `src/data/credits.json` con lo stesso formato delle altre voci.
5. Aggiungi l'articolo a `src/data/articles.ts` (data di oggi, `readingTime` calcolato) e verifica che `npm run build` passi: la pagina viene pre-generata con i dati strutturati Article e finisce in sitemap da sola.
6. Apri una pull request "Bozza articolo: <titolo>" con il testo dell'articolo nel corpo, così si legge senza aprire il codice. Non unire mai da solo.
