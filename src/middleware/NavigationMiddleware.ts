import { NextFunction, Request, RequestHandler, Response } from 'express';
import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';

export function NavigationMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    if (req.method !== 'GET'){
      return next()
    }

    console.log(`Navigation Middleware Intercepted ${req.method} Request`);

    if (req.originalUrl.startsWith(APPLICANT_DETAILS_PAGE_URI) || req.originalUrl === ROOT_URI){
      console.log(`${req.originalUrl} is exempt from navigation rules` );
      return next()
    }

    let navigationPermissions = SessionService.getSuppressionSession(req)?.navigationPermissions;

    if (!navigationPermissions){
      console.log('navigationPermissions is undefined');
      SessionService.setNavigationPermission(req, []);
      navigationPermissions = SessionService.getNavigationPermissions(req)
    }

    if (navigationPermissions!.includes(req.originalUrl)) {
      return next()

    } else {
      if (navigationPermissions!.length === 0){
        console.log('navigationPermissions is empty, redirecting to applicant details page');
        return res.redirect(APPLICANT_DETAILS_PAGE_URI)
      }

      console.log('redirecting to last page');
      return res.redirect(navigationPermissions![navigationPermissions!.length-1])
    }

  }

}
