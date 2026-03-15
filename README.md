# Labor-Tech Website (Static)

Premium, minimalist website for Labor-Tech Anna Jarosz (HTML/CSS/JS).

## Requirements (macOS)
- `python3`
- `rsync` (preinstalled on macOS)

## Run locally (dev)
From project root:

```bash
python3 -m http.server 8000
```

Open: [http://localhost:8000](http://localhost:8000)

## Production build (static dist)
From project root:

```bash
./scripts/build.sh
```

Build output: `dist/`

## Preview build locally

```bash
cd dist
python3 -m http.server 8080
```

Open: [http://localhost:8080](http://localhost:8080)

## Notes
- The site is fully static, so no Node tooling is required.
- `404.html` uses root-absolute asset paths (`/assets/...`) to avoid broken CSS/JS on nested error URLs.
- `_headers` contains cache policy rules for hosts that support custom response headers (for example Cloudflare Pages or Netlify).
- On the current live deployment I verified that assets are still being served with `cache-control: max-age=600`, so the Lighthouse cache audit will only fully improve after moving to a host/CDN that honors custom cache headers.
