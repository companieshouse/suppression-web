import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { APPLICANT_DETAILS_PAGE_URI } from '../routes/paths';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/ApplicantDetailsSchema'

const template = 'applicant-details';

export class ApplicantDetailsController {

  constructor(private validator: FormValidator = new FormValidator(formSchema)) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => res.render(template);

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const validationResult: ValidationResult = await this.validator.validate(req);
    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult
      });
    } else {
      res.redirect(APPLICANT_DETAILS_PAGE_URI);
    }
  };
}
