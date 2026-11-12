# Illustration guide

Every painted background on the site comes from the OpenAI image API (`gpt-image-2`, edit endpoint). Each call sends one **style block**, one **scene line**, and the matching band of Kim An's mock as the reference image. Change the style block only with Kim An's sign-off. When it changes, regenerate every asset, so the set stays one style.

## Style block (verbatim)

> Painterly digital landscape for the background of a calm Vietnamese astrology website. Soft gouache and airbrush texture, gentle film grain, layered mountain ridges fading in atmospheric perspective, fine gold star specks and thin gold constellation lines used sparingly. East Asian mood, cinematic but quiet. Palette: night #0e1222, deep blue #1b2a4a, dusk violet #6b3a4d, ember orange #d9623b, dawn gold #f2c879, cream #f7f2e7, gold #f2b441. Match the painting style, light and colours of the reference image, but paint only the landscape: no text, no letters, no numbers, no buttons, no user interface, no logos, no people, no borders, no frames.

## Scene lines

| #   | Asset                     | Scene line                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Night, chapter 1          | A clear starry night sky. A large, softly glowing full moon sits in the upper right third. Faint gold constellation lines arc behind it. Dark blue mountain ridges fill the bottom fifth. Keep the left 60 percent of the sky dark, smooth and low in detail, so white headline text stays readable there. |
| A1b | Star lake, chapter 2      | No moon. A perfectly still mountain lake at night mirrors the whole starry sky, so the stars continue below a thin, low, dark horizon line of distant hills. Deep blue and violet tones, a few gold stars. The centre stays calm for a large white date.                                                   |
| A2  | Dusk, chapter 3           | Violet dusk sky with low warm clouds. A twisted pine on a rocky outcrop on the far left edge. Distant ridges in muted violet. The centre and right stay calm and low in detail.                                                                                                                            |
| A3  | Sunset, chapter 4         | An orange and rose sunset. The sun sits on a ridge on the right, with rays through haze. The upper middle is calm warm sky for a centred headline. The bottom half fades into warm golden haze.                                                                                                            |
| A4  | Dawn haze, chapter 6      | Cream morning haze over faint golden hills. A small pagoda on a hill at the bottom left. Everything else stays very light and low in contrast.                                                                                                                                                             |
| A5  | Sunrise meadow, chapter 7 | A golden sunrise over soft hills. Tall grass and small wildflowers in the foreground at the bottom. The middle stays bright, calm and low in detail behind a form.                                                                                                                                         |
| A6  | Featured thumbnail        | A square gold star chart: concentric gold rings, a radiant star at the centre and constellation lines, on deep navy.                                                                                                                                                                                       |

## Output and delivery

- Generate at 1536×1024 for desktop and 1024×1536 for mobile. A6 is 1024×1024.
- Export as WebP at 768 and 1536 px wide (`magick -resize <w>x -quality 70`). Budget: 120 KB at desktop size and 60 KB at mobile size.
- Shipped so far: A1 (variant 1) is 45 KB / 13 KB, A1b is 92 KB / 21 KB, A2 (variant 2) is 69 KB / 21 KB, A3 (variant 2) is 52 KB / 15 KB, A4 (variant 1) is 53 KB / 17 KB, A5 (variant 2) is 93 KB / 29 KB, and A6 (variant 1) is 47 KB at 800 px / 13 KB at 400 px. Chapter 5 has no painting of its own: a cream, dawn, cream gradient joins chapter 4's haze to chapter 6.
- Paintings are decoration. Use them as CSS backgrounds, or as `<img alt="">`, and never put text inside them.
- The chapter keeps its flat tone colour underneath, so it reads the same before the painting arrives.
- Add one painting per PR. Measure five production Lighthouse runs on `/` before and after it ships.
