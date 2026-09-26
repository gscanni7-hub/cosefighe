# Il sito in inglese: regole per chi ci lavora

Obiettivo: premendo EN tutto il sito è in inglese, perfetto, senza mai una parola italiana dell'interfaccia. Le pagine italiane restano identiche a oggi (stesso HTML, stessi indirizzi).

## Architettura (già pronta, non cambiarla)
- `src/i18n/lang.ts`
  - `useLang()` → `'it' | 'en'` dall'indirizzo (`/en/...` = inglese).
  - `useT()` → `t('Testo italiano')` restituisce l'inglese in /en, l'italiano altrove. Con segnaposto: `t('{n} esperienze', { n })`.
  - `useLp()` → `lp('/esperienze')` porta un indirizzo italiano nella lingua della pagina (`/en/experiences`). Funziona anche con slug (`/esperienze/<slug-it>` → `/en/experiences/<slug-en>`), `?query` e `#ancora`.
  - `itSlug('esperienze'|'eventi'|'blog', slug)` → lo slug italiano partendo da quello nell'indirizzo (le pagine cercano sempre per slug italiano).
  - `otherLangPath(pathname)` → la stessa pagina nell'altra lingua (selettore IT | EN, hreflang).
  - `translate(text, lang)` / `localizePath(path, lang)`: versioni senza hook (per seo.ts e codice non-React).
- `src/i18n/content.ts`: `localizeExperience`, `localizeEvent`, `localizeArticle`, `localizeCategory`, `testiIn(key, italiano, lang)`, `hasExperienceEn/hasEventEn/hasArticleEn`, `eventSlugEn`, `articleSlugEn`.
- `src/i18n/schede.ts`: `localizeScheda(providerId, scheda, lang)` (testi lunghi, solo pagina della scheda).
- `src/lib/dates.ts`: `formatShort/formatLong/formatRange/dayParts` accettano un ultimo argomento `lang`.
- Rotte inglesi già in `src/routes.tsx`: `/en`, `/en/experiences(/:slug)`, `/en/things-to-do(/today|/weekend)`, `/en/map`, `/en/events/:slug`, `/en/creators`, `/en/about`, `/en/contact`, `/en/category/:slug`, `/en/blog(/:slug)`, `/en/privacy`, `/en/cookies`. Stessi componenti delle pagine italiane.

## Come si traduce un componente
1. In cima: `const t = useT()`, `const lp = useLp()`, `const lang = useLang()` (solo quelli che servono).
2. Ogni testo visibile in italiano (anche `aria-label`, `alt`, `title`, `placeholder`, testi dei bottoni, messaggi, conteggi) diventa `t('…')`. Chiave = il testo italiano ESATTO. Plurali e numeri: `t('{n} esperienze', { n })` e in inglese `"{n} experiences"`; se servono due forme, due chiavi (`'1 evento'` / `'{n} eventi'`).
3. Ogni `to=`/`href=` interno diventa `lp('/…')`. `navigate('/…')` → `navigate(lp('/…'))`.
4. Contenuti: prima di mostrarli passali da `localizeExperience(exp, lang)` / `localizeEvent(e, lang)` / `localizeArticle(a, lang)` / `localizeCategory(c, lang)`. Le date con `lang`.
5. Nelle liste in inglese mostra solo ciò che ha la traduzione (`hasEventEn` ecc.), mai un titolo italiano dentro una pagina inglese.
6. La traduzione va nel file JSON della tua area in `src/i18n/ui/` (oggetto piatto `{ "testo italiano": "English text" }`), in ordine alfabetico, indentazione 1 spazio.
7. In italiano il risultato deve essere IDENTICO a prima: non cambiare testi, classi, struttura.

## Stile dell'inglese
- Inglese britannico naturale, da persona del posto che accompagna un amico: frasi corte, concrete, calde, un filo di ironia. Niente "hidden gem", "must-see", "unforgettable", "authentic", "immerse yourself", niente punti esclamativi. Niente trattini lunghi (— e –): negli intervalli il trattino normale ("9am-7pm", "16-18 October").
- Non si traduce parola per parola: si riscrive per uno straniero (spiega cosa sono sfogliatella, frittatina, Circumvesuviana, "coperto" quando serve; misure e orari chiari: "9am-7pm", "Sat 3 Oct").
- Nomi propri e piatti restano in italiano (Spaccanapoli, Quartieri Spagnoli, babà, sfogliatella), con una glossa la prima volta se serve.
- Titoli SEO: parole che cercano gli stranieri ("things to do in Naples", "Naples food tour", "day trip to Pompeii from Naples"). Title ≤ 60 caratteri, description 140-155.
- Slug inglesi: minuscolo, parole con trattini, significativi (`naples-street-food-tour-old-town`), unici.

## Da non fare
- Non toccare git (niente commit, checkout, stash, push). Non lanciare `npm run build` (lo fa il coordinatore alla fine). Solo `npx tsc --noEmit -p .` e bada agli errori dei TUOI file (altri stanno lavorando in parallelo).
- Non toccare file di altre aree (elenco nel tuo compito). Non toccare `src/i18n/lang.ts`, `src/i18n/content.ts`, `src/routes.tsx`, `src/seo.ts` se non sono tuoi.
