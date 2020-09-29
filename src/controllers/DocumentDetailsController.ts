import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { DocumentDetails, SuppressionData } from '../models/SuppressionDataModel';
import { ADDRESS_TO_REMOVE_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { FormWithDateValidator } from '../validators/FormWithDateValidator';
import { schema } from '../validators/schema/DocumentDetailsSchema';

const template = 'document-details';
const missingDateErrorMessage: string = 'Document date is required';

export class DocumentDetailsController {

  constructor(private validator: FormWithDateValidator = new FormWithDateValidator(
    schema, missingDateErrorMessage
  )) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    const suppressionData = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error('Session expected, but not found'));
    }

    res.render(template, {
      ...this.getDocumentDetails(suppressionData),
      backNavigation: ADDRESS_TO_REMOVE_PAGE_URI
    });
  }

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const validationResult = await this.validator.validate(req);

    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult,
        backNavigation: ADDRESS_TO_REMOVE_PAGE_URI
      });
    }

    let suppression: SuppressionData | undefined = SessionService.getSuppressionSession(req);
    if (suppression === undefined) {
      suppression = {} as SuppressionData;
    }

    suppression.documentDetails = {
      ...req.body,
      date: moment(req.body.date).format('YYYY-MM-DD')
    } as DocumentDetails;

    SessionService.setSuppressionSession(req, suppression);
    res.redirect(SERVICE_ADDRESS_PAGE_URI);
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
