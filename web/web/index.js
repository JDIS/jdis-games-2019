'use strict';

if (!process.env.WEB_SECRET) {
  throw new Error('You need an .env file. Go read the readme');
}

const Koa = require('koa');
const app = module.exports = new Koa();

app.use(require('koa-favicon')((`${__dirname}/resources/favicon.png`)));
app.use(require('koa-logger')());
app.use(require('koa-helmet')());
app.use(require('koa-compress')({
  flush: require('zlib').Z_SYNC_FLUSH
}));

app.keys = [process.env.WEB_SECRET];
app.use(require('koa-session')(app));
app.use(require('koa-bodyparser')());

app.use(require('koa-views')(`${__dirname}/src/views`, {
  extension: 'hbs',
  map: { hbs: 'handlebars' },
  options: {
    partials: {
      start: 'partials/start',
      end: 'partials/end',
    },
  }
}));
app.use(require('./src/middlewares').manage401);
app.use(require('./src/middlewares').addHelpers);
app.use(require('./src/middlewares').manageConnection);
app.use(require('./src/middlewares').manageConfigs);

const controllers = require('./src/controllers');
app.use(controllers.routes())
  .use(controllers.allowedMethods());

const serveList = require('koa-serve-list');
const serveStatic = require('koa-serve-static');
const mount = require('koa-mount');
app.use(mount('/public', (ctx, next) =>
  serveList('public')(ctx, next)
    .catch(() => serveStatic('public')(ctx, next))
    .catch(e => console.error(e))));


if (process.env.USE_HTTPS) {
  const fs = require('fs');
  const keyFilePath = './keys/key.pem';
  const certFilePath = './keys/cert.pem';

  if (!fs.existsSync(keyFilePath)) {
    throw new Error('No key file found. Go read the readme.');
  }

  if (!fs.existsSync(certFilePath)) {
    throw new Error('No cert file found. Go read the readme.');
  }

  const https = require('https');
  const options = {
    key: fs.readFileSync(keyFilePath),
    cert: fs.readFileSync(certFilePath)
  };

  const httpsServer = https.createServer(options, app.callback())
    .listen(8080);
}
else {
  app.listen(8080);
}

console.log('listening on port 8080');
