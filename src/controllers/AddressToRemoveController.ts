import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address } from '../models/SuppressionDataModel'
import { ADDRESS_TO_REMOVE_PAGE_URI } from '../routes/paths';
import SessionService from '../services/SessionService'
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema'

const template = 'address-to-remove';

export class AddressToRemoveController {

  constructor(private validator: FormValidator = new FormValidator(formSchema)) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const session = SessionService.getSuppressionSession(req);
    res.render(template, { ...session?.addressToRemove });
  }

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const validationResult: ValidationResult = await this.validator.validate(req);
    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult
      });
    } else {
      const session = SessionService.getSuppressionSession(req);
      if (!session) {
        throw new Error('Expected session but none found');
      } else {
        session.addressToRemove = req.body as Address;
        SessionService.setSuppressionSession(req, session);
      }
      res.redirect(ADDRESS_TO_REMOVE_PAGE_URI);
    }
  };
}
