const express = require('express');
const cors = require('cors');

const user = require('./routes/user-routes');
const ingrediente = require('./routes/ingrediente-routes');
const racao = require('./routes/racao-routes');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const app = express();
app.use(express.json());

app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', user);
app.use('/ingredientes', ingrediente);
app.use('/racoes', racao);

module.exports = app;
