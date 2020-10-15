import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { CHECK_SUBMISSION_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema';

const template: string = 'contact-details';
const backNavigation: string = SERVICE_ADDRESS_PAGE_URI;

export class ContactDetailsController {

  private validator: FormValidator;
  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.validator = new FormValidator(formSchema);
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${ContactDetailsController.name} - session expected but none found`));
      }

      const accessToken: string = SessionService.getAccessToken(req);

      const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference, accessToken);

      res.render(template, {
        ...suppressionData.contactAddress,
        backNavigation
      });

    } catch(error) {
      return next(new Error(`${ContactDetailsController.name} - ${error}`));
    }

  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
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

      const partialSuppressionData: SuppressionData = { contactAddress: req.body } as SuppressionData;

      const accessToken: string = SessionService.getAccessToken(req);

      try {
        await this.suppressionService.patch(partialSuppressionData, session.applicationReference, accessToken)
      } catch (err) {
        return next(new Error(`${ContactDetailsController.name} - ${err}`));
      }

      res.redirect(CHECK_SUBMISSION_PAGE_URI);
    }
  };
}
