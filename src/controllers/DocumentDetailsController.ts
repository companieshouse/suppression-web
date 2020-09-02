import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { DocumentDetails, SuppressionData } from '../models/SuppressionDataModel';
import { DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/SessionService';
import { DocumentDetailsValidator } from '../validators/DocumentDetailsValidator';

const template = 'document-details';

export class DocumentDetailsController {

  constructor(private dateValidator: DocumentDetailsValidator = new DocumentDetailsValidator()) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    const suppressionData = SessionService.getSuppressionSession(req);

    res.render(template, { ...this.getDocumentDetails(suppressionData) });
  }

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const validationResult = await this.dateValidator.validate(req);

    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult
      });
    }

    const suppression: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    const updatedSession: SuppressionData = {
      ...suppression,
      documentDetails: {
        ...req.body,
        date: moment(req.body.date).format('YYYY-MM-DD')
      } as DocumentDetails
    } as SuppressionData

    SessionService.setSuppressionSession(req, updatedSession)
    res.redirect(DOCUMENT_DETAILS_PAGE_URI);
  }

  private getDocumentDetails(suppression: SuppressionData | undefined): any {

    const documentDetails: DocumentDetails | undefined = suppression?.documentDetails;
    if (!documentDetails) {
      return {};
    }
    const [year, month, day] = documentDetails.date.split('-', 3);

    return {...documentDetails, day, month, year};
  }
}
