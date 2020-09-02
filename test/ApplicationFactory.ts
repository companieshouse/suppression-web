import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { SuppressionData } from '../src/models/SuppressionDataModel'
import { getConfigValue, loadEnvironmentVariables } from '../src/modules/config-handler/ConfigHandler';
import { configValidationSchema } from '../src/modules/config-handler/ConfigValidation.schema';
import { routes } from '../src/routes/routes';

export function createApp() {

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

  app.set('views', viewPath);
  app.set('view engine', 'njk');

  const RedisStore = require('connect-redis')(session);

  const redis = require('redis-mock');

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
    store: new RedisStore({ client: redis.createClient() })
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', routes);
  return app;
}
