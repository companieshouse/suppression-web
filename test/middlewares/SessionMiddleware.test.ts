import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { CookieConfig, SessionStore, Session } from 'ch-node-session-handler';
import { generateRandomBytesBase64 } from 'ch-node-session-handler/lib/utils/CookieUtils';
import { NextFunction, Request, Response } from 'express';
import { SessionMiddleware } from '../../src/middlewares/SessionMiddleware';
import { createSession } from '../../../lfp-appeals-frontend/test/utils/session/SessionFactory';
import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey';
import { Cookie } from 'ch-node-session-handler/lib/session/model/Cookie';

describe('SessionMiddleware', () => {
  const config: CookieConfig = {
    cookieName: '__SID',
    cookieDomain: 'localhost',
    cookieSecret: generateRandomBytesBase64(16),
  };

  const requestMetadata = { url: '/test-url', path: '/test-url', method: 'POST' };
  const nextFunction = Substitute.for<NextFunction>();

  describe('middleware initialisation', () => {

    it('should fail when cookie name is missing', () => {
      [undefined, null, ''].forEach(cookieName => {
        expect(() => SessionMiddleware({ ...config, cookieName }, undefined, false))
          .toThrow('Cookie name must be defined')
      });
    });

    it('should fail when cookie domain is missing', () => {
      [undefined, null, ''].forEach(cookieDomain => {
        expect(() => SessionMiddleware({ ...config, cookieDomain }, undefined, false))
          .toThrow('Cookie domain must be defined')
      });
    });

    it('should fail when cookie secret is missing or too short', () => {
      [undefined, null, '', '12345678901234567890123'].forEach(cookieSecret => {
        expect(() => SessionMiddleware({ ...config, cookieSecret }, undefined, false))
          .toThrow('Cookie secret must be at least 24 chars long')
      });
    });
  });

  describe('when cookie is not present', () => {
    const request = {
      ...requestMetadata,
      cookies: {}
    } as Request;

    it('should create a session and store on redis', async () => {
      const sessionStore = Substitute.for<SessionStore>();
      const response = Substitute.for<Response>()

      await SessionMiddleware(config, sessionStore, false)(request, response, nextFunction);

      sessionStore.received(1).store(Arg.all());
    });
  });

  describe('when cookie is present', () => {
    const session: Session = createSession(config.cookieSecret);
    const request = {
      ...requestMetadata,
      cookies: { [config.cookieName]: '' + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig) }
    } as Request;
    const cookieArg = () => {
      return Arg.is((_: Cookie) => _.value === '' + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig));
    };

    it('should load a session and insert session object in the request', async () => {
      const sessionStore = Substitute.for<SessionStore>();
      sessionStore.load(cookieArg()).returns(Promise.resolve(session.data));

      await SessionMiddleware(config, sessionStore, false)(request, Substitute.for<Response>(), nextFunction);

      expect(request.session.data).toEqual(session.data);
    });

    it('should delete session and delete session object from the request if session load fails', async () => {
      const sessionStore = Substitute.for<SessionStore>();
      sessionStore.load(cookieArg()).returns(Promise.reject('Unexpected error in session loading'));
      sessionStore.delete(cookieArg()).returns(Promise.resolve());

      const response: SubstituteOf<Response> = Substitute.for<Response>();
      await SessionMiddleware(config, sessionStore, false)(request, response, nextFunction);

      expect(request.session).toBeUndefined();
      sessionStore.received().delete(cookieArg() as any);
    });

    it('should silently ignore error that happened when session was being deleted after session load failed', async () => {
      const sessionStore = Substitute.for<SessionStore>();
      sessionStore.load(cookieArg()).returns(Promise.reject('Unexpected error in session loading'));
      sessionStore.delete(cookieArg()).returns(Promise.reject('Unexpected error in session deletion'));

      const response: SubstituteOf<Response> = Substitute.for<Response>();
      try {
        await SessionMiddleware(config, sessionStore, false)(request, response, nextFunction);
      } catch (e) {
        expect(fail('Test should not have thrown error'))
      }
    });
  });
});
