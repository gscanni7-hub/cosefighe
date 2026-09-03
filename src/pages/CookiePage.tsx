import { LegalPage } from './LegalPage'

export default function CookiePage() {
  return (
    <LegalPage
      title="Cookie"
      kicker="Informativa"
      updated="3 settembre 2026"
      description="Quali cookie e tecnologie simili usa il sito Cose Fighe."
    >
      <section>
        <h2>Nessun cookie di profilazione</h2>
        <p>
          Il sito non usa cookie di profilazione, pubblicitari o di analisi di terze parti. Per questo non ti mostriamo
          nessun banner: non c'è nulla da accettare.
        </p>
      </section>
      <section>
        <h2>Cosa salviamo sul tuo dispositivo</h2>
        <ul>
          <li>Font e immagini sono serviti direttamente dal nostro sito, senza chiamate a servizi esterni.</li>
          <li>
            L'area di amministrazione, riservata al team, salva nel browser una chiave di sessione tecnica necessaria al
            funzionamento dell'accesso. Non riguarda i visitatori.
          </li>
        </ul>
      </section>
      <section>
        <h2>Come gestirli</h2>
        <p>
          Puoi cancellare in ogni momento i dati salvati dal sito tramite le impostazioni del tuo browser. Per domande
          scrivi a <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>.
        </p>
      </section>
    </LegalPage>
  )
}
