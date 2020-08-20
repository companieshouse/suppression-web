import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import IORedis from 'ioredis';
import { routes } from './routes/routes';
import { SessionMiddleware, SessionStore } from 'ch-node-session-handler';

import cookieParser = require('cookie-parser');

const app = express();

// env
app.set('port', process.env.PORT || '3000');
app.locals.cdn = { host: process.env.CDN_HOST };

// nunjucks templates should resolve to
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

//Session
const sessionStore = new SessionStore(new IORedis(process.env.CACHE_SERVER));

const sessionMiddleware = SessionMiddleware({
  cookieName: process.env.COOKIE_NAME as string,
  cookieDomain: process.env.COOKIE_DOMAIN as string,
  cookieSecret: process.env.COOKIE_SECRET as string
}, sessionStore);

app.use(cookieParser());
app.use(sessionMiddleware);

// apply our default routes to /
app.use('/', routes);

export default app;
