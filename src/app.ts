import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import IORedis from 'ioredis';

import {
  getConfigValue,
  loadEnvironmentVariables
} from './modules/config-handler/ConfigHandler';
import { configValidationSchema } from './modules/config-handler/ConfigValidation.schema';
import { routes } from './routes/routes';

loadEnvironmentVariables({validationSchema: configValidationSchema});

const app = express();

const RedisStore = connectRedis(session);

app.use(session({
  secret: getConfigValue('COOKIE_SECRET') as string,
  name: getConfigValue('COOKIE_NAME'),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: parseInt(getConfigValue('COOKIE_EXPIRATION_IN_SECONDS') as string,10) * 1000,
    domain: getConfigValue('COOKIE_DOMAIN')
  },
  store: new RedisStore({ client: new IORedis(getConfigValue('CACHE_SERVER')) })
}));

// set up app variables from the environment
app.set('port', getConfigValue('PORT'));

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, 'views');

// set up the template engine
const env = nunjucks.configure([
  viewPath,
  'node_modules/govuk-frontend/',
  'node_modules/govuk-frontend/components',
], {
  autoescape: true,
  express: app,
});

app.set('views', viewPath);
app.set('view engine', 'njk');

app.locals.cdn = {
  host: getConfigValue('CDN_HOST')
};

// set up ability to parse POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// apply our default routes to /
app.use('/', routes);

export default app;
