/**
 * La guida "Le 25 cose da fare a Napoli", dentro la pagina Cosa fare.
 * Testi nostri. Ogni voce può rimandare a un'esperienza del catalogo (per titolo, o suo inizio)
 * e alla sua categoria. Le foto sono quelle in /img con i crediti in credits.json.
 */
import type { EventCategory } from '../types'

export interface GuideItem {
  /** Ancora nella pagina: /cosa-fare#slug */
  slug: string
  title: string
  text: string
  image: string
  category: Exclude<EventCategory, 'citta'>
  /** Inizio del titolo dell'esperienza da proporre ("Prenota"). */
  experience?: string
  /** Si fa anche senza spendere. */
  free?: boolean
  /** Articolo del blog che approfondisce la voce. */
  article?: string
}

export const GUIDE_TITLE = 'Le 25 cose da fare a Napoli'
export const GUIDE_INTRO =
  'Venticinque cose che a Napoli valgono il viaggio, scelte da chi ci vive: monumenti, sotterranei, mercati, mare, cucina. Per ognuna diciamo perché vale, cosa aspettarsi e, quando esiste, l’esperienza migliore per farla con una guida, al prezzo della piattaforma. Le voci segnate «gratis» si fanno anche senza spendere un euro.'

export const GUIDE: GuideItem[] = [
  {
    slug: 'cristo-velato',
    article: 'napoli-in-un-giorno',
    title: 'Il Cristo Velato nella Cappella Sansevero',
    text: 'Un Cristo di marmo coperto da un velo che sembra stoffa, scolpito da Giuseppe Sanmartino nel 1753 in una cappella piccola e affollatissima tra Spaccanapoli e via Tribunali. Si gira intorno alla statua in silenzio, poi si scende a vedere le «macchine anatomiche», due scheletri con il sistema circolatorio a vista che da secoli alimentano leggende sul principe di Sansevero. Il biglietto va preso in anticipo: senza prenotazione la fila può bruciare un pomeriggio intero.',
    image: '/img/cristo-velato.webp',
    category: 'arte',
    experience: 'Cristo Velato con ingresso garantito',
  },
  {
    slug: 'spaccanapoli',
    article: 'cosa-fare-a-napoli-gratis',
    title: 'Spaccanapoli e i decumani, a piedi',
    text: 'La strada dritta che taglia in due il centro antico si vede dal Vomero come una fessura. Percorrerla da Piazza del Gesù a Forcella significa attraversare duemila anni in un chilometro: il chiostro maiolicato di Santa Chiara, San Domenico Maggiore, le botteghe dei presepi di San Gregorio Armeno, il Duomo a due passi. Si fa gratis e senza mappa, perdersi fa parte del gioco. Con una guida capisci cosa stai guardando, e i due chiostri li vedi davvero.',
    image: '/img/spaccanapoli.webp',
    category: 'arte',
    experience: 'Spaccanapoli, il chiostro di Santa Chiara',
    free: true,
  },
  {
    slug: 'mann',
    article: 'cosa-fare-a-napoli-quando-piove',
    title: 'Il Museo Archeologico Nazionale',
    text: 'Il MANN custodisce quello che gli scavi di Pompei ed Ercolano hanno restituito di meglio: i mosaici della Casa del Fauno, gli affreschi, i bronzi della Villa dei Papiri, il Toro e l’Ercole Farnese, il Gabinetto Segreto. È un museo enorme e senza una guida si esce stanchi e con la sensazione di aver perso il meglio. Con un’archeologa, due ore bastano per uscire con le idee chiare, e sono i soldi meglio spesi della vacanza.',
    image: '/img/mann-sala.webp',
    category: 'arte',
    experience: 'Il MANN con un’archeologa',
  },
  {
    slug: 'galleria-borbonica',
    article: 'napoli-sotterranea-tunnel-greci',
    title: 'La Galleria Borbonica, sotto Chiaia',
    text: 'Ferdinando II la fece scavare nel 1853 per collegare il Palazzo Reale alle caserme, in caso di rivolta. Non fu mai finita e nel Novecento diventò rifugio antiaereo, poi deposito giudiziario: oggi ci sono ancora le auto e le moto d’epoca sequestrate, coperte di polvere, accanto alle scritte lasciate dai napoletani durante i bombardamenti. Un’ora sotto terra che racconta la città più di molti musei. Si entra solo con visita guidata.',
    image: '/img/galleria-borbonica.webp',
    category: 'arte',
    experience: 'Galleria Borbonica',
  },
  {
    slug: 'catacombe-san-gennaro',
    article: 'quartieri-napoli-da-scoprire',
    title: 'Le Catacombe di San Gennaro e il Rione Sanità',
    text: 'Sotto la collina di Capodimonte, due livelli di gallerie scavate nel tufo dal II secolo, con affreschi paleocristiani e la prima tomba del patrono. Le gestisce una cooperativa di ragazzi del quartiere che ha cambiato la storia della Sanità, il rione sotto il ponte che per decenni i napoletani stessi evitavano. Vale la pena abbinare la visita a una passeggiata nel rione: palazzi barocchi, Totò, il Cimitero delle Fontanelle, e una delle pizze fritte migliori della città.',
    image: '/img/catacombe-san-gennaro.webp',
    category: 'arte',
    experience: 'Sotto la Sanità',
  },
  {
    slug: 'fontanelle',
    title: 'Il Cimitero delle Fontanelle',
    text: 'Una cava di tufo alla fine del Rione Sanità con decine di migliaia di crani e ossa, ammassati dopo le pestilenze e il colera dell’Ottocento. Per un secolo i napoletani hanno «adottato» un teschio, le anime pezzentelle, pulendolo e chiedendo grazie in cambio: la Chiesa proibì il culto nel 1969, ma i biglietti del lotto lasciati accanto ai crani si vedono ancora. Non è un posto macabro: è silenzioso, fresco, e spiega Napoli e il suo rapporto con la morte meglio di qualunque libro.',
    image: '/img/fontanelle.webp',
    category: 'arte',
    experience: 'Cimitero delle Fontanelle',
  },
  {
    slug: 'san-martino',
    article: 'cosa-fare-a-napoli-la-sera',
    title: 'Certosa di San Martino e Castel Sant’Elmo',
    text: 'Il punto più alto del Vomero, dove la città si vede tutta: il centro antico con Spaccanapoli, il porto, il Vesuvio, Capri nelle giornate limpide. La Certosa ha il chiostro grande con i teschi di marmo sulla balaustra, la chiesa barocca e la collezione di presepi con il Cuciniello, il più famoso. Il castello accanto è una stella di sei punte con la terrazza aperta. Si sale in funicolare da Montesanto o a piedi per la Pedamentina, 414 gradini.',
    image: '/img/san-martino.webp',
    category: 'arte',
    experience: 'Certosa di San Martino',
  },
  {
    slug: 'ercolano',
    article: 'napoli-in-3-giorni',
    title: 'Ercolano, con un archeologo',
    text: 'Pompei è più famosa, ma Ercolano è più intera: il fango vulcanico ha conservato i piani superiori delle case, i mobili carbonizzati, le travi di legno, le porte. Gli scavi sono piccoli, si girano in due ore, e si vedono con il paese moderno che ci sta letteralmente sopra. Dalla Circumvesuviana sono venti minuti da Napoli. Andarci con un archeologo cambia tutto: le stanze diventano case di persone con un nome, e i 300 scheletri dei fornici sulla spiaggia una storia.',
    image: '/img/ercolano.webp',
    category: 'arte',
    experience: 'Ercolano con un archeologo',
  },
  {
    slug: 'palazzo-reale',
    title: 'Palazzo Reale e Piazza del Plebiscito',
    text: 'La piazza più grande della città, con il colonnato di San Francesco di Paola davanti e la facciata del palazzo con le statue dei re di Napoli nelle nicchie. Dentro, lo scalone d’onore, il teatrino di corte, gli appartamenti storici con gli arredi dei Borbone e dei Savoia, e il giardino pensile con vista sul porto. A due passi il Teatro San Carlo e il caffè Gambrinus. La piazza si attraversa gratis a qualunque ora; il palazzo chiude il mercoledì.',
    image: '/img/palazzo-reale.webp',
    category: 'arte',
    experience: 'Palazzo Reale e il borgo di Santa Lucia',
    free: true,
  },
  {
    slug: 'capodimonte',
    title: 'Capodimonte: Caravaggio e Raffaello nel bosco',
    text: 'La reggia sulla collina ospita la collezione Farnese, quella che i Borbone portarono da Parma: Tiziano, Raffaello, Masaccio, i Bruegel, e la Flagellazione di Caravaggio, dipinta a Napoli nel 1607. Intorno c’è il Real Bosco, un parco di 134 ettari dove i napoletani vanno a correre e a fare i picnic. Il museo è grande e lontano dal centro: uno storico dell’arte per due ore ti porta dritto ai quadri che contano, poi il parco te lo godi da solo.',
    image: '/img/capodimonte.webp',
    category: 'arte',
    experience: 'Capodimonte con uno storico',
  },
  {
    slug: 'street-food',
    article: 'street-food-napoli-guida-completa',
    title: 'Street food nel centro storico',
    text: 'Pizza a portafoglio, frittatina di pasta, cuoppo di fritto, pizza fritta, sfogliatella, babà, caffè al banco: la cucina napoletana si mangia in piedi, camminando tra via Tribunali e la Pignasecca, e costa pochi euro a tappa. Il problema è sapere dove. I tour con una guida del posto risolvono in due ore e mezza: sei o sette assaggi nelle botteghe giuste, senza fila e senza trappole per turisti. Vai a stomaco vuoto, e non prenotare la cena.',
    image: '/img/naples-streetfood.webp',
    category: 'food',
    experience: 'Street food nel centro storico',
  },
  {
    slug: 'pignasecca',
    title: 'La Pignasecca, il mercato più antico',
    text: 'Dietro via Toledo, il mercato di strada più vecchio della città: pesce sul ghiaccio, banchi di frutta, friggitorie, salumerie con la mozzarella del giorno, venditori che urlano i prezzi in dialetto. La mattina è il momento giusto, prima delle 13. Si può girare da soli, gratis, comprando un tarallo e un bicchiere di limonata a cosce aperte; oppure in sei soste con chi conosce i banchi per nome, che è il modo per assaggiare davvero tutto.',
    image: '/img/pignasecca.webp',
    category: 'food',
    experience: 'Pignasecca in sei soste',
    free: true,
  },
  {
    slug: 'sfogliatella',
    title: 'Sfogliatella e caffè, come si deve',
    text: 'La riccia, con la sfoglia croccante a strati, o la frolla, morbida: il ripieno di ricotta, semolino e canditi è lo stesso. Va mangiata calda, e Napoli è piena di posti che la sfornano a ogni ora, dalla stazione centrale a Mergellina. Il caffè si prende al banco, in tazza bollente, spesso già zuccherato: chiedilo amaro se non lo vuoi dolce. Costa poco più di un euro e in molti bar c’è ancora il «caffè sospeso», uno pagato per chi non può permetterselo.',
    image: '/img/sfogliatella.webp',
    category: 'food',
    experience: 'Sei tappe nel mercato più antico',
    free: true,
  },
  {
    slug: 'vino-vesuvio',
    title: 'Un pranzo tra le vigne del Vesuvio',
    text: 'Sulle pendici del vulcano si fa il Lacryma Christi, bianco e rosso, da vitigni che crescono nella lava. Le cantine si visitano: filari con il cratere alle spalle, la cantina, poi la tavola con quello che produce l’azienda, dal pomodorino del piennolo all’olio. Sono quattro ore che valgono come un pranzo e un’escursione insieme, e si tornano in città sazi e con un paio di bottiglie. Da abbinare, se hai tempo, alla salita al cratere la mattina.',
    image: '/img/naples-wine.webp',
    category: 'food',
    experience: 'Lacryma Christi tra i filari',
  },
  {
    slug: 'piazza-bellini',
    article: 'aperitivo-napoli-dove-andare',
    title: 'Aperitivo a Piazza Bellini',
    text: 'Una piazza alberata sopra le mura greche del IV secolo a.C., che si vedono a cielo aperto in mezzo ai tavolini. Studenti, librerie, un paio di bar storici, musica dal vivo la sera: è il posto dove i napoletani vanno a bere una cosa prima di cena, a due minuti da via Tribunali e dal MANN. Lo spritz costa quello che costa in tutta Italia; le polpette e la pizza fritta nei vicoli intorno sono la parte migliore. Dalle 19 in poi, tutti i giorni.',
    image: '/img/piazza-bellini.webp',
    category: 'food',
    experience: 'Polpette, spritz e mura greche',
    free: true,
  },
  {
    slug: 'corso-pizza',
    article: 'cosa-fare-a-napoli-con-i-bambini',
    title: 'Imparare a fare la pizza',
    text: 'Impasto con farina, acqua, sale e pochissimo lievito, lunga lievitazione, stesura a mano senza mattarello, forno a 450 gradi per sessanta secondi: la pizza napoletana è patrimonio Unesco e si impara in tre ore, in un laboratorio o direttamente in pizzeria. Si torna a casa con la tecnica per stendere e con il tiramisù fatto nel frattempo. È l’esperienza più prenotata a Napoli, e la più adatta a bambini e gruppi. Si mangia quello che si fa, ovviamente.',
    image: '/img/naples-pizza.webp',
    category: 'laboratori',
    experience: 'Pizza napoletana da zero',
  },
  {
    slug: 'pasta-fresca',
    title: 'Pasta fresca a mano, con una signora del posto',
    text: 'Ravioli, fettuccine, gnocchi, scialatielli: a Napoli la pasta fresca si fa ancora in casa la domenica, e i laboratori replicano quella cucina. Farina e uova sul tavolo, il mattarello, due sughi, un calice di vino, e alla fine si mangia tutti insieme. Le versioni da venti euro sono tra le cose più economiche e riuscite della città; quelle a casa di un napoletano, con vista sul golfo, sono un pranzo in famiglia più che un corso.',
    image: '/img/ravioli.webp',
    category: 'laboratori',
    experience: 'Pasta fresca e tiramisù con calice',
  },
  {
    slug: 'golfo-in-barca',
    article: 'napoli-in-3-giorni',
    title: 'Il golfo dal mare: Castel dell’Ovo e Posillipo',
    text: 'Napoli va vista almeno una volta dall’acqua. Si parte dal Borgo Marinari, il porticciolo ai piedi di Castel dell’Ovo, e si costeggia Posillipo: le ville sul mare, Palazzo Donn’Anna con le fondamenta nell’acqua, le grotte, la Gaiola. Dietro, il Vesuvio e la città intera. Le barche piccole, da nove posti, sono meglio delle motonavi: un’ora e mezza con sosta per un bagno, o tre ore al tramonto con lo spritz a bordo. Da maggio a ottobre.',
    image: '/img/golfo-napoli.webp',
    category: 'outdoor',
    experience: 'Castel dell’Ovo e Palazzo Donn’Anna',
  },
  {
    slug: 'gaiola-marechiaro',
    title: 'Marechiaro e la Gaiola',
    text: 'In fondo a Posillipo, il borgo di Marechiaro con la «fenestella» della canzone e i ristoranti sul mare, e poco più in là la Gaiola, l’isolotto con la villa maledetta e il parco sommerso: rovine romane sott’acqua a pochi metri dalla riva, si vedono con la maschera. La spiaggia della Gaiola è piccola, gratuita e a numero chiuso, con prenotazione online. In barca privata si arriva dal molo di Mergellina in mezz’ora, con il bagno nella cala.',
    image: '/img/marechiaro.webp',
    category: 'outdoor',
    experience: 'Barca privata fino alla Gaiola',
    free: true,
  },
  {
    slug: 'vesuvio',
    article: 'trekking-vesuvio-guida',
    title: 'Il Vesuvio, fino al cratere',
    text: 'Il vulcano è a mezz’ora dalla città e il sentiero fino all’orlo del cratere, dal parcheggio a quota mille, si fa in venti minuti di salita su ghiaia. In cima si vede il cratere che fuma e tutto il golfo, da Sorrento a Ischia. Il biglietto del parco si prenota online con orario. Chi vuole qualcosa di diverso sale a cavallo sui sentieri di lava del versante di Pompei, un’ora nel Parco Nazionale con le guide del posto, adatta anche a chi non è mai montato.',
    image: '/img/vesuvio-trek.webp',
    category: 'outdoor',
    experience: 'Un’ora a cavallo',
  },
  {
    slug: 'petraio-vomero',
    title: 'Le scale del Petraio e il Vomero',
    text: 'Napoli è una città verticale e le sue scale sono un monumento: il Petraio scende dal Vomero a Chiaia tra ville liberty, orti e scorci sul golfo che dalla strada non si vedono. La Pedamentina, la Calata San Francesco, il Moiariello dietro Capodimonte sono le altre. Si salgono gratis, con scarpe comode, meglio la mattina. Con una guida in due ore si fanno le scale giuste, la funicolare e i Quartieri Spagnoli, e si capisce come è fatta la città.',
    image: '/img/vomero-panorama.webp',
    category: 'outdoor',
    experience: 'Il Petraio e le scale nascoste',
    free: true,
  },
  {
    slug: 'quartieri-spagnoli',
    article: 'quartieri-napoli-da-scoprire',
    title: 'I Quartieri Spagnoli',
    text: 'La scacchiera di vicoli che sale da via Toledo, costruita nel Cinquecento per le truppe spagnole: panni stesi, motorini, botteghe, il murale gigante di Maradona in via Emanuele De Deo davanti al quale c’è sempre gente. Trent’anni fa erano off limits; oggi sono il quartiere dove si mangia meglio a poco, con le trattorie da dieci coperti e i mercatini. Si girano da soli, di giorno, oppure con qualcuno del quartiere che ti fa entrare nei cortili e nei laboratori.',
    image: '/img/calcio-quartieri.webp',
    category: 'outdoor',
    experience: 'Quartieri Spagnoli: murales',
    free: true,
  },
  {
    slug: 'snorkeling',
    title: 'Snorkeling sulle ville romane sommerse',
    text: 'Il bradisismo ha fatto sprofondare la Baia romana, il luogo di villeggiatura degli imperatori: mosaici, strade, statue e ninfei stanno a pochi metri sotto il mare dei Campi Flegrei e si vedono con maschera e pinne. A Posillipo, davanti alla Gaiola, il parco sommerso è più piccolo ma più vicino. Le uscite durano due o tre ore con un biologo marino, e a settembre l’acqua è ancora a 24 gradi. È il modo più strano e più bello di fare archeologia.',
    image: '/img/baia-sommersa.webp',
    category: 'sport',
    experience: 'Snorkeling sulle ville romane',
  },
  {
    slug: 'napoli-in-bici',
    title: 'Napoli in bici, dal Duomo al lungomare',
    text: 'Sembra un’idea folle e invece il centro si pedala bene: via Duomo, il Rettifilo, piazza Municipio, il Plebiscito, poi il lungomare Caracciolo che è pedonale e piatto fino a Mergellina. Tre ore con una guida, soste comprese, per vedere la città bassa tutta in una mattina, senza il traffico dei taxi. Per le colline ci sono le fat e-bike, che salgono al Vomero e a Posillipo senza fatica. Casco e bici sono compresi.',
    image: '/img/ebike-napoli.webp',
    category: 'sport',
    experience: 'In bici dal Duomo',
  },
  {
    slug: 'canzone-napoletana',
    article: 'cosa-fare-a-napoli-la-sera',
    title: 'La canzone napoletana dal vivo, senza microfoni',
    text: '’O sole mio, Reginella, Era de maggio: la canzone napoletana è nata per le voci nude e i mandolini, e ci sono ancora concerti così, in sale da cinquanta posti nel centro, un’ora dopo cena. Niente amplificazione, i cantanti a un metro, le storie dietro ogni pezzo raccontate tra una canzone e l’altra. È il modo migliore per capire perché questa musica ha fatto il giro del mondo, e costa quanto una pizza. Tutte le sere, prenotando prima.',
    image: '/img/mandolino-napoli.webp',
    category: 'spettacoli',
    experience: 'Un’ora di canzone napoletana',
  },
]
