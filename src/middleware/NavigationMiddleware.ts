import { NextFunction, Request, RequestHandler, Response } from 'express';
import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';

export function NavigationMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    console.log('Navigation Middleware Intercepted Request');

    if (req.originalUrl.startsWith(APPLICANT_DETAILS_PAGE_URI) || req.originalUrl === ROOT_URI){
      console.log(`${req.originalUrl} is exempt from navigation rules` );
      return next()
    }

    let navigationPermissions = SessionService.getNavigationPermissions(req);

    if (navigationPermissions === undefined){
      SessionService.setNavigationPermission(req, []);
      navigationPermissions = [];
    }

    console.log('------------------');
    console.log('Original URL: ', req.originalUrl);
    console.log('Navigation Permissions: ', navigationPermissions);
    console.log('------------------');

    const permissionMatchesDestination = (element) => req.originalUrl.startsWith(element);

    if (navigationPermissions!.some((permissionMatchesDestination))) {
      return next()
    } else {
      if (navigationPermissions === []){
        res.redirect(APPLICANT_DETAILS_PAGE_URI)
      }
      res.redirect(navigationPermissions![navigationPermissions!.length-1])
    }

  }

}
