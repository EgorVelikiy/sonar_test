const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const http = require('http');
const pool = require('./config/db.config');
const { uploadImages } = require('./controllers/ImageController');

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

const server = http.createServer(app);

server.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`)
);

module.exports = server;