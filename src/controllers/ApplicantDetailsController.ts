import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { ApplicantDetails, SuppressionData } from '../models/SuppressionDataModel'
import { YesNo } from '../models/YesNo';
import { ADDRESS_TO_REMOVE_PAGE_URI, ROOT_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormWithDateValidator } from '../validators/FormWithDateValidator';
import { schema as formSchema } from '../validators/schema/ApplicantDetailsSchema'

const template = 'applicant-details';
const backNavigation = ROOT_URI;
const missingDateErrorMessage: string = 'Date of birth is required';

export class ApplicantDetailsController {

  constructor(private validator: FormWithDateValidator = new FormWithDateValidator(
    formSchema, missingDateErrorMessage
  )) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionData = SessionService.getSuppressionSession(req);

    res.render(template, {
      ...this.getApplicantDetails(suppressionData),
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

    const applicantDetails = {
      ...req.body,
      dateOfBirth: moment(req.body.date).format('YYYY-MM-DD')
    } as ApplicantDetails;

    let session = SessionService.getSuppressionSession(req);
    if (!session) {
      session = { applicantDetails } as SuppressionData;
    } else {
      session.applicantDetails = applicantDetails;
    }

    SessionService.setSuppressionSession(req, session);
    res.redirect(ADDRESS_TO_REMOVE_PAGE_URI);
  };

  private getApplicantDetails(suppression: SuppressionData | undefined): any {

    const applicantDetails: ApplicantDetails | undefined = suppression?.applicantDetails;
    if (!applicantDetails) {
      return {};
    }
    const [year, month, day] = applicantDetails.dateOfBirth.split('-', 3);

    return {...applicantDetails, day, month, year};
  }
}
