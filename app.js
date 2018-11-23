const express = require('express');
const app = express();

// Setting up routes
const routes = require('./routes');
app.use(routes);

module.exports = app;