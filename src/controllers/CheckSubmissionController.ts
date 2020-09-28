import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { CHECK_SUBMISSION_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'

const template = 'check-submission';

export class CheckSubmissionController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const session = SessionService.getSuppressionSession(req);

    if (!session?.serviceAddress) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }

    res.render(template, {
      ...session
    });
  }

  public confirm = async (req: Request, res: Response, next: NextFunction) => {
    return res.redirect(CHECK_SUBMISSION_PAGE_URI);
  };
}
