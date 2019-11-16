const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const Boom = require('boom');
const appConfig = require('./lib/appCongif');


// cors
app.use(cors());
// DB connection
require('./lib/db/MongoDb/index');

// body parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

// App Configs
app.use(appConfig.trimParams);

app.use('/user', require('./routes/user'));

// Error handling
app.use(appConfig.handleError);
// Handle response
app.use(appConfig.handleSuccess);
// // Handle response
// app.use(appConfig.handle404);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
