import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { CookieConfig } from 'ch-node-session-handler';
import { generateRandomBytesBase64 } from 'ch-node-session-handler/lib/utils/CookieUtils';
import { NextFunction } from 'express';
import { SessionMiddleware } from '../../src/middlewares/SessionMiddleware';

describe('SessionMiddleware', () => {
  const config: CookieConfig = {
    cookieName: "__SID",
    cookieDomain: "localhost",
    cookieSecret: generateRandomBytesBase64(16),
  };

  const requestMetadata = { url: "/test-url", path: "/test-url", method: "GET" }
  const nextFunction = Substitute.for<NextFunction>();

  describe("middleware initialisation", () => {

    it("should fail when cookie name is missing", () => {
      [undefined, null, ""].forEach(cookieName => {
        expect(() => SessionMiddleware({ ...config, cookieName }, undefined, undefined))
          .toThrow("Cookie name must be defined")
      });
    });

    it("should fail when cookie domain is missing", () => {
      [undefined, null, ""].forEach(cookieDomain => {
        expect(() => SessionMiddleware({ ...config, cookieDomain }, undefined, undefined))
          .toThrow("Cookie domain must be defined")
      });
    });

    it("should fail when cookie secret is missing or too short", () => {
      [undefined, null, "", "12345678901234567890123"].forEach(cookieSecret => {
        expect(() => SessionMiddleware({ ...config, cookieSecret }, undefined, undefined))
          .toThrow("Cookie secret must be at least 24 chars long")
      });
    });

  })
});
