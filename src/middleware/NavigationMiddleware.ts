import { NextFunction, Request, RequestHandler, Response } from 'express';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import {
  ACCESSIBILITY_STATEMENT_URI,
  APPLICANT_DETAILS_PAGE_URI,
  CONFIRMATION_PAGE_URI,
  ROOT_URI
} from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { loggerInstance } from '../utils/Logger';
import { urlMatches } from '../utils/UriMatcher';

export function NavigationMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    const url: string = req.originalUrl;
    const exemptions: string[] = [ ROOT_URI, APPLICANT_DETAILS_PAGE_URI , ACCESSIBILITY_STATEMENT_URI ];
    const exempt: boolean = exemptions.some(exemption => urlMatches(exemption, url));

    if (exempt) {
      loggerInstance().info(`${NavigationMiddleware.name} - ${url} exempt from navigation protection. Passing through.`);
      return next();
    }

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);
    const navigationPermissions: string[] | undefined = session?.navigationPermissions;

    if (urlMatches(CONFIRMATION_PAGE_URI, url)) {
      const applicationReference: string | undefined = session?.previousApplicationReference;
      if (applicationReference) {
        return next();
      }
    }

    if (!navigationPermissions || navigationPermissions.length === 0) {
      loggerInstance().info(`${NavigationMiddleware.name} - user has no navigation permissions. Redirecting to service start.`);
      return res.redirect(APPLICANT_DETAILS_PAGE_URI);

    } else if (!navigationPermissions.includes(url)) {
      const redirectUrl: string = navigationPermissions[navigationPermissions.length - 1]
      loggerInstance().info(`${NavigationMiddleware.name} - user has insufficient permissions for ${url}. Redirecting back to ${redirectUrl}.`);
      return res.redirect(redirectUrl);
    }

    return next();
  }
}
