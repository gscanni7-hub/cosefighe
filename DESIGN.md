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

- Firma: Anton, maiuscolo, solo per il titolo principale di ogni pagina, il marchio nel piè di pagina e i numeri di accento (prezzi, contatori, passi). Scala fluida `display-xl`: clamp(2.75rem, 5.5vw, 5.25rem).
- Tutto il resto: Rubik variabile (300-900), self-hosted. Titoli di sezione `heading-lg` (800, tracking -0.02em, clamp 1.75-2.5rem), titoli minori `heading-md` (700), testo 400/500 a 15-17px, max 65ch.
- Etichette: `label` (600, 12px, maiuscolo, tracking 0.08em). Una per pagina, non una per sezione.
- Le foto usano la classe `img-warm` (leggera desaturazione, contrasto, viraggio caldo) per avere un tono comune anche se provengono da fotografi diversi.

## Componenti (src/components/ui)

- `Button` / `ButtonLink`: pill in minuscolo. Solo `primary` (arancio) ha bordo nero 2px e ombra dura: è la firma cartoon. `secondary` bianco con bordo, `dark`, `ghost-light` su fondo scuro, `link` testuale con freccia.
- `Sticker`: piccola pillola per tag e categorie (toni cream, orange, ink, white, outline). Niente rotazioni né ombre.
- `PageHero`: apertura di pagina su fondo carta o bianco: etichetta, titolo in Anton, sottotitolo, eventuale illustrazione a destra.
- `ExperienceCard`: card bianca, bordo sottile, foto 4:3 (o a sinistra con `layout="row"`), tag, titolo, riga meta, prezzo in Anton arancio, valutazione, nota "Prossimamente".
- `DragScroll`: striscia orizzontale trascinabile (categorie in home). `MouseParallax`: la mascotte del primo schermo segue leggermente il mouse.
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
