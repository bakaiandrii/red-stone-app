const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv')
const expressHandlebars = require('express-handlebars')
const path = require('path');

const authRouter = require('./routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(process.cwd(), 'views')));
app.engine('.hbs', expressHandlebars({ defaultLayout: false }));
app.set('view engine', '.hbs');
app.set('views', path.join(process.cwd(), 'views'));

app.use('/auth', authRouter);

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

app.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
});
