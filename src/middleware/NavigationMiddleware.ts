import { NextFunction, Request, RequestHandler, Response } from 'express';
import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';

export function NavigationMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    if (req.method !== 'GET') {
      return next()
    }

    console.log(`Navigation Middleware Intercepted ${req.method} Request`);

    if (req.originalUrl.startsWith(APPLICANT_DETAILS_PAGE_URI) || req.originalUrl === ROOT_URI) {
      console.log(`${req.originalUrl} is exempt from navigation rules`);
      return next()
    }

    const navigationPermissions: string[] | undefined = SessionService.getSuppressionSession(req)?.navigationPermissions;

    if (!navigationPermissions || navigationPermissions.length === 0) {
      console.log('No permissions set, redirecting to Applicant details page');
      return res.redirect(APPLICANT_DETAILS_PAGE_URI)

    } else if (!navigationPermissions.includes(req.originalUrl)) {
      console.log('page not included in navigation permissions page, redirecting to last page');
      return res.redirect(navigationPermissions![navigationPermissions!.length - 1])
    }

    return next()

  }

}
