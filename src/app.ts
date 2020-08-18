import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { routes } from './routes/routes';

const app = express();

// set up app variables from the environment
app.set('port', process.env.PORT || '3000');

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
  host: process.env.CDN_HOST
};

// apply our default routes to /
app.use('/', routes);

export default app;
