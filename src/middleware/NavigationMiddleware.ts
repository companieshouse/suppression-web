import { NextFunction, Request, RequestHandler, Response } from 'express';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { ACCESSIBILITY_STATEMENT_URI, APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { urlMatches } from '../utils/UriMatcher';

export function NavigationMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    const url: string = req.originalUrl;
    const exemptions: string[] = [ ROOT_URI, APPLICANT_DETAILS_PAGE_URI , ACCESSIBILITY_STATEMENT_URI ];
    const exempt: boolean = exemptions.some(exemption => urlMatches(exemption, url));

    if (exempt) {
      return next();
    }

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);
    const navigationPermissions: string[] | undefined = session?.navigationPermissions;

    if (!navigationPermissions || navigationPermissions.length === 0) {
      return res.redirect(APPLICANT_DETAILS_PAGE_URI);

    } else if (!navigationPermissions.includes(url)) {
      return res.redirect(navigationPermissions[navigationPermissions.length - 1]);
    }

    return next();
  }
}
