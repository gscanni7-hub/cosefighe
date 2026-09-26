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
  /** Giorno della settimana per la cadenza settimanale (0 = domenica ... 6 = sabato). */
  weekday?: number
  /** Giorno del mese per la cadenza mensile (1-28). */
  monthday?: number
  rules: string | null
  updated_at?: string
}

export const WEEKDAY_LABEL = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']

/** Ora fissa in cui il "tic" quotidiano nel cloud interroga il pannello. */
export const RUN_HOUR_LABEL = 'alle 6:00'

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
    defaultCadence: 'mensile',
    reportsTo: 'Tu approvi o scarti ogni bozza.',
    defaultRules: `OBIETTIVO DELLA PRIMA RICERCA
- 10-12 attività da GetYourGuide e 10-12 da Viator, in totale 20-24.
- Distribuite nelle sei categorie del sito: food, outdoor, sport, arte, laboratori, spettacoli (circa 2 per categoria per piattaforma). Nessuna categoria vuota, nessuna oltre 5.
- Ogni proposta va assegnata a una sola categoria del sito.
- Le 36 esperienze oggi sul sito sono esempi: le proposte approvate le sostituiranno. Non pubblicare mai: solo bozze.

PRIORITÀ NELLA SCELTA
- A parità di regole, vengono prima le attività con più recensioni e più vendute (le piattaforme le segnalano come "bestseller", "più prenotate", "top venduto"): ordinare i candidati per numero di recensioni e volume di prenotazioni, e proporre i primi di ogni categoria.
- Indicare nella proposta il numero di recensioni e, se disponibile, il segnale di vendita della piattaforma.

REGOLE DURE (passa o non passa)
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
    id: 'scout-eventi',
    name: 'Scout eventi',
    role: 'Calendario della città',
    mission: 'Trova cosa succede a Napoli nelle prossime settimane e lo propone per la sezione Cosa fare.',
    duties: [
      'Legge le fonti indicate: Comune, teatri, musei, testate locali, Eventbrite.',
      'Estrae data, orario, luogo, prezzo e link; scarta i doppioni e gli eventi già passati.',
      'Scrive una descrizione di due frasi nella voce di Cose Fighe.',
      'Segnala "da non perdere" solo per gli eventi grandi o rari.',
    ],
    needs: ['Le fonti qui sotto'],
    produces: 'Eventi in bozza nella sezione Eventi; online la notte dopo l\u2019approvazione.',
    command: '/scout-eventi',
    defaultCadence: 'settimanale',
    reportsTo: 'Tu approvi nella sezione Eventi (o in automatico per le fonti fidate).',
    defaultRules: `FONTI (aggiungi o togli righe)
- comune.napoli.it (eventi e manifestazioni)
- teatrosancarlo.it, teatrobellini.it, teatroaugusteo.it
- mann-napoli.it, capodimonte.cultura.gov.it, museomadre.it
- napolitoday.it/eventi, napoli.repubblica.it/tempo-libero
- eventbrite.it (Napoli), palapartenope.it, arenaflegrea.it
- grandenapoli.it, napolidavivere.it (agende della città: ottime per scoprire cosa c'è)

DALLE FONTI SI PRENDONO SOLO I FATTI
- Da testate e agende (napolitoday, grandenapoli, napolidavivere) prendi solo data, orario, luogo, prezzo e il link dell'organizzatore: mai copiare o parafrasare le loro frasi. La descrizione la scrivi tu, in due frasi nostre.
- Quando puoi, verifica alla fonte originale (organizzatore, teatro, museo, Comune) e linka quella, non la testata.

REGOLE
- Solo Napoli e provincia; solo eventi con data certa nelle prossime 8 settimane.
- Niente eventi già online o già scartati (controlla titolo e data).
- Categorie: food, outdoor, sport, arte, laboratori, spettacoli, oppure "In città" per feste e mercati.
- Prezzo scritto come sul sito: "Gratis", "€12", "da €25".
- "Da non perdere" al massimo per 2 eventi a settimana.`,
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
  {
    id: 'traduci-inglese',
    name: 'Traduttore',
    role: 'Versione inglese',
    mission: 'Traduce in inglese ogni esperienza, evento e articolo nuovo, così la versione /en resta completa.',
    duties: [
      'Cerca i contenuti pubblicati che non hanno ancora la versione inglese.',
      'Li traduce nella voce del sito, in inglese britannico, con titoli pensati per chi cerca da fuori.',
      'Salta i tour che non si fanno in inglese: nella versione inglese non compaiono.',
      'Controlla i file e pubblica: il sito si rigenera da solo.',
    ],
    needs: ['Le regole di stile in agents/inglese-regole.md'],
    produces: 'Le traduzioni nuove online sotto /en, di solito il giorno stesso.',
    command: '/traduci-inglese',
    defaultCadence: 'giornaliera',
    reportsTo: 'Lavora da solo; nel riepilogo trovi cosa ha tradotto.',
    defaultRules: `STILE
- Inglese britannico, voce del posto, frasi corte. Niente punti esclamativi, niente trattini lunghi.
- Nomi propri e piatti in italiano, con una breve spiegazione la prima volta.

COSA NON TRADURRE
- Tour che non si fanno in inglese (tranne gli spettacoli).
- Eventi già finiti.`,
  },
]
