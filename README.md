# Nickolas Adrian Papamichail — portfolio

A static personal site: plain HTML, CSS and JavaScript. No build step, no server, no API keys. It runs on GitHub Pages as-is.

```
index.html               the page
404.html                 shown for unknown addresses
assets/css/main.css      all styles
assets/js/
  content.js             projects, skills, proficiency bars, Q&A answers, booking link  ← edit content here
  ui.js                  work cards, skill filter, toolkit, contact helpers
  faq.js                 "Ask about my work": pick a question, see the pre-written answer
  lab.js                 live graphene tight-binding demo
  hero3d.js              three.js layered landscape in the hero panel
  motion.js              smooth scrolling, light/dark transitions, nav behaviour
cv/                      the two CV PDFs
.nojekyll                tells GitHub Pages to serve the files exactly as they are
```

## Publish on GitHub Pages

1. **Create a repository** on GitHub. On the free plan it must be **public** (there are no secrets in this project).
   - Name it `IanPapamichail.github.io` to get the address `https://ianpapamichail.github.io/`.
   - Any other name works too; the address becomes `https://ianpapamichail.github.io/<repository-name>/`.
2. **Add the files** so that `index.html` sits at the top level of the repository (not inside a folder).
   - In the browser: open the empty repository → "uploading an existing file" → drag in everything from this folder → Commit changes. Your file picker may hide `.nojekyll`; that's fine, the site works without it.
   - Or with git:
     ```bash
     git init
     git add .
     git commit -m "Portfolio"
     git branch -M main
     git remote add origin https://github.com/IanPapamichail/<repository-name>.git
     git push -u origin main
     ```
3. **Turn on Pages:** repository → Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder: **/ (root)** → Save.
4. After a minute or two the address appears at the top of the Pages settings. Open it and check the site on a phone too.

Every later commit to `main` republishes the site automatically.

**Custom domain (optional):** Settings → Pages → Custom domain, then add the DNS records GitHub shows you at your domain registrar, and tick **Enforce HTTPS** once it's available.

## Try it on your computer

Any static file server works, for example:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` directly from the disk also works, but a local server is closer to how GitHub Pages serves it.

## Editing

- Projects, skills, proficiency bars, the Q&A questions and answers, booking link: `assets/js/content.js`
- Page text: `index.html`
- CVs: replace the PDFs in `cv/` (keep the file names, or update the two links in `index.html`). The CVs should match the site: GPA 8.57.

## Notes

- **Security:** there is nothing secret to protect: no keys, no forms that send data, no server. A Content Security Policy in `index.html` only allows scripts from this site and jsDelivr, and styles and fonts from Google Fonts.
- **Libraries** load from jsDelivr at pinned versions: GSAP 3.12.5, Lenis 1.1.13, three.js 0.169.0.
- **Fonts** come from Google Fonts (Sora for titles, Inter for text). To self-host them instead, put the files in `assets/fonts/`, replace the Google Fonts `<link>` in `index.html`, and remove the two Google domains from the Content Security Policy.
- **Motion** respects the visitor's "reduce motion" setting: no smooth scrolling, no entrance animation, a single still 3D frame.
- **404 page:** its "Back to the portfolio" link is relative, which works for addresses one level deep. If you use a project address (`/<repository-name>/`) and want it exact, change `href="./"` in `404.html` to `href="/<repository-name>/"`.
