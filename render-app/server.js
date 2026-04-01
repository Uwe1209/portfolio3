const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const APP_TITLE = process.env.APP_TITLE || "Render Notes Board";
const APP_MESSAGE =
  process.env.APP_MESSAGE ||
  "This simple Node.js app is deployed on Render with custom environment variables.";
const DEFAULT_AUTHOR = process.env.DEFAULT_AUTHOR || "Anonymous";
const SEED_NOTES = (process.env.SEED_NOTES || "Finish deployment report|Take a deployment screenshot")
  .split("|")
  .map((note) => note.trim())
  .filter(Boolean);

const notes = SEED_NOTES.map((text, index) => ({
  id: index + 1,
  author: DEFAULT_AUTHOR,
  text,
  createdAt: new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" }),
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  const noteItems = notes
    .slice()
    .reverse()
    .map(
      (note) => `
        <li class="note-card">
          <p class="note-text">${escapeHtml(note.text)}</p>
          <p class="note-meta">By ${escapeHtml(note.author)} at ${escapeHtml(note.createdAt)}</p>
        </li>
      `
    )
    .join("");

  res.send(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(APP_TITLE)}</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <main class="page-shell">
        <section class="hero">
          <p class="eyebrow">Render Credit Task</p>
          <h1>${escapeHtml(APP_TITLE)}</h1>
          <p class="hero-copy">${escapeHtml(APP_MESSAGE)}</p>
          <div class="hero-stats">
            <div>
              <span class="stat-label">Environment</span>
              <strong>Node.js + Express</strong>
            </div>
            <div>
              <span class="stat-label">Deploy Mode</span>
              <strong>Auto deploy on Git push</strong>
            </div>
          </div>
        </section>

        <section class="content-grid">
          <form class="note-form" method="POST" action="/notes">
            <h2>Add a Note</h2>
            <label for="author">Name</label>
            <input id="author" name="author" type="text" maxlength="40" placeholder="${escapeHtml(
              DEFAULT_AUTHOR
            )}" />

            <label for="text">Message</label>
            <textarea
              id="text"
              name="text"
              rows="5"
              maxlength="140"
              placeholder="Write a short deployment update"
              required
            ></textarea>

            <button type="submit">Post note</button>
          </form>

          <section class="notes-panel">
            <div class="panel-header">
              <h2>Live Notes</h2>
              <p>${notes.length} note${notes.length === 1 ? "" : "s"} in memory</p>
            </div>
            <ul class="notes-list">
              ${noteItems || '<li class="note-card empty">No notes yet.</li>'}
            </ul>
          </section>
        </section>
      </main>
    </body>
  </html>`);
});

app.post("/notes", (req, res) => {
  const author = (req.body.author || DEFAULT_AUTHOR).trim().slice(0, 40) || DEFAULT_AUTHOR;
  const text = (req.body.text || "").trim().slice(0, 140);

  if (text) {
    notes.push({
      id: notes.length + 1,
      author,
      text,
      createdAt: new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" }),
    });
  }

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
