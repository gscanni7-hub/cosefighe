/**
 * Testi delle pagine categoria: un'introduzione nostra e quattro domande frequenti per ognuna.
 * Le stesse risposte finiscono nei dati strutturati (FAQPage), quindi devono restare identiche a quelle in pagina.
 * Niente prezzi puntuali né nomi di operatori: i prezzi veri sono nelle card, aggiornati dal database.
 */
export interface CategoryText {
  intro: string
  faq: { q: string; a: string }[]
}

export const CATEGORY_TEXTS: Record<string, CategoryText> = {
  food: {
    intro:
      'A Napoli si mangia in piedi, per strada, a tutte le ore: pizza a portafoglio, frittatina di pasta, cuoppo di fritto, sfogliatella calda, babà. Il problema non è trovare da mangiare, è sapere dove. I tour che abbiamo scelto risolvono questo: una guida del posto, sei o sette assaggi nelle botteghe giuste tra via dei Tribunali, la Pignasecca e la Sanità, due o tre ore a piedi. Accanto ai giri di street food trovi le cose più lente: il pranzo in cantina sulle pendici del Vesuvio, l’aperitivo con le polpette a Piazza Bellini, il giro delle pizze. Tutte hanno il prezzo della piattaforma e il nostro giudizio nella scheda.',
    faq: [
      { q: 'Quanto costa un tour di street food a Napoli?', a: 'La maggior parte dei tour guidati con assaggi costa tra 25 e 70 euro a persona e dura dalle due alle tre ore. Il prezzo comprende la guida e tutte le degustazioni; di solito si arriva a fine giro senza bisogno di cenare. I pranzi in cantina sul Vesuvio, con trasporto e vini, costano di più.' },
      { q: 'Cosa si mangia in un tour gastronomico a Napoli?', a: 'Quasi sempre pizza a portafoglio o fritta, frittatina di pasta, taralli, mozzarella, un dolce tra sfogliatella e babà, e un caffè o un limoncello. Ogni scheda elenca gli assaggi compresi. Chi ha intolleranze o è vegetariano deve segnalarlo alla prenotazione: non tutti i tour possono adattarsi.' },
      { q: 'Meglio un tour di street food a pranzo o la sera?', a: 'A pranzo i mercati sono aperti e le friggitorie sfornano di continuo; la sera il centro antico è più vivo e il giro si chiude bene con un bicchiere a Piazza Bellini. In entrambi i casi conviene arrivare a stomaco vuoto e non prenotare un ristorante subito dopo.' },
      { q: 'I tour gastronomici sono adatti ai bambini?', a: 'In genere sì: si cammina poco tra una sosta e l’altra e il cibo piace a tutte le età. Conta la durata: sopra le tre ore con i più piccoli diventa faticoso. Le schede indicano durata e dimensione del gruppo, e quasi tutte le attività si cancellano gratis fino a 24 ore prima.' },
    ],
  },
  outdoor: {
    intro:
      'Napoli è una città di mare e di colline, e da qui si parte per alcuni dei posti più belli d’Italia. In questa categoria trovi due cose. Le uscite in città: il golfo in barca da Castel dell’Ovo a Posillipo, la Gaiola, le scale del Petraio tra Vomero e Chiaia, i Quartieri Spagnoli con qualcuno del quartiere. E le gite fuori porta in giornata: la Costiera Amalfitana tra Positano, Amalfi e Ravello, Capri in aliscafo o in gozzo, Ischia e Procida in barca, il Vesuvio fino al cratere, Pompei con Sorrento. Per ognuna la scheda dice come si svolge, quanto dura davvero e per chi è adatta.',
    faq: [
      { q: 'Quali gite di un giorno si possono fare da Napoli?', a: 'Le più richieste sono Pompei, il Vesuvio, la Costiera Amalfitana, Capri, Ischia e Procida e la Reggia di Caserta. Pompei ed Ercolano si fanno anche in mezza giornata; Costiera e isole richiedono la giornata intera, di solito otto o nove ore con partenza dal centro o dal porto.' },
      { q: 'Conviene andare in Costiera Amalfitana con un tour o da soli?', a: 'Da soli si dipende da treni, bus affollati e traghetti, e in una giornata si vede un paese solo. Con un tour in minibus si toccano Positano, Amalfi e spesso Ravello o Sorrento senza pensare a parcheggi e coincidenze. Chi ha due giorni può farla con calma per conto suo.' },
      { q: 'Quando è il periodo migliore per le uscite in barca a Napoli?', a: 'Da maggio a ottobre. A settembre e nella prima metà di ottobre il mare è ancora caldo e le barche sono meno piene che in agosto. Le uscite al tramonto sono le più richieste: meglio prenotarle con qualche giorno di anticipo. Con mare mosso gli operatori spostano la data o rimborsano.' },
      { q: 'Si può salire sul Vesuvio senza guida?', a: 'Sì: il sentiero fino all’orlo del cratere parte dal parcheggio a quota mille e il biglietto del parco si prenota online con orario. Le escursioni organizzate aggiungono il trasporto da Napoli o Pompei e spesso abbinano gli scavi o una sosta in cantina, che da soli sono più complicati da incastrare.' },
    ],
  },
  sport: {
    intro:
      'Muoversi a Napoli significa soprattutto acqua e pedali. Sott’acqua ci sono le ville romane sommerse di Baia e il parco della Gaiola a Posillipo, che si vedono con maschera e pinne insieme a un biologo marino: archeologia fatta nuotando. In superficie, il centro si gira bene in bicicletta, dal Duomo al Plebiscito fino al lungomare pedonale, e per le salite del Vomero e di Posillipo ci sono le e-bike a ruote larghe. Sono esperienze per chi vuole vedere la città facendo qualcosa, non per atleti: la scheda di ognuna dice quanto impegno serve e da che età si può fare.',
    faq: [
      { q: 'Serve esperienza per fare snorkeling a Baia o a Posillipo?', a: 'No. Basta saper nuotare: le rovine sono a pochi metri di profondità e si vedono dalla superficie con maschera e boccaglio. L’attrezzatura è compresa e l’uscita è guidata. Per le immersioni con le bombole serve invece il brevetto, oppure si fa un battesimo del mare con l’istruttore.' },
      { q: 'Napoli si può girare in bicicletta?', a: 'Il centro basso sì: via Duomo, il Rettifilo, piazza Municipio, il Plebiscito e il lungomare fino a Mergellina sono pianeggianti, e il lungomare è chiuso alle auto. Le colline richiedono una bici elettrica. I tour guidati durano circa tre ore e includono bici e casco.' },
      { q: 'Fino a quando si può fare il bagno a Napoli?', a: 'Di norma da maggio a metà ottobre. A settembre l’acqua è ancora intorno ai 24 gradi ed è il mese migliore per lo snorkeling, con il mare più limpido e meno barche. D’inverno le uscite in mare si riducono e restano soprattutto bici e camminate.' },
      { q: 'Le attività sportive sono adatte ai ragazzi?', a: 'Lo snorkeling di solito è aperto dai dieci anni in su con un adulto, i tour in bici dipendono dall’altezza per le biciclette disponibili. Ogni scheda riporta durata e gruppo; per i limiti di età precisi fa fede la pagina della piattaforma, a cui porta il bottone Prenota.' },
    ],
  },
  arte: {
    intro:
      'Napoli ha duemilacinquecento anni uno sopra l’altro, e si visitano tutti. Sopra: Spaccanapoli e i decumani, il Cristo Velato, il Museo Archeologico con i tesori di Pompei, Capodimonte, la Certosa di San Martino, Palazzo Reale. Sotto: la Galleria Borbonica, Napoli Sotterranea, le catacombe di San Gennaro e San Gaudioso, il Cimitero delle Fontanelle. Fuori città: Pompei, Ercolano, la Reggia di Caserta. Abbiamo scelto le visite in cui la guida fa la differenza, archeologi e storici dell’arte che trasformano sale e rovine in storie. Nelle schede trovi cosa si vede, quanto dura e se l’ingresso è compreso.',
    faq: [
      { q: 'Serve prenotare il Cristo Velato?', a: 'Sì, quasi sempre. La Cappella Sansevero è piccola e gli ingressi sono a numero chiuso: senza biglietto preso in anticipo si rischia di non entrare o di perdere ore in fila. Le visite guidate che trovi qui includono l’ingresso con orario garantito e durano da mezz’ora a due ore e mezza con il giro del centro antico.' },
      { q: 'Meglio Pompei o Ercolano?', a: 'Pompei è enorme e dà l’idea di una città intera: servono almeno due o tre ore. Ercolano è più piccola e meglio conservata, con case a due piani, legni e mosaici, e si gira in un’ora e mezza. Con poco tempo o con il caldo conviene Ercolano; chi vuole la visita simbolo sceglie Pompei.' },
      { q: 'Quali sotterranei di Napoli conviene visitare?', a: 'La Galleria Borbonica per la storia recente: rifugi di guerra e auto d’epoca abbandonate. Napoli Sotterranea per le cisterne greche e romane a quaranta metri di profondità. Le catacombe di San Gennaro per gli affreschi paleocristiani. Sono visite diverse tra loro: chi resta più giorni ne fa due senza annoiarsi.' },
      { q: 'Vale la pena prendere una guida per il Museo Archeologico?', a: 'Sì. Il museo è grande e poco raccontato dalle didascalie: con un’archeologa in due ore si vedono i mosaici di Pompei, la collezione Farnese, i bronzi di Ercolano e il Gabinetto Segreto capendo cosa si ha davanti. Da soli conviene scegliere prima tre sezioni e fermarsi a quelle.' },
    ],
  },
  laboratori: {
    intro:
      'Il modo più diretto per portarsi a casa Napoli è imparare a fare qualcosa. I laboratori di pizza insegnano l’impasto, la stesura a mano e la cottura, e si mangia quello che si è preparato; quelli di pasta fresca mettono farina e uova sul tavolo per ravioli, fettuccine e gnocchi, quasi sempre con il tiramisù mentre si aspetta. Poi ci sono le cose meno ovvie: la mozzarella lavorata a mano in un caseificio di famiglia, il calzone in una pizzeria vera, la cena a casa di un napoletano con vista sul golfo. Durano due o tre ore, vanno bene con i bambini e con la pioggia, e partono da venti euro.',
    faq: [
      { q: 'Quanto dura e quanto costa un corso di pizza a Napoli?', a: 'Dalle due alle tre ore. I prezzi vanno da circa 25 a 60 euro a persona e comprendono ingredienti, grembiule, la pizza che si prepara e spesso una bevanda e il tiramisù. I corsi dentro una pizzeria in attività costano un po’ di più di quelli in laboratorio, ma si usa un forno vero.' },
      { q: 'I laboratori di cucina sono adatti ai bambini?', a: 'Sono tra le attività migliori da fare in famiglia: i bambini impastano, si sporcano e mangiano il risultato. Conviene scegliere i turni di mezzogiorno, così il laboratorio vale anche come pranzo. Durata e dimensione del gruppo sono indicate in ogni scheda.' },
      { q: 'In che lingua si tengono i corsi?', a: 'Quasi tutti in italiano e in inglese, alcuni anche in spagnolo o francese. La lingua è indicata nella scheda di ogni laboratorio, tra i dati in alto. Trattandosi di attività pratiche, si segue bene anche senza capire ogni parola.' },
      { q: 'Si può cancellare un laboratorio prenotato?', a: 'Nella maggior parte dei casi sì, gratis fino a 24 ore prima dell’inizio. La condizione esatta è scritta nella scheda alla voce Cancellazione e nella pagina della piattaforma dove si completa la prenotazione.' },
    ],
  },
  spettacoli: {
    intro:
      'La canzone napoletana è nata per voci nude e mandolini, e a Napoli si può ancora ascoltare così: concerti di un’ora in sale da cinquanta posti, senza amplificazione, con le storie di ogni brano raccontate tra una canzone e l’altra, da ’O sole mio alla tarantella. Sono serate brevi, che costano quanto una pizza e si incastrano bene prima o dopo cena. Per tutto il resto, concerti, teatro, opera nei cortili, rassegne nei musei, c’è il programma della città, che aggiorniamo ogni settimana con orari e prezzi controllati alla fonte.',
    faq: [
      { q: 'Dove ascoltare musica napoletana dal vivo a Napoli?', a: 'I concerti dedicati alla canzone classica si tengono ogni sera in piccole sale del centro, a pochi passi dal Museo Archeologico: un’ora di musica senza microfoni, con prenotazione consigliata. Per concerti ed eventi con una data precisa conviene guardare il programma settimanale nella pagina Cosa fare.' },
      { q: 'Quanto dura uno spettacolo di canzone napoletana?', a: 'Circa un’ora. È pensato per chi visita la città: si può andare prima di cena o subito dopo. I brani sono presentati anche in inglese, e il repertorio va dai classici dell’Ottocento alla tarantella.' },
      { q: 'Dove trovo concerti ed eventi a Napoli questa settimana?', a: 'Nella pagina Cosa fare a Napoli: scegli le date e vedi concerti, teatro, rassegne e serate nei musei con orario, luogo e prezzo. Si aggiorna ogni mattina, e ogni giovedì pubblichiamo l’articolo con il meglio del weekend.' },
      { q: 'Serve prenotare in anticipo?', a: 'Per le sale piccole sì: i posti sono pochi e nei weekend finiscono. Si prenota online con cancellazione gratuita fino a 24 ore prima. Per i grandi concerti all’Arena Flegrea o al Palapartenope i biglietti si comprano dai canali ufficiali indicati nel programma.' },
    ],
  },
}
