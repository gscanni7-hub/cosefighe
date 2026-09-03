# Design system, Cose Fighe

## Colori (Tailwind v4, src/index.css)

| Token | Valore | Uso |
|---|---|---|
| `brand-orange` | #FF5500 | azione primaria, hero, fasce |
| `brand-blue` | #0055FF | sezioni di contrasto, categoria Outdoor/Laboratori |
| `brand-ink` | #111111 | testo, contorni, ombre dure, sezioni scure |
| `brand-paper` | #FFF7F1 | fondo caldo del primo schermo e dei riquadri chiari |
| `brand-cream` | #FFF1E8 | fondo delle illustrazioni |
| `white` | #FFFFFF | fondo pagina |

Strategia: "full palette". Arancio e blu portano ciascuno intere sezioni; il nero fa da cornice. Testo secondario sempre come trasparenza dell'inchiostro (`text-ink/60`), mai grigio puro. Su fondo colorato, testo secondario come trasparenza del bianco (`text-white/75`).

## Tipografia

- Display: Anton, maiuscolo, `leading-[0.9]`, tracking stretto. Scala fluida con `clamp()`:
  - `display-xl`: clamp(3.5rem, 10vw, 8.5rem) (primo schermo)
  - `display-lg`: clamp(2.75rem, 6vw, 5rem) (titoli di sezione)
  - `display-md`: clamp(1.75rem, 3vw, 2.5rem) (titoli card)
- Testo: Inter 400/500/600/700, 16px base, max 65ch.
- Etichette: Inter 700, 11-12px, maiuscolo, tracking 0.14em. Una sola etichetta "kicker" per sezione, non su ogni blocco.

## Componenti (src/components/ui)

- `Button` / `ButtonLink`: pill con bordo 2px nero, ombra dura 4px, hover alza di 2px e allunga l'ombra, active azzera l'ombra e trasla. Varianti: `primary` (arancio), `dark`, `white`, `ghost-light` (contorno bianco su fondo scuro).
- `Sticker`: etichetta con bordo nero, ombra 3px e rotazione -2/+2 gradi. Per badge "Prossimamente", prezzi, kicker del primo schermo.
- `PageHero`: apertura di pagina con colore pieno, kicker, titolo con una parola in outline, sottotitolo.
- `ExperienceCard`: foto 4:3 con bordo inferiore nero, corpo colorato (`orange`/`blue`/`white`), badge tag e prezzo, riga meta, rating, etichetta "Prossimamente".
- `Marquee`: fascia scorrevole; `light` per fondo scuro.
- `WaitlistForm`: campo email + pulsante, salva in `leads` con source `waitlist`.

## Spaziatura e layout

- Contenitore: `max-w-7xl px-5 sm:px-8 lg:px-10`.
- Sezioni: `py-20 md:py-28`; il primo schermo `min-h-[88svh]`.
- Griglie: `gap-5 md:gap-6`. Card con `rounded-[2rem]`, bordi `border-4`.
- Asimmetria voluta: titolo a sinistra e mascotte a destra nel primo schermo; nel resto, blocchi allineati a sinistra con testo di supporto a destra.

## Movimento

- Ingressi: opacità + 16px verso l'alto, 450ms, ease-out. Una volta sola (`viewport once`).
- Hover: card -6px; pulsanti -2px. Mai bounce.
- Fasce e mascotte fluttuanti: loop lenti; disattivati con `prefers-reduced-motion` (MotionConfig `reducedMotion="user"` + CSS).
- Transizioni di pagina: View Transitions API con dissolvenza 200ms (`Link viewTransition`).

## Accessibilità

- Contrasto minimo AA: sul blu #0055FF e sull'arancio #FF5500 si usa testo bianco in grassetto o nero.
- Focus visibile: anello arancio 3px con offset 2px, su ogni elemento interattivo.
- Target touch minimo 44px.
- Skip link "Vai al contenuto" come primo elemento della pagina.
