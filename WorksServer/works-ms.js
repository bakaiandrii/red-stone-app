const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const worksRouter = require('./routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/works', worksRouter);

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
});
