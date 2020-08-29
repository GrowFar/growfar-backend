const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const graphqlHTTP = require('express-graphql');
const app = express();

const { connection } = require('./database');
const { flushDb } = require('./tile38');

const { SERVER_PORT, NODE_ENV, AUTH_TOKEN } = require('./config');
const { notFound, errorHandler } = require('./middlewares');
const graphqlSchema = require('./graphql/schema');

if (NODE_ENV !== 'production') {
  require('longjohn').async_trace_limit = -1;
  Error.stackTraceLimit = Infinity;
}

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger(NODE_ENV === 'development' ? 'dev' : 'combined'));

// eslint-disable-next-line no-unused-vars
app.use('/graphql', express.json(), graphqlHTTP((req, res, params) => ({
  schema: graphqlSchema,
  graphiql: true,
  pretty: true,
  context: {
    SECRET_KEY: AUTH_TOKEN,
    ...req.state,
  },
})));

app.get('/seeding', async (req, res, next) => {
  try {

    if (NODE_ENV === 'development') {
      await connection.sync({ force: NODE_ENV === 'development' });
      await flushDb();
    }

    res.status(200).json({ message: 'Seeding successfully' });
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorHandler);

app.listen(SERVER_PORT, () => console.info(`Server is running at port ${SERVER_PORT}`));
