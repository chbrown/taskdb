import {IncomingMessage, ServerResponse, createServer} from 'http';
import {addBody, addXhr, addUrlObj} from 'http-extend';
import respond, {Payload} from 'http-respond';
import {logger} from 'loge';
import {inspect} from 'util';
import * as urlio from 'urlio';

import routes from './routes';
import Layout, {ErrorView} from './components/Layout';

/**
Uses `routes` global.
*/
function addRoute<Req extends {method?: string, pathname: string}>(req: Req) {
  const route = urlio.parse(routes, {url: req.pathname, method: req.method});
  if (route === undefined) {
    // this is perhaps overly dramatic but there really ought to be a catch-all route
    throw new Error('Not Found');
  }
  return Object.assign(req, {route, params: route.params});
}

function httpHandler(req: IncomingMessage, res: ServerResponse): void {
  Promise.resolve(req).then(addBody).then(addXhr).then(addUrlObj).then(addRoute)
  .then(req => {
    return Promise.resolve(req.route.handler(req))
    .catch(error => {
      // last-ditch effort to recover from errors while still formatting them adaptively
      let props = {message: error.message, stack: error.stack};
      let payload: Payload<any> = {props, Component: ErrorView, statusCode: 400};
      return payload;
    })
    .then(payload => ({req, payload}));
  })
  .then(({req, payload}) => {
    // logger.debug(`rendering payload=${inspect(payload)}`);
    payload = Object.assign(payload, {xhr: req.xhr})
    if (payload.Component && !payload.LayoutComponent) {
      payload = Object.assign(payload, {LayoutComponent: Layout})
    }
    respond(res, payload);
  })
  .catch(error => {
    // oops, complete fail, handle any/all errors that occurred in the rendering step here.
    // logger.info('handler failure', error.stack ? error.stack : error.toString());
    res.statusCode = 500;
    res.end(error.stack);
  });
}

export const defaultPort = 8275;
export const defaultHostname = '127.0.0.1';
export function start(port: number = defaultPort, hostname: string = defaultHostname) {
  const server = createServer((req, res) => {
    var started = Date.now();
    res.on('finish', () => {
      logger.debug('%s %s [%d ms]', req.method, req.url, Date.now() - started);
    });
    httpHandler(req, res);
  });
  server.on('listening', () => {
    var address = server.address();
    logger.info(`server listening on http://${address.address}:${address.port}`);
  });
  server.listen(port, hostname);
}
