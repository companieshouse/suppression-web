import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApplicantDetails, SuppressionData } from '../models/SuppressionDataModel'
import { YesNo } from '../models/YesNo';
import { ADDRESS_TO_REMOVE_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { ValidationError } from '../utils/validation/ValidationError';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/ApplicantDetailsSchema'

const template = 'applicant-details';
const previousURL = ROOT_URI;

export class ApplicantDetailsController {

  constructor(private validator: FormValidator = new FormValidator(formSchema)) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const session = SessionService.getSuppressionSession(req);
    res.render(template, { ...session?.applicantDetails, backNavigation: previousURL });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const validationResult: ValidationResult = await this.validator.validate(req);

    if (req.body.hasPreviousName === YesNo.no){
      req.body.previousName = '';
    }

    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult,
        backNavigation: previousURL
      });
    } else {
      const session = SessionService.getSuppressionSession(req);
      if (!session) {
        const newSession = { applicantDetails: req.body as ApplicantDetails } as SuppressionData;
        SessionService.setSuppressionSession(req, newSession);
      } else {
        session.applicantDetails = req.body as ApplicantDetails;
        SessionService.setSuppressionSession(req, session);
      }

      res.redirect(ADDRESS_TO_REMOVE_PAGE_URI);
    }
  };
}
