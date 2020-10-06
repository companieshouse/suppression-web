import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { ApplicantDetails, SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/suppressionSessionModel';
import { YesNo } from '../models/YesNo';
import { ADDRESS_TO_REMOVE_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormWithDateValidator } from '../validators/FormWithDateValidator';
import { schema as formSchema } from '../validators/schema/ApplicantDetailsSchema';

const template = 'applicant-details';
const backNavigation = ROOT_URI;
const missingDateErrorMessage: string = 'Date of birth is required';

export class ApplicantDetailsController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService, private validator: FormWithDateValidator = new FormWithDateValidator(
    formSchema, missingDateErrorMessage
  )) {
    this.suppressionService = suppressionService
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSession(req);

    const accessToken: string = SessionService.getAccessToken(req);

    res.render(template, {
      ...this.getApplicantDetails(session?.applicationReference, accessToken),
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const validationResult: ValidationResult = await this.validator.validate(req);

    if (req.body.hasPreviousName === YesNo.no){
      req.body.previousName = '';
    }

    if (validationResult.errors.length > 0) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      return res.render(template, {
        ...req.body,
        validationResult,
        backNavigation
      });
    }

    const dateOfBirth = moment(req.body.date).format('YYYY-MM-DD');
    delete req.body.date;

    const applicantDetails = {
      ...req.body,
      dateOfBirth
    } as ApplicantDetails;

    let suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);
    if (!suppressionData) {
      suppressionData = { applicantDetails } as SuppressionData;
    } else {
      suppressionData.applicantDetails = applicantDetails;
    }

    const accessToken: string = SessionService.getAccessToken(req);
    const applicationReference: string = await this.suppressionService.save(suppressionData, accessToken);

    SessionService.setSession(req, { applicationReference });

    res.redirect(ADDRESS_TO_REMOVE_PAGE_URI);
  };

  private async getApplicantDetails(applicationReference: string | undefined, accessToken: string): Promise<any> {

    if (!applicationReference) {
      return {};
    }

    const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference, accessToken);
    const applicantDetails = suppressionData.applicantDetails;

    const [year, month, day] = applicantDetails.dateOfBirth.split('-', 3);

    return {...applicantDetails, day, month, year};
  }
}
