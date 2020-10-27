const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const lookupRouter = require('./routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/lookup', lookupRouter);


const port = process.env.PORT || 2000;
const host = process.env.HOST || 'localhost';

app.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
});
