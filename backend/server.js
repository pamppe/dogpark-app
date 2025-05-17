const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let currentData = [];

app.post('/update', (req, res) => {
  const { lat, lon, people, dogs } = req.body;
  console.log('Received update:', { lat, lon, people, dogs });
  currentData = [{ lat, lon, people, dogs, timestamp: Date.now() }];
  res.send({ status: 'ok' });
});

app.get('/status', (req, res) => {

  console.log('Sending status:', currentData);
  res.json(currentData);
});

app.listen(port, () => {
  console.log(`DogPark backend listening at http://localhost:${port}`);
});
