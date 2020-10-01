import { Router } from 'express';

import { AddressToRemoveController } from '../controllers/AddressToRemoveController';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController';
import { CheckSubmissionController } from '../controllers/CheckSubmissionController';
import { ContactDetailsController } from '../controllers/ContactDetailsController';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { HealthcheckController } from '../controllers/HealthcheckController';
import { PaymentReviewController } from '../controllers/PaymentReviewController';
import { ServiceAddressController } from '../controllers/ServiceAddressController';
import { StartPageController } from '../controllers/StartPageController';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PaymentService } from '../services/payment/PaymentService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  CHECK_SUBMISSION_PAGE_URI,
  CONTACT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  HEALTHCHECK_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI,
  SERVICE_ADDRESS_PAGE_URI
} from './paths';

export const routes = Router();

/**
 * Services
 */
const suppressionService: SuppressionService = new SuppressionService(getConfigValue('SUPPRESSIONS_API_URL') as string);
const paymentService: PaymentService = new PaymentService();

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const applicantDetailsController = new ApplicantDetailsController();
const addressToRemoveController = new AddressToRemoveController();
const documentDetailsController = new DocumentDetailsController();
const serviceAddressController = new ServiceAddressController();
const contactDetailsController = new ContactDetailsController();
const checkSubmissionController = new CheckSubmissionController();
const paymentReviewController = new PaymentReviewController(suppressionService, paymentService);

const healthcheckController = new HealthcheckController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);
routes.post(ROOT_URI, startPageController.start);

routes.get(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.renderView);
routes.post(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.processForm);

routes.get(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.renderView);
routes.post(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.processForm);

routes.get(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.renderView);
routes.post(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.processForm);

routes.get(SERVICE_ADDRESS_PAGE_URI, serviceAddressController.renderView);
routes.post(SERVICE_ADDRESS_PAGE_URI, serviceAddressController.processForm);

routes.get(CONTACT_DETAILS_PAGE_URI, contactDetailsController.renderView);
routes.post(CONTACT_DETAILS_PAGE_URI, contactDetailsController.processForm);

routes.get(CHECK_SUBMISSION_PAGE_URI, checkSubmissionController.renderView);
routes.post(CHECK_SUBMISSION_PAGE_URI, checkSubmissionController.confirm);

routes.get(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.renderView);
routes.post(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.continue);

routes.get(HEALTHCHECK_URI, healthcheckController.healthcheck);
