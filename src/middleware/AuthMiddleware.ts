import { authMiddleware, AuthOptions } from '@companieshouse/web-security-node';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { ACCESSIBILITY_STATEMENT_URI, APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import { newUriFactory } from '../utils/UriFactory';
import { urlMatches } from '../utils/UriMatcher';

export function AuthMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    const url: string = req.originalUrl;
    const exemptions: string[] = [ ROOT_URI, ACCESSIBILITY_STATEMENT_URI ];
    const exempt: boolean = exemptions.some(exemption => urlMatches(exemption, url));
    if (exempt) {
      return next();
    }

    const authOptions: AuthOptions = {
      returnUrl: newUriFactory(req).createAbsoluteUri(APPLICANT_DETAILS_PAGE_URI),
      accountWebUrl: getConfigValue('CHS_URL') as string
    }

    return authMiddleware(authOptions)(req, res, next);
  }
}
