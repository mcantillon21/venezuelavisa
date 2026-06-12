# Fonts

This portal is designed for **NB International Pro** (the grotesk used by
superpower.com). It is a **licensed commercial font**, so the `.woff2` files
are intentionally **not committed** to this public repository.

The app still builds and runs without them: `globals.css` loads the family via
`@font-face` and falls back to **Helvetica Neue / Arial** when the files are
absent.

## To use NB International Pro
Purchase a license, then drop these files here:

```
public/fonts/nbint-regular.woff2   (weight 400)
public/fonts/nbint-bold.woff2      (weight 700)
public/fonts/nbint-mono.woff2      (the mono cut)
```

## To use a free alternative
Swap the `@font-face` `src` URLs in `src/app/globals.css` for any open-licensed
grotesk (e.g. Geist, Hanken Grotesk, or Helvetica Neue is fine as-is).
