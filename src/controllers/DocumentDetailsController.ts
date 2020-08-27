import { NextFunction, Request, Response } from 'express';

import { schema } from '../models/schemas/DocumentDetails.schema';
import { DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import { FormValidator } from '../validators/FormValidator';

const template = 'document-details';

export class DocumentDetailsController {

  constructor(private validator: FormValidator = new FormValidator(schema)) {
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => res.render(template);

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    req.body.date = new Date(
      `${req.body[req.body.year]}-${req.body.month}-${req.body.day}`);

    const validationResult = await this.validator.validate(req);

    if (validationResult.errors.length > 0) {
      res.status(422);
      return res.render(template, {
        ...req.body,
        validationResult
      });
    }
    res.redirect(DOCUMENT_DETAILS_PAGE_URI);
  }
}
