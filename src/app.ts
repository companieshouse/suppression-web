import { CookieConfig, SessionMiddleware, SessionStore } from 'ch-node-session-handler';
import * as express from 'express';
import IORedis from 'ioredis';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import {
  getConfigValue,
  loadEnvironmentVariables
} from './modules/config-handler/ConfigHandler';
import { configValidationSchema } from './modules/config-handler/ConfigValidation.schema';
import { routes } from './routes/routes';

import cookieParser = require('cookie-parser');

const app = express();

loadEnvironmentVariables({validationSchema: configValidationSchema});

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

// Session
const sessionStore = new SessionStore(new IORedis(getConfigValue('CACHE_SERVER')));

const sessionMiddleware = SessionMiddleware({
  cookieName: getConfigValue('COOKIE_NAME'),
  cookieDomain: getConfigValue('COOKIE_DOMAIN'),
  cookieSecret: getConfigValue('COOKIE_SECRET')
} as CookieConfig, sessionStore);

app.use(cookieParser());
app.use(sessionMiddleware);

// apply our default routes to /
app.use('/', routes);

export default app;
