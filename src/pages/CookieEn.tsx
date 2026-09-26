/** Testo dell'informativa cookie in inglese (traduzione fedele di CookiePage). Lo importa solo CookiePage. */
export function CookieBodyEn() {
  return (
    <>
      <section>
        <h2>No profiling cookies</h2>
        <p>
          The site does not use profiling, advertising or third-party analytics cookies. That is why we don’t show you any
          banner: there is nothing to accept.
        </p>
      </section>
      <section>
        <h2>What we store on your device</h2>
        <ul>
          <li>Fonts and images are served directly from our own site, with no calls to external services.</li>
          <li>
            Visit statistics use a random session code stored in the browser while the tab is open (sessionStorage). It is not
            a cookie, it does not identify you and it disappears when you close the tab.
          </li>
          <li>
            Booking links to GetYourGuide and Viator take you to their sites, which apply their own cookie policies: nothing is
            set while you stay on Cose Fighe.
          </li>
          <li>
            The admin area, reserved for the team, stores a technical session key in the browser that is needed for logging in
            to work. It does not concern visitors.
          </li>
        </ul>
      </section>
      <section>
        <h2>How to manage them</h2>
        <p>
          You can delete the data stored by the site at any time through your browser settings. For any questions, write to{' '}
          <a href="mailto:ciao@cosefighe.it">ciao@cosefighe.it</a>.
        </p>
      </section>
    </>
  )
}
