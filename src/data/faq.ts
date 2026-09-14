/**
 * Domande frequenti della pagina "Cosa fare a Napoli".
 * Testi nostri. Le stesse risposte finiscono nei dati strutturati (FAQPage),
 * quindi devono restare identiche a quelle mostrate in pagina.
 */
export interface Faq {
  q: string
  a: string
  /** Link utile in fondo alla risposta. */
  link?: { label: string; to: string }
}

export const COSA_FARE_FAQ: Faq[] = [
  {
    q: 'Cosa fare a Napoli quando piove?',
    a: 'Napoli sotto la pioggia si vive al chiuso e sotto terra: il Museo Archeologico, la Cappella Sansevero con il Cristo Velato, la Galleria Borbonica e Napoli Sotterranea non risentono del tempo. In alternativa, un laboratorio di pizza o di pasta fresca occupa due o tre ore e si finisce mangiando quello che si è fatto.',
    link: { label: 'Le esperienze di arte e sotterranei', to: '/categoria/arte' },
  },
  {
    q: 'Cosa fare a Napoli la sera?',
    a: 'Il lungomare da Castel dell’Ovo a Mergellina, i tavolini di Piazza Bellini e i vicoli di Chiaia sono le tre serate classiche. Chi vuole qualcosa di organizzato trova i tour serali di street food nel centro storico, gli spettacoli in programma e, in estate, i concerti all’aperto: sono tutti nel programma qui sopra, con orario e prezzo.',
    link: { label: 'Spettacoli in città', to: '/categoria/spettacoli' },
  },
  {
    q: 'Cosa fare a Napoli gratis?',
    a: 'Molto: camminare Spaccanapoli da Piazza del Gesù a Forcella, salire al belvedere di San Martino al Vomero, attraversare la Galleria Umberto I, vedere i presepi di San Gregorio Armeno, sedersi a Piazza del Plebiscito e percorrere il lungomare pedonale. Nel programma gli eventi gratuiti hanno scritto “Gratis” o “Ingresso libero” accanto al titolo.',
    link: { label: 'Il programma di questa settimana', to: '/cosa-fare' },
  },
  {
    q: 'Cosa fare a Napoli con i bambini?',
    a: 'Le cose che funzionano meglio con i più piccoli sono quelle in cui si fa qualcosa: un laboratorio di pizza, una gita in barca nel golfo, la salita al Vesuvio con guida, Napoli Sotterranea per chi non ha paura del buio. Nelle schede delle esperienze trovi durata e gruppo, così scegli in base all’età.',
    link: { label: 'I laboratori', to: '/categoria/laboratori' },
  },
  {
    q: 'Cosa fare a Napoli in un giorno solo?',
    a: 'Mattina nel centro storico: Spaccanapoli, il Cristo Velato, una sfogliatella. Pranzo con una pizza, meglio se prenotata. Pomeriggio al Museo Archeologico oppure in funicolare al Vomero per il panorama. Sera sul lungomare. Se vuoi una guida che ti porti in giro, i tour a piedi del centro durano due o tre ore e coprono quasi tutto.',
    link: { label: 'Tutte le esperienze', to: '/esperienze' },
  },
  {
    q: 'Quanto costano le esperienze a Napoli?',
    a: 'Le esperienze che selezioniamo vanno da 10 a 120 euro a persona. Un tour di street food con una guida costa in genere tra 40 e 60 euro, un laboratorio di pizza o pasta tra 20 e 70, una gita in barca tra 40 e 80. I prezzi che vedi sono quelli delle piattaforme partner, aggiornati; quasi tutte le attività si possono cancellare gratis fino a 24 ore prima.',
    link: { label: 'Le esperienze per categoria', to: '/esperienze' },
  },
  {
    q: 'Come scegliete gli eventi del programma?',
    a: 'Li segnala la redazione, uno per uno: feste di quartiere, concerti, mostre, mercati, aperture straordinarie. Prendiamo solo quello per cui vale la pena spostarsi e controlliamo data, orario, luogo e prezzo alla fonte. Il programma si aggiorna ogni mattina.',
  },
]
