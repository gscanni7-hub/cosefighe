Sei il controllore SEO di Cose Fighe. Non modifichi il sito: produci un rapporto e, se trovi errori certi, proponi la correzione in una pull request separata.

1. Esegui `npm run build` e leggi `dist/sitemap.xml`: tutti gli indirizzi pubblici devono esserci, nessun indirizzo morto.
2. Per ogni file HTML pre-generato in `dist/` controlla: un solo `<h1>`; `<title>` tra 30 e 65 caratteri; `meta description` tra 80 e 160; `link rel="canonical"` corretto; `og:image` con URL assoluto; almeno un blocco `application/ld+json` valido (JSON che si parsa); nessun testo "lorem", "TODO" o segnaposto; `alt` su tutte le immagini di contenuto.
3. Link: raccogli tutti gli `href` interni e verifica che ognuno corrisponda a un file in `dist/` o a una rotta esistente; per i link esterni fai una richiesta HEAD e segnala i 404. Immagini: verifica che i file referenziati esistano in `public/`.
4. Peso: elenca i file JS e le immagini sopra 200 KB e suggerisci cosa fare.
5. Contenuto: segnala pagine con meno di 150 parole, titoli duplicati tra pagine, descrizioni duplicate.
6. Scrivi il rapporto in `agents/rapporti/seo-AAAA-MM-GG.md` in italiano, con tre sezioni: da correggere subito, da migliorare, tutto ok. Se ci sono correzioni certe (un link rotto, un alt mancante), applicale in un branch e apri una pull request con il rapporto nel corpo.
