import { SessionStore } from 'ch-node-session-handler';
import * as express from 'express';
import IORedis from 'ioredis';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { routes } from './routes/routes';

import cookieParser = require('cookie-parser');
import { ROOT_URI } from './routes/paths';
import { SessionMiddleware } from './middlewares/SessionMiddleware';

const app = express();

// set up app variables from the environment
app.set('port', process.env.PORT || '3000');
app.locals.cdn = { host: process.env.CDN_HOST };

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

// Session
const sessionStore = new SessionStore(new IORedis(process.env.CACHE_SERVER));
const verifyFlag: boolean = false;

const sessionMiddleware = SessionMiddleware({
  cookieName: process.env.COOKIE_NAME as string,
  cookieDomain: process.env.COOKIE_DOMAIN as string,
  cookieSecret: process.env.COOKIE_SECRET as string
}, sessionStore, verifyFlag);

app.use(cookieParser());
app.use('*', sessionMiddleware);

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

// apply our default routes to /
app.use('/', routes);

export default app;
