import { LegalPage } from './LegalPage'

export default function PrivacyPage() {
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
          <li>Modulo contatti: nome, email, argomento e testo del messaggio.</li>
          <li>Candidatura creator: nome, cognome, email, profilo social, specialità e presentazione.</li>
          <li>Lista d'attesa: indirizzo email.</li>
        </ul>
        <p>
          Raccogliamo inoltre, in forma anonima e senza cookie, dati statistici sull'uso del sito: pagine visitate, click sui
          pulsanti, quanto si scorre una pagina, tipo di dispositivo, sito di provenienza. Non contengono nome, email, indirizzo
          IP completo o identificativi persistenti: un codice casuale di sessione vive solo finché la scheda del browser è
          aperta. Servono a capire cosa interessa ai visitatori e non permettono di riconoscere una persona.
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
    </LegalPage>
  )
}
