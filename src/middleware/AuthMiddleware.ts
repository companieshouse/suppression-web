import { NextFunction, Request, RequestHandler, Response } from 'express';
import { authMiddleware, AuthOptions } from 'web-security-node';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../routes/paths';
import { newUriFactory } from '../utils/UriFactory';


export function AuthMiddleware(): RequestHandler {

  return (req: Request, res: Response, next: NextFunction): any => {

    if (req.originalUrl === ROOT_URI) {
      return next();
    }

    const authOptions: AuthOptions = {
      returnUrl: newUriFactory(req).createAbsoluteUri(APPLICANT_DETAILS_PAGE_URI),
      accountWebUrl: getConfigValue('CHS_URL') as string
    }

    return authMiddleware(authOptions)(req, res, next);
  }
}
