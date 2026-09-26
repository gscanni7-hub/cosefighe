import credits from '../data/credits.json'
import { LegalPage } from './LegalPage'
import { PrivacyBodyEn } from './PrivacyEn'
import { useLang } from '../i18n/lang'

/** Autori e licenze delle fotografie (uguale nelle due lingue, cambia solo «autore non indicato»). */
function Credits({ unknown }: { unknown: string }) {
  return (
    <p className="text-sm leading-relaxed text-ink/60">
      {Object.entries(credits as Record<string, { title: string; page: string; artist: string; license: string }>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, c], i, arr) => (
          <span key={key}>
            <a href={c.page} target="_blank" rel="noopener noreferrer">
              {c.title.replace(/^File:/, '')}
            </a>{' '}
            ({c.artist || unknown}, {c.license}){i < arr.length - 1 ? ' · ' : ''}
          </span>
        ))}
    </p>
  )
}

export default function PrivacyPage() {
  const lang = useLang()
  if (lang === 'en')
    return (
      <LegalPage
        title="Privacy"
        kicker="Notice"
        updated="13 September 2026"
        description="How Cose Fighe collects and uses the personal data you send through the forms on this website."
      >
        <PrivacyBodyEn credits={<Credits unknown="author not credited" />} />
      </LegalPage>
    )
  return (
    <LegalPage
      title="Privacy"
      kicker="Informativa"
      updated="13 settembre 2026"
      description="Come Cose Fighe raccoglie e usa i dati personali inviati tramite i moduli del sito."
    >
      <section>
        <h2>Titolare del trattamento</h2>
        <p>
          Il titolare del trattamento è Cose Fighe, Napoli. Per qualsiasi richiesta puoi scrivere a{' '}
          <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>.
        </p>
      </section>
      <section>
        <h2>Quali dati raccogliamo</h2>
        <p>Raccogliamo solo i dati che ci invii volontariamente tramite i moduli del sito:</p>
        <ul>
          <li>Modulo contatti: nome, email, argomento e testo del messaggio. Per avvisarci dell’arrivo del messaggio, gli stessi dati vengono inoltrati via email attraverso il servizio FormSubmit.</li>
          <li>Candidatura creator: nome, cognome, email, profilo social, specialità e presentazione.</li>
          <li>Lista d'attesa: indirizzo email.</li>
        </ul>
        <p>
          Raccogliamo inoltre, in forma anonima e senza cookie, dati statistici sull'uso del sito: pagine visitate, click sui
          pulsanti, quanto si scorre una pagina, tipo di dispositivo, sito di provenienza. Non contengono nome, email, indirizzo
          IP completo o identificativi persistenti: un codice casuale di sessione vive solo finché la scheda del browser è
          aperta. Servono a capire cosa interessa ai visitatori e non permettono di riconoscere una persona.
        </p>
        <p>
          La mappa del sito usa le carte di OpenStreetMap servite da OpenFreeMap: quando la apri, il tuo browser scarica le
          tessere della mappa da quel servizio, che vede il tuo indirizzo IP come qualunque sito visitato, senza cookie né
          profilazione. Il pulsante «Vicino a me» chiede la posizione al telefono solo se lo tocchi: la posizione resta nel
          browser, serve a ordinare i risultati per distanza e non viene inviata né salvata da noi.
        </p>
      </section>
      <section>
        <h2>Link di affiliazione</h2>
        <p>
          Alcune esperienze rimandano a piattaforme di prenotazione partner (GetYourGuide e Viator) con un link di affiliazione.
          Se prenoti da lì, riceviamo una commissione dalla piattaforma; il prezzo per te non cambia. La prenotazione, il
          pagamento e i dati che inserisci sono gestiti dalla piattaforma secondo la sua informativa: noi non li riceviamo.
        </p>
      </section>
      <section>
        <h2>Perché li usiamo</h2>
        <ul>
          <li>Per rispondere alle tue richieste e valutare la tua candidatura (esecuzione di misure precontrattuali).</li>
          <li>Per avvisarti dell'apertura delle prenotazioni, se ti sei iscritto alla lista d'attesa (consenso, revocabile in ogni momento).</li>
        </ul>
      </section>
      <section>
        <h2>Dove li conserviamo e per quanto</h2>
        <p>
          I dati dei moduli e le statistiche anonime sono conservati su infrastruttura Supabase, con server nell'Unione
          Europea; il sito è pubblicato tramite Vercel, che può registrare dati tecnici di traffico in forma aggregata. Li conserviamo per il tempo necessario a gestire la richiesta e comunque non oltre 24 mesi dall'ultimo
          contatto, salvo obblighi di legge.
        </p>
      </section>
      <section>
        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere in ogni momento l'accesso, la rettifica, la cancellazione o la limitazione dei tuoi dati, opporti
          al trattamento e revocare il consenso, scrivendo a <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>. Hai
          inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.
        </p>
      </section>
      <section>
        <h2>Fotografie</h2>
        <p>
          Le fotografie delle esperienze e degli articoli provengono da Wikimedia Commons e sono usate secondo le rispettive licenze
          libere; le illustrazioni della mascotte sono di Cose Fighe. Autori e licenze:
        </p>
        <Credits unknown="autore non indicato" />
      </section>
    </LegalPage>
  )
}
