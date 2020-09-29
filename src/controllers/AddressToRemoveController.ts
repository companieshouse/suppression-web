import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address, SuppressionData } from '../models/SuppressionDataModel'
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

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${AddressToRemoveController.name} - session expected but none found`));
    }

    res.render(template, {
      ...suppressionData?.addressToRemove,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${AddressToRemoveController.name} - session expected but none found`));
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
      suppressionData.addressToRemove = req.body as Address;
      SessionService.setSuppressionSession(req, suppressionData);
      res.redirect(DOCUMENT_DETAILS_PAGE_URI);
    }
  };
}
