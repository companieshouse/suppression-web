import { Router } from 'express';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { StartPageController } from '../controllers/StartPageController';
import { APPLICANT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI, ROOT_URI } from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const applicantDetailsController = new ApplicantDetailsController();
const documentDetailsController = new DocumentDetailsController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);
routes.post(ROOT_URI, startPageController.start);

routes.get(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.renderView);
routes.post(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.processForm);

routes.get(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.renderView);
routes.post(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.processForm);
