/**
 * La squadra di agenti. Ognuno è un comando di Claude Code nel repository
 * (cartella .claude/commands/) che gira con l'abbonamento, a mano o a orario.
 * Le istruzioni qui sotto sono i valori di partenza: dal pannello si possono
 * cambiare e vengono salvate nel database, dove gli agenti le leggono.
 */

export type Cadence = 'manuale' | 'giornaliera' | 'settimanale' | 'mensile'

export const CADENCE_LABEL: Record<Cadence, string> = {
  manuale: 'Solo quando lo lanci',
  giornaliera: 'Ogni giorno',
  settimanale: 'Ogni settimana',
  mensile: 'Ogni mese',
}

export interface AgentDef {
  id: string
  name: string
  role: string
  /** Una frase: cosa fa. */
  mission: string
  duties: string[]
  needs: string[]
  produces: string
  command: string
  defaultCadence: Cadence
  defaultRules: string
  /** Chi controlla il suo lavoro. */
  reportsTo: string
}

export interface AgentSettings {
  agent: string
  enabled: boolean
  cadence: Cadence
  rules: string | null
  updated_at?: string
}

export const AGENTS: AgentDef[] = [
  {
    id: 'scout-esperienze',
    name: 'Scout esperienze',
    role: 'Ricerca e selezione',
    mission: 'Trova su GetYourGuide e Viator le esperienze da proporre per Napoli e le prepara come bozze.',
    duties: [
      'Legge i cataloghi partner e scarta ciò che non rispetta le regole.',
      'Dà un punteggio da 0 a 100 e spiega perché.',
      'Riscrive titolo e descrizione nella voce di Cose Fighe: mai copiare.',
      'Prende dalle piattaforme solo i dati di fatto: prezzo, durata, persone, lingue, cancellazione, link.',
    ],
    needs: ['Id partner GetYourGuide', 'Chiave Viator', 'Le regole qui sotto'],
    produces: 'Bozze nella sezione Bozze, con registro dell’esecuzione.',
    command: '/scout-esperienze',
    defaultCadence: 'settimanale',
    reportsTo: 'Tu approvi o scarti ogni bozza.',
    defaultRules: `REGOLE DURE (passa o non passa)
- Zona: Napoli città e provincia (Pozzuoli, Campi Flegrei, Ercolano, Vesuvio, Sorrento, isole). Escluse: Amalfi, Pompei da sola, Roma.
- Prezzo a persona: da 10 a 120 euro.
- Valutazione minima sulla piattaforma: 4,6 su 5 con almeno 50 recensioni.
- Lingua: italiano disponibile (inglese gradito in più).
- Gruppo: massimo 15 persone.
- Categorie ammesse: food, outdoor, sport, arte, laboratori, spettacoli.
- Massimo 8 esperienze online per categoria.
- Escluse: catene, "salta la fila" generici, tour in autobus, escursioni con più di 3 tappe, trasferimenti, biglietti senza esperienza.

GIUDIZIO (0-100, spiegato in due righe)
- Sembra fatta da una persona del posto, non da un operatore di massa?
- Si porta a casa qualcosa (una ricetta, un pezzo fatto a mano, un posto che non trovi da solo)?
- Sta bene accanto alle esperienze già sul sito, senza doppioni?
- Sotto 60: non proporre. 60-79: bozza da revisionare. 80 e oltre: bozza consigliata.`,
  },
  {
    id: 'scrivi-articolo',
    name: 'Redattore blog',
    role: 'Contenuti',
    mission: 'Scrive gli articoli del blog nella voce di Cose Fighe, con foto libera e lista SEO applicata.',
    duties: [
      'Sceglie o riceve un tema utile per chi visita Napoli nelle prossime settimane.',
      'Si documenta su fonti verificabili; non inventa orari, prezzi o nomi.',
      'Scrive 700-1100 parole con sezioni, un consiglio da local, chiusura con rimando al sito.',
      'Trova una foto con licenza libera e registra il credito.',
    ],
    needs: ['Un tema, oppure sceglie lui', 'La voce del sito'],
    produces: 'Una pull request su GitHub con l’articolo leggibile; online solo dopo il tuo ok.',
    command: '/scrivi-articolo <tema>',
    defaultCadence: 'settimanale',
    reportsTo: 'Tu leggi e approvi la pull request.',
    defaultRules: `VOCE
- Come un amico napoletano che ti porta in giro, non come un catalogo. Seconda persona, frasi corte, verbi concreti.
- Dettagli veri: orari, nomi di posti, cosa si mangia, quanto si cammina.
- Una punta di ironia, mai sarcasmo. Nessun punto esclamativo.
- Parole vietate: fighissimo, imperdibile, must, top, gioiello nascosto, immergiti, indimenticabile, autentico.

STRUTTURA
- Titolo con la parola chiave entro i primi 60 caratteri. Sommario di 150-160 caratteri.
- 3-5 sezioni con titoli semplici, almeno un "consiglio da local", chiusura con rimando a un'esperienza o a /cosa-fare.
- 4-6 tag. Autore tra quelli già presenti.

TEMI PREFERITI
- Quartieri, cibo di strada, mare e Campi Flegrei, laboratori artigiani, cosa succede in città il mese prossimo.`,
  },
  {
    id: 'controllo-seo',
    name: 'Controllore SEO',
    role: 'Qualità e Google',
    mission: 'Controlla che ogni pagina sia in ordine per Google e segnala cosa correggere.',
    duties: [
      'Verifica sitemap, titoli, descrizioni, canonical, dati strutturati, immagini con testo alternativo.',
      'Cerca link rotti e immagini mancanti.',
      'Segnala pagine povere di testo, titoli e descrizioni duplicati, file troppo pesanti.',
      'Corregge da solo solo gli errori certi, in una pull request separata.',
    ],
    needs: ['Nient’altro che il sito'],
    produces: 'Un rapporto in tre parti: da correggere subito, da migliorare, tutto ok.',
    command: '/controllo-seo',
    defaultCadence: 'settimanale',
    reportsTo: 'Tu leggi il rapporto; le correzioni certe passano da una pull request.',
    defaultRules: `LIMITI
- Titolo tra 30 e 65 caratteri; descrizione tra 80 e 160.
- Un solo H1 per pagina; alt su tutte le immagini di contenuto.
- Pagine con meno di 150 parole: segnalare.
- File JS o immagini sopra 200 KB: segnalare.

COSA PUÒ CORREGGERE DA SOLO
- Link interni rotti, alt mancanti, descrizioni mancanti.
- Tutto il resto solo nel rapporto.`,
  },
]
