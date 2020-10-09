import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address, SuppressionData } from '../models/SuppressionDataModel'
import { SuppressionSession } from '../models/suppressionSessionModel';
import { CONTACT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema';

const template = 'service-address';
const backNavigation = DOCUMENT_DETAILS_PAGE_URI;

export class ServiceAddressController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSession(req);

    if (!session) {
      return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
    }

    const accessToken: string = SessionService.getAccessToken(req);

    const templateData = await this.getServiceAddress(session.applicationReference, accessToken)
      .catch((error) => {
        return next(new Error(`${ServiceAddressController.name} - ${error}`));
      });

    res.render(template, {
      ...templateData,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const session: SuppressionSession | undefined = SessionService.getSession(req);

    if (!session) {
      return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
    }

    const partialSuppressionData: SuppressionData = { serviceAddress: req.body } as SuppressionData;

    const accessToken: string = SessionService.getAccessToken(req);

    await this.suppressionService.patch(partialSuppressionData, session?.applicationReference! , accessToken).catch(error => {
      return next(error)
    });

    res.redirect(CONTACT_DETAILS_PAGE_URI);

  };

  private async getServiceAddress(applicationReference: string | undefined, accessToken: string): Promise<any> {

    if (!applicationReference) {
      return {};
    }

    const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference, accessToken)
      .catch(reason => {
        throw new Error(`${ServiceAddressController.name} - ${reason} `);
      });

    if (!suppressionData.serviceAddress){
      return {};
    }

    return {...suppressionData.serviceAddress};
  }
}
