import { SessionMiddleware, SessionStore } from '@companieshouse/node-session-handler';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { AuthMiddleware } from '../src/middleware/AuthMiddleware';
import { defaultHandler } from '../src/middleware/ErrorHandler';
import { NavigationMiddleware } from '../src/middleware/NavigationMiddleware';
import { getConfigValue, loadEnvironmentVariables } from '../src/modules/config-handler/ConfigHandler';
import { configValidationSchema } from '../src/modules/config-handler/ConfigValidation.schema';
import { dateFilter } from '../src/modules/nunjucks/DateFilter'
import * as Paths from '../src/routes/paths';
import { routes } from '../src/routes/routes';

export function createApp(authEnabled?: boolean, navEnabled?: boolean) {

  loadEnvironmentVariables({validationSchema: configValidationSchema});
  const app = express();

  // where nunjucks templates should resolve to
  const viewPath = path.join('src/', 'views');

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

  const redis = require('redis-mock');
  const sessionStore = new SessionStore(redis.createClient())

  app.use(cookieParser())
  app.use(SessionMiddleware({
    cookieName: getConfigValue('COOKIE_NAME') as string,
    cookieDomain: getConfigValue('COOKIE_DOMAIN') as string,
    cookieSecureFlag: getConfigValue('COOKIE_SECURE_ONLY') === 'true',
    cookieTimeToLiveInSeconds: parseInt(getConfigValue('COOKIE_EXPIRATION_IN_SECONDS') as string, 10),
    cookieSecret: getConfigValue('COOKIE_SECRET') as string
  }, sessionStore));

  if (authEnabled) {
    app.use(AuthMiddleware());
  }

  if (navEnabled) {
    app.get('*', NavigationMiddleware())
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', routes);

  app.use(defaultHandler);

  return app;
}
