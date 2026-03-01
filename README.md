# Labor‑Tech – strona www (SEO + design)

To jest statyczna strona (HTML/CSS + minimalny JS). Skrojona pod lokalne SEO na frazy typu:

- protetyka Lublin
- pracownia protetyczna Lublin
- laboratorium protetyczne Lublin
- korony Lublin / mosty protetyczne Lublin / protezy Lublin / naprawa protez Lublin

## Jak uruchomić lokalnie

W folderze projektu:

```bash
python3 -m http.server 8000
```

Potem otwórz `http://localhost:8000`.

## Najważniejsze do uzupełnienia (must‑have)

1) Podmień `https://example.com` na prawdziwą domenę w:
- `index.html` (canonical + og:url)
- `o-pracowni/index.html`
- `uslugi/*.html`
- `kontakt/index.html`
- `sitemap.xml`
- `robots.txt`

2) Dodaj logo do `assets/img/` i podmień w headerze (jeśli chcesz).

3) (Opcjonalnie, ale mocno warto) Uzupełnij dane w schema.org:
- godziny otwarcia (`openingHoursSpecification`)
- link do wizytówki Google (sameAs)
- link do mapy (hasMap)
- zdjęcia (image)
