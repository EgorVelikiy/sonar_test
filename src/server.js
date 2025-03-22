const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(express.json())

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use(routes)

const port = process.env.PORT || 7070;

app.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`)
);