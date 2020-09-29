import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address } from '../models/SuppressionDataModel'
import { APPLICANT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema'

const template = 'address-to-remove';
const backNavigation = APPLICANT_DETAILS_PAGE_URI;

export class AddressToRemoveController {

  constructor(private validator: FormValidator = new FormValidator(formSchema)) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionSession = SessionService.getSuppressionSession(req);

    if (!suppressionSession) {
      return next(new Error('Session expected, but not found'));
    }

    res.render(template, {
      ...suppressionSession?.addressToRemove,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const suppressionSession = SessionService.getSuppressionSession(req);

    if (!suppressionSession) {
      return next(new Error('Session expected, but not found'));
    }

    const validationResult: ValidationResult = await this.validator.validate(req);
    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult,
        backNavigation
      });
    } else {
      suppressionSession.addressToRemove = req.body as Address;
      SessionService.setSuppressionSession(req, suppressionSession);
      res.redirect(DOCUMENT_DETAILS_PAGE_URI);
    }
  };
}
