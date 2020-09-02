import { Router } from 'express';
import { AddressToRemoveController } from '../controllers/AddressToRemoveController';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController';
import { StartPageController } from '../controllers/StartPageController';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  ROOT_URI
} from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const applicantDetailsController = new ApplicantDetailsController();
const addressToRemoveController = new AddressToRemoveController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);
routes.post(ROOT_URI, startPageController.start);

routes.get(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.renderView);
routes.post(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.processForm);

routes.get(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.renderView);
routes.post(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.processForm);
