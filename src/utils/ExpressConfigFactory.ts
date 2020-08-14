import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

export const createExpressConfig = () => (app: express.Application): void => {
    // where nunjucks templates should resolve to
    const viewPath = path.join(__dirname, 'views');

    // set up the template engine
    const env = nunjucks.configure([
        'dist/views',
        'node_modules/govuk-frontend/',
        'node_modules/govuk-frontend/components',
    ], {
        autoescape: true,
        express: app,
    });

    app.set('views', viewPath);
    app.set('view engine', 'njk');

    env.addGlobal('CDN_HOST', 'cdn.chs.local');
};
