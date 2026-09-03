import type { Article } from '../types'

const AUTHORS = {
  alessia: { author: 'Alessia Morra', authorRole: 'Head of Experiences', authorImage: '/meditazione.webp' },
  fabio: { author: 'Fabio Santoro', authorRole: 'Creative Director', authorImage: '/trekking.webp' },
  gennaro: { author: 'Gennaro Iovine', authorRole: 'Fondatore & CEO', authorImage: '/cose-beve.webp' },
}

export const ARTICLES: Article[] = [
  {
    slug: 'street-food-napoli-guida-completa',
    title: 'Street food napoletano: la guida completa per mangiare come un local',
    excerpt:
      'Dal cuoppo fritto alla frittatina, dai friarielli con salsiccia alla sfogliatella calda alle 7 di mattina. Tutto quello che devi mangiare a Napoli per capire davvero la città.',
    category: 'Food',
    categorySlug: 'food',
    ...AUTHORS.alessia,
    date: '2026-03-15',
    readingTime: 7,
    coverImage: '/img/naples-pizza.webp',
    tags: ['street food', 'cibo', 'napoli', 'quartieri spagnoli', 'local'],
    body: [
      {
        type: 'paragraph',
        content:
          "Napoli è una delle capitali mondiali del cibo di strada. Non è un'iperbole: è una realtà che i napoletani conoscono bene e che ogni viaggiatore, se vuole capire la città vera, deve vivere almeno una volta. Mangiare in piedi, in un vicolo, con la carta oleata in mano, è un rito con radici profonde nella cultura partenopea.",
      },
      { type: 'heading', content: 'Dove iniziare: i Quartieri Spagnoli' },
      {
        type: 'paragraph',
        content:
          "I Quartieri Spagnoli sono il cuore pulsante dello street food napoletano. Il labirinto di vicoli alle spalle di via Toledo è il posto perfetto per perdersi e mangiare. Qui trovi friggitorie aperte dall'alba, pizzerie al taglio che sfornano di continuo e banchetti di frutta e verdura.",
      },
      {
        type: 'list',
        content: 'I must-eat dei Quartieri Spagnoli:',
        items: [
          'Cuoppo di frittura mista: pesce o verdure fritte nel classico cono di carta',
          'Pizza fritta: la versione fritta della pizza, ripiena di ricotta e cicoli',
          'Panzarotti: crocchette di patate fritte, spesso con un cuore di formaggio',
          'Frittatina di pasta: pasta al ragù fritta a forma di polpetta piatta',
          "Zeppole salate: frittelle soffici servite calde direttamente dall'olio",
        ],
      },
      { type: 'heading', content: 'La colazione napoletana: un rito da non perdere' },
      {
        type: 'paragraph',
        content:
          "Se pensi che la colazione sia un pasto secondario, Napoli ti farà cambiare idea. La sfogliatella, rigorosamente calda e appena sfornata, è un'esperienza quasi religiosa. Esiste in due varianti: la riccia (la più famosa, con la sfoglia croccante) e la frolla (più morbida, con pasta frolla). Entrambe sono ripiene di semola, ricotta, arancia candita e cannella.",
      },
      {
        type: 'tip',
        content:
          'Arriva in una delle pasticcerie storiche del centro entro le 8 di mattina per trovare le sfogliatelle appena uscite dal forno. Dopo le 10 non sono più le stesse.',
      },
      { type: 'heading', content: 'Il mercato di Porta Nolana: pesce e sapori autentici' },
      {
        type: 'paragraph',
        content:
          "Per un'esperienza di mercato autentica, Porta Nolana è la destinazione giusta. Questo mercato storico, tra i più antichi di Napoli, è famoso soprattutto per il pesce freschissimo che arriva direttamente dai pescatori del golfo. Non mancano banchi di frutta esotica, spezie, formaggi e salumi campani.",
      },
      {
        type: 'quote',
        content:
          "A Napoli si mangia per strada, si litiga per strada, ci si innamora per strada. La città vera è nei vicoli, non nei ristoranti.",
      },
      { type: 'heading', content: 'La pizza: un discorso a parte' },
      {
        type: 'paragraph',
        content:
          "Parlare di street food napoletano senza parlare di pizza sarebbe un'eresia. L'arte del pizzaiuolo napoletano è patrimonio UNESCO dal 2017, e per una buona ragione: non esiste nulla di simile al mondo. L'impasto soffice, il cornicione alveolato, la mozzarella di bufala campana, il pomodoro San Marzano. Ogni elemento ha la sua storia.",
      },
      {
        type: 'list',
        content: 'Le pizzerie storiche da non perdere:',
        items: [
          'Da Michele: la più famosa, solo margherita e marinara, fila sempre',
          'Sorbillo: moderna ma rispettosa della tradizione, ottima per la pizza fritta',
          'Starita: a Materdei, una delle migliori pizze fritte della città',
          'Di Matteo: nel cuore di Spaccanapoli, frequentata dai napoletani ogni giorno',
        ],
      },
      { type: 'heading', content: 'Quando andare e come muoversi' },
      {
        type: 'paragraph',
        content:
          'Lo street food napoletano non ha orari fissi, ma ci sono momenti migliori di altri. La mattina presto (7-9) è il momento delle sfogliatelle e del caffè al bancone. A metà mattina (10-12) partono le friggitorie. Il pranzo (13-15) è il momento di punta della pizza al taglio. La sera (18-21) è perfetta per un cuoppo o una pizza fritta mentre si passeggia.',
      },
      {
        type: 'tip',
        content:
          "Per scoprire i posti migliori con una guida del posto, dai un'occhiata al nostro tour di street food nei Quartieri Spagnoli: 3 ore, degustazioni incluse, massimo 12 persone per gruppo.",
      },
    ],
  },
  {
    slug: 'trekking-vesuvio-guida',
    title: 'Trekking sul Vesuvio: tutto quello che devi sapere prima di partire',
    excerpt:
      "Il vulcano più famoso d'Europa ti aspetta. Dalla scelta del percorso all'equipaggiamento, dagli orari migliori alla vista sul golfo: la guida completa per salire sul Vesuvio.",
    category: 'Outdoor',
    categorySlug: 'outdoor',
    ...AUTHORS.fabio,
    date: '2026-03-28',
    readingTime: 9,
    coverImage: '/img/vesuvio-cover.webp',
    tags: ['vesuvio', 'trekking', 'outdoor', 'napoli', 'vulcano'],
    body: [
      {
        type: 'paragraph',
        content:
          "Il Vesuvio è molto più di un vulcano. È un simbolo, un'icona, un personaggio che domina il golfo di Napoli con la sua sagoma inconfondibile. Salirci significa godere di una delle viste più spettacolari d'Italia, ma anche toccare con mano la potenza della geologia, la storia dell'eruzione del 79 d.C. e il silenzio surreale del cratere.",
      },
      { type: 'heading', content: 'I percorsi disponibili' },
      {
        type: 'paragraph',
        content:
          'Al contrario di quanto pensano in molti, non esiste un solo modo per raggiungere la cima. Il percorso più comune parte dal piazzale a quota 1.000 metri, ma ci sono varianti più impegnative che partono dal basso e attraversano le colate laviche.',
      },
      {
        type: 'list',
        content: 'I principali percorsi:',
        items: [
          'Gran Cono (sentiero ufficiale): circa 2 ore tra andata e ritorno dal piazzale',
          'Via Matrone: il percorso storico, parte da Ercolano, 4-5 ore',
          'Sentiero Tirone: tra le aree di lava antica, meno frequentato e più selvaggio',
          'Percorso vulcanologico: con guida certificata, spiega la geologia del vulcano',
        ],
      },
      { type: 'heading', content: 'Quando andare: stagione e orari' },
      {
        type: 'paragraph',
        content:
          "Il Parco Nazionale del Vesuvio è aperto tutto l'anno, ma i periodi migliori sono la primavera (aprile-giugno) e l'autunno (settembre-ottobre). In estate il caldo può essere intenso e le file al piazzale lunghe. In inverno il sentiero può chiudere per maltempo.",
      },
      {
        type: 'tip',
        content:
          'Il momento migliore per arrivare in cima è tra le 8 e le 10 di mattina: meno folla, luce migliore per le foto e temperatura più fresca.',
      },
      { type: 'heading', content: 'Cosa mettere nello zaino' },
      {
        type: 'list',
        content: "L'equipaggiamento essenziale:",
        items: [
          'Scarpe da trekking con suola robusta (il terreno lavico è irregolare)',
          'Almeno 1,5 litri di acqua a persona',
          "Giacca antivento (in cima c'è sempre vento)",
          'Cappello e crema solare',
          'Snack energetici',
          'Bastoncini da trekking (opzionali ma utili)',
        ],
      },
      { type: 'heading', content: 'La vista dal cratere' },
      {
        type: 'paragraph',
        content:
          "Arrivare sul bordo del cratere è un'esperienza difficile da descrivere. Sotto di te il cratere ha un diametro di circa 500 metri e una profondità di quasi 300. Il vapore delle fumarole ti ricorda che il vulcano è ancora attivo: l'ultima eruzione risale al 1944. Tutt'intorno, il panorama abbraccia il golfo di Napoli e le isole di Capri, Ischia e Procida.",
      },
      {
        type: 'quote',
        content:
          'Stare sul bordo del cratere del Vesuvio è come stare sul confine tra il mondo degli uomini e quello della terra. Un posto che ti fa sentire piccolo nel modo migliore possibile.',
      },
      { type: 'heading', content: 'Informazioni pratiche' },
      {
        type: 'list',
        content: 'Da sapere prima di partire:',
        items: [
          'Ingresso al Gran Cono: biglietto a pagamento, da prenotare online nei periodi di punta',
          'Guida certificata obbligatoria per i percorsi avanzati',
          'Trasporto: autobus da Ercolano (stazione Circumvesuviana)',
          'Durata media: 4 ore con guida, 2 ore per il solo Gran Cono',
          'Cani ammessi al guinzaglio',
        ],
      },
      {
        type: 'tip',
        content:
          "Con il nostro tour guidato del Vesuvio hai inclusi trasporto da Napoli, guida vulcanologica certificata e biglietto d'ingresso. Massimo 15 persone per gruppo.",
      },
    ],
  },
  {
    slug: 'napoli-sotterranea-tunnel-greci',
    title: 'Napoli Sotterranea: il mondo segreto sotto la città',
    excerpt:
      "A quaranta metri sotto il livello stradale esiste un'altra Napoli. Tunnel greci del IV secolo a.C., acquedotti romani, rifugi della Seconda guerra mondiale. Un viaggio nel tempo in verticale.",
    category: 'Arte',
    categorySlug: 'arte',
    ...AUTHORS.gennaro,
    date: '2026-04-01',
    readingTime: 6,
    coverImage: '/img/napoli-sotterranea-cover.webp',
    tags: ['napoli sotterranea', 'storia', 'arte', 'cultura', 'underground'],
    body: [
      {
        type: 'paragraph',
        content:
          "Quando cammini per Spaccanapoli o piazza San Gaetano stai percorrendo strade costruite sopra strati di storia millenaria. A quaranta metri di profondità esiste letteralmente un'altra città: tunnel scavati dai greci nel IV secolo a.C., ampliati dai romani, usati come acquedotti nel Medioevo, trasformati in depositi nell'Ottocento e infine adibiti a rifugi antiaerei durante la Seconda guerra mondiale.",
      },
      { type: 'heading', content: 'Le origini greche: Neapolis e i tunnel' },
      {
        type: 'paragraph',
        content:
          "Napoli nasce come colonia greca, Neapolis, la città nuova, intorno al 470 a.C. I greci avevano bisogno di pietra per costruire mura e strade. Iniziarono a estrarre il tufo giallo napoletano, una pietra vulcanica leggera ma resistente, creando gallerie sotterranee che nel tempo diventarono la spina dorsale dell'infrastruttura idrica della città.",
      },
      {
        type: 'list',
        content: 'Cosa troverai nei tunnel:',
        items: [
          'Gallerie di estrazione del tufo del IV-III secolo a.C.',
          'Cisterne romane del I-II secolo d.C.',
          "Cunicoli medievali dell'acquedotto greco-romano",
          'Graffiti e scritte dei rifugiati durante i bombardamenti del 1943',
          'Una sala teatro scavata nel tufo, usata dai rifugiati per le rappresentazioni',
        ],
      },
      { type: 'heading', content: "Il periodo romano: l'acquedotto" },
      {
        type: 'paragraph',
        content:
          "I romani trasformarono i tunnel greci in un sistema idrico sofisticato che serviva l'intera città. L'acquedotto augusteo, costruito nel I secolo a.C., portava l'acqua dalle sorgenti del Serino fino alle cisterne sotterranee di Napoli. Il sistema rimase in uso fino al 1885, quando un'epidemia di colera spinse le autorità a costruire un nuovo acquedotto moderno.",
      },
      {
        type: 'quote',
        content:
          "Napoli è una città a strati. Non si capisce il presente se non si conosce tutto quello che c'è sotto, letteralmente.",
      },
      { type: 'heading', content: 'La Seconda guerra mondiale: i rifugi antiaerei' },
      {
        type: 'paragraph',
        content:
          "Tra il 1940 e il 1944 Napoli fu una delle città più bombardate d'Italia. Le gallerie diventarono rifugio per migliaia di civili durante i raid aerei. Nelle cavità del tufo trovarono riparo migliaia di persone alla volta. Vivevano lì per settimane: dormivano su brande di legno, cucinavano su fornelli di fortuna, allestivano piccoli teatri e cappelle.",
      },
      {
        type: 'tip',
        content:
          'I rifugi sono rimasti quasi intatti: troverai ancora i graffiti sui muri, gli scarabocchi dei bambini, i segni del quotidiano di chi viveva sottoterra. Alcuni oggetti originali sono stati lasciati al loro posto.',
      },
      { type: 'heading', content: 'Come visitare Napoli Sotterranea' },
      {
        type: 'list',
        content: 'Informazioni pratiche:',
        items: [
          'Ingresso: piazza San Gaetano 68, nel cuore di Spaccanapoli',
          'Durata del tour guidato: circa 80 minuti',
          'Temperatura nelle gallerie: 15 gradi costanti (porta una felpa)',
          'Alcuni passaggi sono stretti: chi soffre di claustrofobia può saltarli',
          'Età minima consigliata: 6 anni',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Visitare Napoli Sotterranea non è solo un tour turistico: è un modo per capire perché questa città è così unica. La resilienza, la capacità di adattarsi, la stratificazione culturale. Tutto si capisce meglio camminando dove camminavano i greci 2.500 anni fa.',
      },
    ],
  },
  {
    slug: 'quartieri-napoli-da-scoprire',
    title: '5 quartieri di Napoli da scoprire oltre il centro storico',
    excerpt:
      'Spaccanapoli è bella, ma Napoli è molto di più. Dai palazzi liberty di Chiaia ai murales di Ponticelli, dal mercato di Antignano alla costa di Bagnoli: i quartieri alternativi da esplorare.',
    category: 'Outdoor',
    categorySlug: 'outdoor',
    ...AUTHORS.alessia,
    date: '2026-04-08',
    readingTime: 5,
    coverImage: '/img/napoli-quartieri.webp',
    tags: ['quartieri', 'napoli', 'local', 'alternativo', 'esplorazione'],
    body: [
      {
        type: 'paragraph',
        content:
          'Napoli ha molte facce. Quella delle cartoline è bella e reale, ma è solo la superficie. Per capire davvero la città bisogna entrare nei quartieri, quelli che i turisti non raggiungono, quelli dove vivono i napoletani.',
      },
      { type: 'heading', content: '1. Chiaia: il liberty partenopeo' },
      {
        type: 'paragraph',
        content:
          'Chiaia è il quartiere elegante di Napoli, affacciato sul mare e costellato di palazzi in stile liberty. Via dei Mille e via Filangieri sono le arterie dello shopping di qualità. Ma Chiaia è anche il quartiere dei locali storici: il Gran Caffè Gambrinus è a due passi, mentre piazza dei Martiri è uno degli angoli più fotogenici della città.',
      },
      { type: 'heading', content: '2. Rione Sanità: la rinascita di un quartiere' },
      {
        type: 'paragraph',
        content:
          'Il Rione Sanità ha avuto una fama difficile per decenni. Oggi è uno dei quartieri più interessanti di Napoli: un esperimento di riqualificazione sociale che ha trasformato le Catacombe di San Gennaro in una delle attrazioni culturali più originali della città. I murales sui palazzi, le botteghe artigiane, il mercato di via Vergini: tutto racconta una storia di rinascita.',
      },
      {
        type: 'tip',
        content:
          'Non perderti le Catacombe di San Gennaro: gestite da una cooperativa di giovani del quartiere, offrono un tour coinvolgente e autentico. Una delle visite più belle di tutta Napoli.',
      },
      { type: 'heading', content: "3. Ponticelli: l'arte di strada nel quartiere popolare" },
      {
        type: 'paragraph',
        content:
          "Ponticelli è periferia nel senso più autentico del termine. Lontana dai circuiti turistici, questa zona orientale di Napoli è diventata un museo a cielo aperto di street art. Il progetto Parco dei Murales ha portato artisti da tutta Italia e dall'Europa a dipingere i palazzi popolari, trasformando facciate grigie in opere che parlano di memoria, identità e riscatto.",
      },
      { type: 'heading', content: '4. Antignano: il mercato del quartiere' },
      {
        type: 'paragraph',
        content:
          "Antignano è una zona residenziale del Vomero, conosciuta soprattutto per il suo mercato rionale, uno dei più vivaci di Napoli. Qui trovi di tutto: frutta e verdura campana, formaggi, abbigliamento, casalinghi. È la Napoli reale, senza filtri.",
      },
      { type: 'heading', content: '5. Bagnoli: tra futuro e memoria industriale' },
      {
        type: 'paragraph',
        content:
          "Bagnoli è un caso urbano unico in Italia. Dove c'era l'Italsider, l'acciaieria che ha impiegato generazioni di napoletani, oggi c'è un grande progetto di recupero. La Città della Scienza, il litorale di Coroglio, i resti delle strutture industriali diventati set fotografici: Bagnoli è un quartiere sospeso tra memoria industriale e futuro.",
      },
      {
        type: 'quote',
        content:
          'Napoli non finisce mai. Ogni volta che pensi di aver visto tutto, svolti in un vicolo e ti trovi in un mondo completamente diverso.',
      },
    ],
  },
  {
    slug: 'aperitivo-napoli-dove-andare',
    title: 'Aperitivo a Napoli: i migliori bar e cosa ordinare',
    excerpt:
      "A Napoli l'aperitivo non è solo Spritz. È un rito sociale che parte dal tardo pomeriggio e si confonde con la cena. La guida ai posti giusti per bere bene nella città del sole.",
    category: 'Food',
    categorySlug: 'food',
    ...AUTHORS.gennaro,
    date: '2026-04-12',
    readingTime: 4,
    coverImage: '/img/napoli-aperitivo.webp',
    tags: ['aperitivo', 'bar', 'napoli', 'spritz', 'nightlife'],
    body: [
      {
        type: 'paragraph',
        content:
          "A Napoli l'aperitivo è un'istituzione, ma funziona in modo diverso dal Nord Italia. Non esiste la cultura del buffet milanese. Si ordina un drink, arriva qualcosa da sgranocchiare, si sta fuori sul marciapiede o in piazzetta, e si parla. Tanto. Per ore.",
      },
      { type: 'heading', content: 'Cosa si beve a Napoli' },
      {
        type: 'list',
        content: 'I drink più popolari:',
        items: [
          "Spritz con Campari: più amaro rispetto all'Aperol, più napoletano",
          'Limoncello spritz: con limoncello artigianale della costiera, freschissimo',
          'Falanghina dei Campi Flegrei: vino bianco locale, poco conosciuto ma eccellente',
          'Gin tonic con erbe del Vesuvio: la versione locale del classico',
          'Americano: vermut e Campari, il classico senza tempo',
        ],
      },
      { type: 'heading', content: "I quartieri per l'aperitivo" },
      {
        type: 'paragraph',
        content:
          "Ogni quartiere ha la sua scena. Chiaia è più mondana e curata. I Quartieri Spagnoli sono più autentici e meno turistici. Il Vomero è il quartiere dei giovani napoletani. La Riviera di Chiaia, con i locali affacciati sul mare, è perfetta per il tramonto.",
      },
      {
        type: 'tip',
        content:
          "L'orario giusto è tra le 18:30 e le 20:30. Prima è troppo presto, dopo i napoletani sono già a cena. La magia succede in quella finestra.",
      },
      { type: 'heading', content: 'Stuzzichini: cosa aspettarsi' },
      {
        type: 'paragraph',
        content:
          "L'aperitivo napoletano arriva spesso con piccoli stuzzichini inclusi nel prezzo del drink: taralli 'nzogna e pepe, noccioline, olive di Gaeta, fettine di provolone del Monaco. In alcuni locali del centro storico trovi anche crostini con stracciatella o pesto di pistacchio.",
      },
      {
        type: 'quote',
        content:
          "L'aperitivo napoletano non è un pasto. È una filosofia. È il momento in cui la città rallenta, si guarda intorno e si ricorda di essere viva.",
      },
    ],
  },
  {
    slug: 'workshop-ceramica-napoli',
    title: "Workshop di ceramica a Napoli: dove imparare l'arte antica",
    excerpt:
      'Dalla maiolica di Vietri alle porcellane di Capodimonte, la ceramica è parte del DNA campano. A Napoli esistono laboratori artigiani che aprono le porte ai curiosi: ecco come partecipare.',
    category: 'Laboratori',
    categorySlug: 'laboratori',
    ...AUTHORS.fabio,
    date: '2026-04-15',
    readingTime: 5,
    coverImage: '/img/napoli-ceramica.webp',
    tags: ['ceramica', 'laboratori', 'artigianato', 'capodimonte', 'workshop'],
    body: [
      {
        type: 'paragraph',
        content:
          'La Campania ha una tradizione ceramica millenaria. Le maioliche di Vietri sul Mare, le porcellane di Capodimonte, le terrecotte della costa: ogni zona ha il suo stile, le sue tecniche, i suoi motivi. A Napoli questa tradizione sopravvive in una rete di laboratori artigiani sparsi tra il centro storico e la periferia.',
      },
      { type: 'heading', content: 'La porcellana di Capodimonte' },
      {
        type: 'paragraph',
        content:
          'La Real Fabbrica di Capodimonte nasce nel 1743 per volere di Carlo di Borbone, che voleva rivaleggiare con le porcellane di Meissen. Le caratteristiche della porcellana capodimontese, la bianchezza, i rilievi floreali, le figure mitologiche, sono riconoscibili in tutto il mondo. Ancora oggi alcuni maestri tramandano queste tecniche in laboratori aperti al pubblico.',
      },
      {
        type: 'list',
        content: 'Cosa si impara in un workshop di ceramica:',
        items: [
          'Tecniche di tornitura al tornio elettrico',
          'Modellazione a mano (pizzicato, colombino, lastre)',
          'Decorazione con ossidi e smalti',
          'Principi di cottura in forno a gas e a legna',
          'Storia della ceramica campana',
        ],
      },
      { type: 'heading', content: 'I laboratori da non perdere' },
      {
        type: 'paragraph',
        content:
          'Nel centro storico, attorno a via San Gregorio Armeno, la famosa via dei presepi, diversi laboratori aprono le porte per corsi e workshop. Alcuni si concentrano sulla tradizione presepiale, altri insegnano la lavorazione della maiolica con gli smalti colorati tipici.',
      },
      {
        type: 'tip',
        content:
          "I workshop di ceramica vanno bene anche per chi non ha mai toccato l'argilla. Non serve esperienza: i maestri guidano passo dopo passo. Porta vestiti che non temi di sporcare.",
      },
      { type: 'heading', content: 'Portare a casa un pezzo unico' },
      {
        type: 'paragraph',
        content:
          "La cosa più bella dei workshop è che alla fine porti a casa il pezzo che hai creato tu, dopo la cottura in forno. C'è qualcosa di profondamente soddisfacente nel tornare a casa sapendo che sullo scaffale hai una tazza, un piatto o un vaso fatto con le tue mani in un laboratorio napoletano.",
      },
      {
        type: 'quote',
        content:
          "L'argilla non mente. Se sei distratto, il vaso crolla. Se sei presente, qualcosa di bello emerge. È la lezione più onesta che ho mai ricevuto.",
      },
      {
        type: 'tip',
        content:
          "Dai un'occhiata ai nostri workshop di ceramica e mosaico nel centro storico: 2-3 ore con un maestro artigiano, materiali inclusi, pezzo da portare a casa.",
      },
    ],
  },
]

export const ARTICLES_BY_DATE = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1))

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return ARTICLES.filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const score = (x: Article) => (x.categorySlug === article.categorySlug ? 1 : 0)
      return score(b) - score(a)
    })
    .slice(0, limit)
}
