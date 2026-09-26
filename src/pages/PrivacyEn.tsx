import type { ReactNode } from 'react'

/** Testo dell'informativa privacy in inglese (traduzione fedele di PrivacyPage). Lo importa solo PrivacyPage. */
export function PrivacyBodyEn({ credits }: { credits: ReactNode }) {
  return (
    <>
      <section>
        <h2>Data controller</h2>
        <p>
          The data controller is Cose Fighe, Naples. For any request you can write to{' '}
          <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>.
        </p>
      </section>
      <section>
        <h2>What data we collect</h2>
        <p>We only collect the data you choose to send us through the site’s forms:</p>
        <ul>
          <li>Contact form: name, email, topic and the text of your message. To let us know that a message has arrived, the same data is forwarded by email through the FormSubmit service.</li>
          <li>Creator application: first name, surname, email, social media profile, speciality and introduction.</li>
          <li>Waiting list: email address.</li>
        </ul>
        <p>
          We also collect, anonymously and without cookies, statistics on how the site is used: pages visited, button clicks,
          how far down a page you scroll, type of device, referring site. They contain no name, email, full IP address or
          persistent identifiers: a random session code exists only while the browser tab is open. They help us understand what
          interests visitors and do not make it possible to recognise a person.
        </p>
        <p>
          The site’s map uses OpenStreetMap maps served by OpenFreeMap: when you open it, your browser downloads the map tiles
          from that service, which sees your IP address as any website you visit does, with no cookies or profiling. The “Near
          me” button asks your phone for your location only if you tap it: the location stays in your browser, is used to sort
          results by distance, and is neither sent to us nor stored by us.
        </p>
      </section>
      <section>
        <h2>Affiliate links</h2>
        <p>
          Some experiences link to partner booking platforms (GetYourGuide and Viator) through an affiliate link. If you book
          there, we receive a commission from the platform; the price you pay does not change. The booking, the payment and the
          data you enter are handled by the platform under its own privacy policy: we do not receive them.
        </p>
      </section>
      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To reply to your requests and to assess your application (steps taken prior to entering into a contract).</li>
          <li>To let you know when bookings open, if you have joined the waiting list (consent, which you can withdraw at any time).</li>
        </ul>
      </section>
      <section>
        <h2>Where we keep it and for how long</h2>
        <p>
          Form data and anonymous statistics are stored on Supabase infrastructure, with servers in the European Union; the
          site is published through Vercel, which may record technical traffic data in aggregate form. We keep the data for as
          long as needed to handle your request and in any case for no longer than 24 months from the last contact, unless the
          law requires otherwise.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          You can ask at any time for access to your data, or for its rectification, erasure or restriction, object to its
          processing and withdraw your consent, by writing to <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>. You
          also have the right to lodge a complaint with the Garante per la protezione dei dati personali (the Italian data
          protection authority).
        </p>
      </section>
      <section>
        <h2>Photographs</h2>
        <p>
          The photographs of the experiences and articles come from Wikimedia Commons and are used under their respective free
          licences; the mascot illustrations are by Cose Fighe. Authors and licences:
        </p>
        {credits}
      </section>
    </>
  )
}
