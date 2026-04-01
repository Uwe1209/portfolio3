const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const MESSAGE = process.env.APP_MESSAGE || "Default message";

app.get("/", (req, res) => {
  res.send(`
    <h1>${MESSAGE}</h1>
    <p>This is my render app deployed on Render.</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});