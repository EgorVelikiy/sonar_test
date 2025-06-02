const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const http = require('http');

const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const app = express();

app.use('/public', express.static(path.join(__dirname, '../public')));

const corsOptions = {
  origin: ['https://your-trusted-domain.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json())

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'status', 'route', 'pod'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});
register.registerMetric(httpRequestDuration)

const httpRequestCounter = new client.Counter({
  name: 'http_request_total',
  help: 'Количество HTTP запросов',
  labelNames: ['method', 'route', 'pod']
})
register.registerMetric(httpRequestCounter);

const podName = process.env.HOSTNAME;

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  const route = req.route?.path || req.path || req.originalUrl
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route,
      pod: podName,
    });
    end({
      method: req.method, 
      status: res.statusCode,
      route,
      pod: podName,
    })
  });
  next();
})

app.use(routes)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
})

const port = process.env.PORT || 7070;

const server = http.createServer(app);

server.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`)
);

module.exports = server;
module.exports = app;