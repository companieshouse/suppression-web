import { Router } from 'express';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController'
import { StartPageController } from '../controllers/StartPageController';
import { DOCUMENT_DETAILS_PAGE_URI, ROOT_URI } from './paths';
import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const documentDetailsController = new DocumentDetailsController();
const applicantDetailsController = new ApplicantDetailsController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);
routes.post(ROOT_URI, startPageController.start);
routes.get(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.renderView);
routes.post(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.processForm);

routes.get(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.renderView);
routes.post(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.processForm);
