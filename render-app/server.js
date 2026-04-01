const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const APP_TITLE = process.env.APP_TITLE || "Render Notes Board";
const APP_MESSAGE =
  process.env.APP_MESSAGE ||
  "This full-stack app is deployed on Render and stores notes in PostgreSQL.";
const DEFAULT_AUTHOR = process.env.DEFAULT_AUTHOR || "Anonymous";
const NODE_ENV = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL;
const isDatabaseMode = Boolean(databaseUrl);
const SEED_NOTES = (process.env.SEED_NOTES || "Finish deployment report|Take a deployment screenshot")
  .split("|")
  .map((note) => note.trim())
  .filter(Boolean);

const memoryNotes = SEED_NOTES.map((text, index) => ({
  id: index + 1,
  author: DEFAULT_AUTHOR,
  text,
  created_at: new Date().toISOString(),
}));

const pool = isDatabaseMode
  ? new Pool({
      connectionString: databaseUrl,
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  : null;

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/health", async (req, res) => {
  try {
    if (isDatabaseMode) {
      await pool.query("SELECT 1");
    }

    res.json({ status: "ok", database: isDatabaseMode ? "postgres" : "memory" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed." });
  }
});

app.get("/", async (req, res) => {
  try {
    const notes = await getNotes();
    const noteItems = notes
      .map(
        (note) => `
          <li class="note-card">
            <p class="note-text">${escapeHtml(note.text)}</p>
            <p class="note-meta">By ${escapeHtml(note.author)} at ${escapeHtml(formatDate(note.created_at))}</p>
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
            <p class="eyebrow">Render High Distinction Task</p>
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
              <div>
                <span class="stat-label">Database</span>
                <strong>${isDatabaseMode ? "Render PostgreSQL" : "In-memory fallback"}</strong>
              </div>
            </div>
          </section>

          <section class="content-grid">
            <form class="note-form" method="POST" action="/notes">
              <h2>Add a Note</h2>
              <p class="helper-copy">Post a note to the shared deployment board.</p>
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
                <p>${notes.length} note${notes.length === 1 ? "" : "s"} stored in ${
      isDatabaseMode ? "PostgreSQL" : "memory"
    }</p>
              </div>
              <ul class="notes-list">
                ${noteItems || '<li class="note-card empty">No notes yet.</li>'}
              </ul>
            </section>
          </section>
        </main>
      </body>
    </html>`);
  } catch (error) {
    console.error("Failed to load notes:", error);
    res.status(500).send("Unable to load notes right now.");
  }
});

app.post("/notes", async (req, res) => {
  const author = (req.body.author || DEFAULT_AUTHOR).trim().slice(0, 40) || DEFAULT_AUTHOR;
  const text = (req.body.text || "").trim().slice(0, 140);

  if (text) {
    try {
      await addNote({ author, text });
    } catch (error) {
      console.error("Failed to save note:", error);
      return res.status(500).send("Unable to save note right now.");
    }
  }

  res.redirect("/");
});

initializeStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize storage:", error);
    process.exit(1);
  });

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function initializeStorage() {
  if (!isDatabaseMode) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      author VARCHAR(40) NOT NULL,
      text VARCHAR(140) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM notes");

  if (rows[0].count === 0 && SEED_NOTES.length > 0) {
    for (const text of SEED_NOTES) {
      await pool.query("INSERT INTO notes (author, text) VALUES ($1, $2)", [DEFAULT_AUTHOR, text]);
    }
  }
}

async function getNotes() {
  if (!isDatabaseMode) {
    return memoryNotes.slice().reverse();
  }

  const { rows } = await pool.query(
    "SELECT id, author, text, created_at FROM notes ORDER BY created_at DESC, id DESC"
  );
  return rows;
}

async function addNote(note) {
  if (!isDatabaseMode) {
    memoryNotes.push({
      id: memoryNotes.length + 1,
      author: note.author,
      text: note.text,
      created_at: new Date().toISOString(),
    });
    return;
  }

  await pool.query("INSERT INTO notes (author, text) VALUES ($1, $2)", [note.author, note.text]);
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });
}
