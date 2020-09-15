import { Router } from 'express';
import { AddressToRemoveController } from '../controllers/AddressToRemoveController';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { PaymentReviewController } from '../controllers/PaymentReviewController';
import { StartPageController } from '../controllers/StartPageController';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PaymentService } from '../services/payment/PaymentService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI
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
const paymentReviewController = new PaymentReviewController(suppressionService, paymentService);

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

routes.get(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.renderView);
routes.post(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.continue);
