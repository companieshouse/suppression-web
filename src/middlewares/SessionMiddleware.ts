import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as expressAsyncHandler from 'express-async-handler'
import * as onHeaders from 'on-headers'
import { CookieConfig, Session, SessionStore } from 'ch-node-session-handler';
import { loggerInstance } from 'ch-node-session-handler/lib/Logger';
import { Cookie, validateCookieSignature } from 'ch-node-session-handler/lib/session/model/Cookie';
import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey';

import * as crypto from "crypto";

const DEFAULT_COOKIE_SECURE_FLAG = false;
const DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS = 3600;

export function SessionMiddleware (config: CookieConfig, sessionStore: SessionStore): RequestHandler {

  if (!config.cookieName) {
    throw Error('Cookie name must be defined');
  }
  if (!config.cookieDomain) {
    throw Error('Cookie domain must be defined');
  }
  if (!config.cookieSecret || config.cookieSecret.length < 24) {
    throw Error('Cookie secret must be at least 24 chars long');
  }

  return expressAsyncHandler(sessionRequestHandler(config, sessionStore));
}

const sessionRequestHandler = (config: CookieConfig, sessionStore: SessionStore): RequestHandler => {

  return async (request: Request, response: Response, next: NextFunction): Promise<any> => {

    const sessionCookie: string = request.cookies[config.cookieName];
    let originalSessionHash: string;

    onHeaders(response, () => {
      if (request.session) {

        if (hash(request.session) !== originalSessionHash) {
          response.cookie(config.cookieName, sessionCookie, {
            domain: config.cookieDomain,
            path: '/',
            httpOnly: true,
            secure: config.cookieSecureFlag || DEFAULT_COOKIE_SECURE_FLAG,
            maxAge: (config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS) * 1000,
            encode: String
          })
        }

      }
      else {
        if (sessionCookie) {
          response.clearCookie(config.cookieName);
        }
      }
    });

    type MethodSignature = { (cb?: () => void): void; (chunk: any, cb?: () => void): void; (chunk: any, encoding: string, cb?: () => void): void }

    response.end = new Proxy(response.end, {
      async apply (target: MethodSignature, thisArg: any, argsArg?: any): Promise<void> {
        if (request.session !== undefined && hash(request.session) !== originalSessionHash) {
          try {
            await sessionStore.store(Cookie.createFrom(sessionCookie), request.session.data,
              config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS)
          } catch (err) {
            loggerInstance().error(err.message)
          }
        }
        return target.apply(thisArg, argsArg)
      }
    });

    if (sessionCookie) {

      loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);

      request.session = await loadSession(sessionCookie, config, sessionStore);

      if (request.session != null) {
        originalSessionHash = hash(request.session)
      }

    } else {
      // if there is no cookie, we need to create a new session
      loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}, creating new session`);

      const session = new Session();
      const cookie: Cookie = Cookie.createNew(config.cookieSecret);
      session.data = { [SessionKey.Id]: cookie.value };

      // store cookie session in Redis
      await sessionStore.store(cookie, session.data, 3600);

      // set the cookie for future requests
      request.session = session;
      response.cookie(config.cookieName, session.data[SessionKey.Id]);
      delete request.session

    }
    next();
  }
};

const hash = (session: Session): string => {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(session.data), 'utf8')
    .digest('hex')
};

async function loadSession (sessionCookie: string, config: CookieConfig, sessionStore: SessionStore): Promise<Session | undefined> {
  let cookie: Cookie;
  try {
    validateCookieSignature(sessionCookie, config.cookieSecret);
    cookie = Cookie.createFrom(sessionCookie);
    const sessionData = await sessionStore.load(cookie);
    const session = new Session(sessionData);

    // session.verify();

    loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
    return session;
  } catch (sessionLoadingError) {
    // @ts-ignore
    if (cookie) {
      try {
        await sessionStore.delete(cookie);
      } catch (sessionDeletionError) {
        loggerInstance().error(`Session deletion failed for cookie ${sessionCookie} due to error: ${sessionDeletionError}`);
      }
    }

    loggerInstance().error(`Session loading failed from cookie ${sessionCookie} due to error: ${sessionLoadingError}`);
    return undefined;
  }
}
