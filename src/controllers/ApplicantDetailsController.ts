import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { ApplicantDetails, SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { YesNo } from '../models/YesNo';
import { ADDRESS_TO_REMOVE_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormWithDateValidator } from '../validators/FormWithDateValidator';
import { schema as formSchema } from '../validators/schema/ApplicantDetailsSchema';

const template: string = 'applicant-details';
const backNavigation: string = ROOT_URI;
const missingDateErrorMessage: string = 'Date of birth is required';

export class ApplicantDetailsController {

  private suppressionService: SuppressionService;
  private validator: FormWithDateValidator;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService;
    this.validator = new FormWithDateValidator(formSchema, missingDateErrorMessage);
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {

      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      const accessToken: string = SessionService.getAccessToken(req);

      const templateData: ApplicantDetails = await this.getApplicantDetails(session?.applicationReference, accessToken)

      res.render(template, {
        ...templateData,
        backNavigation
      });

    } catch (err) {
      return next(new Error(`${ApplicantDetailsController.name} - ${err}`));
    }

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

    const applicantDetails: ApplicantDetails = {
      ...req.body,
      dateOfBirth
    } as ApplicantDetails;

    const partialSuppressionData: SuppressionData = { applicantDetails } as SuppressionData;

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);
    const accessToken: string = SessionService.getAccessToken(req);

    console.log(session)

    try {
      if (session?.applicationReference) {
        await this.suppressionService.patch(partialSuppressionData, session.applicationReference, accessToken);
      } else {
        const applicationReference: string = await this.suppressionService.save(applicantDetails, accessToken);
        SessionService.setSuppressionSession(req, { applicationReference });
      }
    } catch (error) {
      return next(new Error(`${ApplicantDetailsController.name} - ${error}`));
    }

    res.redirect(ADDRESS_TO_REMOVE_PAGE_URI);
  };

  private async getApplicantDetails(applicationReference: string | undefined, accessToken: string): Promise<any> {

    if (!applicationReference) {
      return {};
    }

    const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference, accessToken);

    const applicantDetails = suppressionData.applicantDetails;

    if (!applicantDetails) {
      return {};
    }

    const [year, month, day] = applicantDetails.dateOfBirth.split('-', 3);

    let hasPreviousName: YesNo = YesNo.no;
    if (applicantDetails.previousName) {
      hasPreviousName = YesNo.yes
    }

    return {...applicantDetails, hasPreviousName, day, month, year};
  }
}
