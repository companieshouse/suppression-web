import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { SuppressionData } from '../models/SuppressionDataModel'
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { APPLICANT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema'

const template = 'address-to-remove';
const backNavigation = APPLICANT_DETAILS_PAGE_URI;

export class AddressToRemoveController {

  private suppressionService: SuppressionService;
  private validator: FormValidator;

  constructor(suppressionService: SuppressionService) {
    this.validator = new FormValidator(formSchema);
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
      return next(new Error(`${AddressToRemoveController.name} - session expected but none found`));
    }

    const accessToken: string = SessionService.getAccessToken(req);

    const templateData = await this.getAddressToRemove(session.applicationReference, accessToken)
      .catch((error) => {
        return next(new Error(`${AddressToRemoveController.name} - ${error}`));
      });

    res.render(template, {
      ...templateData,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
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

      const partialSuppressionData: SuppressionData = { addressToRemove: req.body } as SuppressionData;

      const accessToken: string = SessionService.getAccessToken(req);

      await this.suppressionService.patch(partialSuppressionData, session?.applicationReference! , accessToken).catch(error => {
        return next(error)
      });

      res.redirect(DOCUMENT_DETAILS_PAGE_URI);
    }
  };

  private async getAddressToRemove(applicationReference: string | undefined, accessToken: string): Promise<any> {

    if (!applicationReference) {
      return {};
    }

    const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference, accessToken)
      .catch(reason => {
        throw new Error(`${AddressToRemoveController.name} - ${reason} `);
      });

    return {...suppressionData.addressToRemove};
  }

}
