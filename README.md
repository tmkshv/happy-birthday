# Happy Birthday

A playful birthday website for a special someone: a short intro, three surprises to open, and a playful "let's meet up" question at the end, with background music.

## What's in the project

| File | Purpose |
| --- | --- |
| `index.html` | The page itself — open this file to view the site |
| `styles.css` | All styling and animations |
| `script.js` | Confetti, the surprises, the Yes/No interaction, and the music controls |
| `happy-birthday.wav` | Background music |

There is nothing to install and no build step. It is plain HTML, CSS, and JavaScript that runs directly in any modern browser.

## How to open it

### Option 1 — double-click (simplest)

Open the project folder in Finder (macOS), File Explorer (Windows), or your file manager, then double-click **`index.html`**. It opens in your default browser.

If it opens in a text editor instead of a browser, right-click `index.html` and choose *Open with* → your browser (Chrome, Safari, Edge, or Firefox).

### Option 2 — from the terminal

Run one of these from inside the project folder:

```bash
# macOS
open index.html

# Windows (PowerShell)
start index.html

# Linux
xdg-open index.html
```

### Option 3 — local web server (closest to the live site)

Some browsers are stricter with audio and files opened directly from disk. To preview exactly how the deployed site behaves, serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Press `Ctrl+C` in the terminal to stop the server.

## Using the site

- Click **Continue** on the first screen to reach the surprises.
- Open all three surprises to unlock the final section.
- The music starts on your first click or key press — browsers block audio until you interact with the page. Use the control in the bottom-right corner to adjust the volume or mute it.
- On a computer, the **No** button playfully dodges the cursor. On phones and tablets both buttons stay put, since there is no cursor to dodge.

## Deploy

The site is fully static, so any static host works. The quickest route:

1. Zip `index.html`, `styles.css`, `script.js`, `happy-birthday.wav`, and this README.
2. Drag the zip onto [Netlify Drop](https://app.netlify.com/drop).
3. Share the URL Netlify gives you.
