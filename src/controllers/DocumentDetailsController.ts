import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import {  DocumentDetails, SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { ADDRESS_TO_REMOVE_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import { FormWithDateValidator } from '../validators/FormWithDateValidator';
import { schema } from '../validators/schema/DocumentDetailsSchema';

const template: string = 'document-details';
const backNavigation: string = ADDRESS_TO_REMOVE_PAGE_URI;
const continueNavigation: string = SERVICE_ADDRESS_PAGE_URI;
const missingDateErrorMessage: string = 'Enter the date the document was added to the register';

export class DocumentDetailsController {

  private suppressionService: SuppressionService;
  private validator: FormWithDateValidator;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService;
    this.validator = new FormWithDateValidator(schema, missingDateErrorMessage);
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {

      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${DocumentDetailsController.name} - session expected but none found`));
      }

      const accessToken: string = SessionService.getAccessToken(req);
      const refreshToken: string = SessionService.getRefreshToken(req);

      const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference, accessToken, refreshToken);
      const documentDetails: DocumentDetails = suppressionData.documentDetails;

      if (documentDetails) {
        const [year, month, day] = documentDetails.date.split('-', 3);

        res.render(template, {
          ...documentDetails, day, month, year,
          backNavigation
        });

      } else {
        res.render(template, {
          backNavigation
        });
      }

    } catch (err) {
      return next(new Error(`${DocumentDetailsController.name} - ${err}`));
    }

  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
      return next(new Error(`${DocumentDetailsController.name} - session expected but none found`));
    }

    const validationResult = await this.validator.validate(req);

    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult,
        backNavigation
      });
    }

    const date = moment(req.body.date).format('YYYY-MM-DD');

    const documentDetails: DocumentDetails = {
      ...req.body,
      date
    } as DocumentDetails;

    const partialSuppressionData: SuppressionData = { documentDetails } as SuppressionData;

    const accessToken: string = SessionService.getAccessToken(req);
    const refreshToken: string = SessionService.getRefreshToken(req);

    try {
      await this.suppressionService.patch(partialSuppressionData, session.applicationReference, accessToken, refreshToken);
    } catch (err) {
      return next(new Error(`${DocumentDetailsController.name} - ${err}`));
    }

    SessionService.appendNavigationPermissions(req, continueNavigation);

    res.redirect(continueNavigation);

  };

}
