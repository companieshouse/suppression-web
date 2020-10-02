import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build';
import { Address, SuppressionData } from '../models/SuppressionDataModel';
import { CHECK_SUBMISSION_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema';

const template = 'contact-details';
const backNavigation = SERVICE_ADDRESS_PAGE_URI;

export class ContactDetailsController {

  constructor(private validator: FormValidator = new FormValidator(formSchema)) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${ContactDetailsController.name} - session expected but none found`));
    }

    res.render(template, {
      ...suppressionData.contactAddress,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${ContactDetailsController.name} - session expected but none found`));
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
      suppressionData.contactAddress = req.body as Address;
      SessionService.setSuppressionSession(req, suppressionData);
      res.redirect(CHECK_SUBMISSION_PAGE_URI);
    }
  };
}
