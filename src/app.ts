import bodyParser from 'body-parser';
import { SessionMiddleware, SessionStore } from 'ch-node-session-handler';
import cookieParser from 'cookie-parser';
import express from 'express';
import IORedis from 'ioredis';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { AuthMiddleware } from './middleware/AuthMiddleware';
import { defaultHandler } from './middleware/ErrorHandler';
import {
  getConfigValue,
  loadEnvironmentVariables
} from './modules/config-handler/ConfigHandler';
import { configValidationSchema } from './modules/config-handler/ConfigValidation.schema';
import { dateFilter } from './modules/nunjucks/DateFilter';
import * as Paths from './routes/paths';
import { routes } from './routes/routes';

loadEnvironmentVariables({validationSchema: configValidationSchema});

const app = express();

const sessionStore = new SessionStore(new IORedis(`redis://${getConfigValue('CACHE_SERVER')}`))

app.use(cookieParser());
app.use(SessionMiddleware({
  cookieName: getConfigValue('COOKIE_NAME') as string,
  cookieDomain: getConfigValue('COOKIE_DOMAIN') as string,
  cookieSecureFlag: getConfigValue('COOKIE_SECURE_ONLY') === 'true',
  cookieTimeToLiveInSeconds: parseInt(getConfigValue('COOKIE_EXPIRATION_IN_SECONDS') as string, 10),
  cookieSecret: getConfigValue('COOKIE_SECRET') as string
}, sessionStore));

app.use(AuthMiddleware());

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

env.addFilter('date', dateFilter);

app.set('views', viewPath);
app.set('view engine', 'njk');

app.locals.paths = Paths;
app.locals.cdn = {
  host: getConfigValue('CDN_HOST')
};

// set up ability to parse POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// apply our default routes to /
app.use('/', routes);

// set up error handler
app.use(defaultHandler);

export default app;
